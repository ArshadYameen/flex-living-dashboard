from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Listing(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    reviews: List["Review"] = Relationship(back_populates="listing")
    google_place_id: Optional[str] = Field(default=None, index=True)
    
    # --- NEW FIELD ADDED ---
    image_url: Optional[str] = Field(default=None)

class ReviewCategoryRating(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str
    rating: int
    review_id: int = Field(foreign_key="review.id")
    review: "Review" = Relationship(back_populates="category_ratings")

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hostaway_id: int = Field(unique=True, index=True) # From the raw JSON
    guest_name: str
    review_text: str
    channel: str = Field(default="hostaway") # To track origin
    submitted_at: datetime

    # Normalized field for easy filtering
    overall_rating: float 

    # The CRITICAL field for the dashboard
    is_approved: bool = Field(default=False) 

    listing_id: int = Field(foreign_key="listing.id")
    listing: Listing = Relationship(back_populates="reviews")

    category_ratings: List[ReviewCategoryRating] = Relationship(back_populates="review")

class ReviewCategoryRatingRead(SQLModel):
    category: str
    rating: int

# Simple model for sending listing data
class ListingRead(SQLModel):
    id: int
    name: str
    
    # --- NEW FIELD ADDED ---
    image_url: Optional[str] = None

# NEW, SIMPLER ReviewRead.
# We are NOT inheriting from Review. This is a clean Pydantic-only model.
class ReviewRead(SQLModel, table=False):
    id: int
    hostaway_id: int
    guest_name: str
    review_text: str
    channel: str
    submitted_at: datetime
    overall_rating: float
    is_approved: bool
    listing_id: int
    
    # Now we add our "read" models for the relationships
    listing: Optional[ListingRead] = None
    category_ratings: List[ReviewCategoryRatingRead] = []