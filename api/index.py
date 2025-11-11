from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from .database import engine, create_db_and_tables
from .models import Review, Listing, ReviewCategoryRating, ReviewRead, ListingRead
from typing import List, Optional
from datetime import datetime
import httpx
import os

app = FastAPI()
GOOGLE_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY")

# Dependency to get DB session
def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    # Creates tables on startup (idempotent)
    create_db_and_tables()

# --- Mandatory Endpoint ---
@app.get("/api/reviews/hostaway")
def get_hostaway_reviews(session: Session = Depends(get_session)):
    """
    Fetches all normalized reviews from our database that originated from Hostaway.
    This fulfills the mandatory route requirement.
    """
    statement = select(Review).where(Review.channel == "hostaway")
    reviews = session.exec(statement).all()
    return reviews

# --- Dashboard Endpoints ---
@app.get("/api/reviews", response_model=List[ReviewRead])
def get_all_reviews(
    session: Session = Depends(get_session),
    listing_id: Optional[int] = None,
    channel: Optional[str] = None,
    min_rating: Optional[float] = None,
    start_date: Optional[datetime] = None
):
    """
    Powers the main dashboard. Supports filtering.
    """
    statement = select(Review).options(
    selectinload(Review.category_ratings),
    selectinload(Review.listing)
    )
    if listing_id:
        statement = statement.where(Review.listing_id == listing_id)
    if channel:
        statement = statement.where(Review.channel == channel)
    if min_rating:
        statement = statement.where(Review.overall_rating >= min_rating)
    if start_date:
        statement = statement.where(Review.submitted_at >= start_date)

    reviews = session.exec(statement.order_by(Review.submitted_at.desc())).all()
    return reviews

@app.patch("/api/reviews/{review_id}/approve")
def approve_review(review_id: int, is_approved: bool, session: Session = Depends(get_session)):
    """
    The core manager action: approve or unapprove a review.
    """
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_approved = is_approved
    session.add(review)
    session.commit()
    session.refresh(review)
    return review

@app.get("/api/listings")
def get_listings(session: Session = Depends(get_session)):
    """
    Helper to populate the property filter dropdown in the dashboard.
    """
    return session.exec(select(Listing)).all()


@app.get("/api/listings/{listing_id}", response_model=ListingRead) # <-- Add response model
def get_listing(listing_id: int, session: Session = Depends(get_session)):
    """
    Gets a single listing by its ID.
    """
    # Use a more robust query instead of session.get()
    statement = select(Listing).where(Listing.id == listing_id)
    listing = session.exec(statement).first() # Use .first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

# --- Public Page Endpoint ---
@app.get("/api/reviews/public/{listing_id}")
def get_public_reviews(listing_id: int, session: Session = Depends(get_session)):
    """
    Powers the public property page.
    Only returns reviews marked as is_approved = True.
    """
    statement = select(Review).where(
        Review.listing_id == listing_id, 
        Review.is_approved == True
    )
    reviews = session.exec(statement.order_by(Review.submitted_at.desc())).all()
    return reviews


@app.post("/api/google/sync/{listing_id}")
async def sync_google_reviews(listing_id: int, session: Session = Depends(get_session)):
    """
    Fetches reviews from Google Places API and saves them to the DB.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key is not configured")

    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if not listing.google_place_id:
        raise HTTPException(status_code=400, detail="Listing has no Google Place ID")

    place_id = listing.google_place_id
    
    # Call the Google Places API
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews&key={GOOGLE_API_KEY}"
    
    # Use httpx to make the API call
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
        response.raise_for_status() # Raise an error if the call failed
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Failed to fetch from Google: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    data = response.json()
    google_reviews = data.get("result", {}).get("reviews", [])
    
    new_reviews_added = 0
    for google_review in google_reviews:
        # Use a unique ID to prevent duplicates.
        # Google's 'time' (as an int) is a good proxy.
        review_hostaway_id = google_review.get("time")
        
        # Check if we've already imported this review
        # We search our 'hostaway_id' field for this unique google timestamp
        statement = select(Review).where(Review.hostaway_id == review_hostaway_id)
        existing_review = session.exec(statement).first()
        
        if existing_review:
            continue # Skip this review, we already have it

        # Normalize the Google Review into our Review model
        new_review = Review(
            hostaway_id=review_hostaway_id,
            guest_name=google_review.get("author_name", "Google User"),
            review_text=google_review.get("text", ""),
            submitted_at=datetime.fromtimestamp(review_hostaway_id),
            
            # Google ratings are 1-5. Our DB is 1-10.
            # We must normalize this.
            overall_rating=float(google_review.get("rating", 0)) * 2.0, 
            
            is_approved=False, # Always require manager approval
            listing_id=listing.id,
            channel="google" # Set the channel
        )
        session.add(new_review)
        new_reviews_added += 1
    
    session.commit()
    
    return {"status": "success", "new_reviews_added": new_reviews_added}
