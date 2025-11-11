import json
from sqlmodel import Session
from .database import engine, create_db_and_tables
from .models import Listing, Review, ReviewCategoryRating
from datetime import datetime

def normalize_and_seed():
    print("Creating database and tables...")
    create_db_and_tables()
    print("Seeding data...")

    with Session(engine) as session:
        # Load the mock JSON
        with open('api/mock_reviews.json', 'r') as f:
            data = json.load(f)

        for raw_review in data.get("result", []):
            # 1. Skip if not a guest review or already processed
            if raw_review.get("type") != "guest-to-host": 
                # Assuming we only care about guest reviews. Adjust if needed.
                continue 

            existing_review = session.get(Review, raw_review["id"])
            if existing_review:
                continue # Skip if already in DB

            # 2. Find or create the Listing
            listing_name = raw_review["listingName"]
            listing = session.query(Listing).filter(Listing.name == listing_name).first()
            if not listing:
                listing = Listing(name=listing_name)
                session.add(listing)
                session.commit()
                session.refresh(listing)

            # 3. Normalize Rating
            # Calculate overall rating from categories
            total_rating = 0
            category_count = 0
            categories = raw_review.get("reviewCategory", [])
            if categories:
                for cat in categories:
                    total_rating += cat.get("rating", 0)
                    category_count += 1

            overall_rating = (total_rating / category_count) if category_count > 0 else 0.0

            # Use Hostaway's top-level rating if available
            if raw_review.get("rating") is not None:
                overall_rating = float(raw_review["rating"])

            # 4. Create the Review object
            new_review = Review(
                hostaway_id=raw_review["id"],
                guest_name=raw_review["guestName"],
                review_text=raw_review.get("publicReview", ""),
                submitted_at=datetime.strptime(raw_review["submittedAt"], "%Y-%m-%d %H:%M:%S"),
                overall_rating=overall_rating,
                listing_id=listing.id,
                channel=raw_review.get("channelName", "hostaway") # Assuming channelName exists in full data
            )
            session.add(new_review)
            session.commit()
            session.refresh(new_review)

            # 5. Add Category Ratings
            for cat in categories:
                category_rating = ReviewCategoryRating(
                    category=cat["category"],
                    rating=cat["rating"],
                    review_id=new_review.id
                )
                session.add(category_rating)

        session.commit()
    print("Data seeding complete.")

if __name__ == "__main__":
    normalize_and_seed()