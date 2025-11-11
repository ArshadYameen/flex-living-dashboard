export const dynamic = 'force-dynamic';

import { Review, Listing } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image"; // <-- 1. IMPORT THE IMAGE COMPONENT

// This is the base URL for our API.
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";

// NEW: Helper function to get a SINGLE listing
async function getListing(listingId: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/listings/${listingId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch listing:", error);
    return null;
  }
}

// UPDATED: Helper function to get *only* public, approved reviews
async function getPublicReviews(listingId: string): Promise<Review[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/reviews/public/${listingId}`,
      {
        cache: "no-store",
      }
    );
    // If the API call fails (like a 422), return an empty array
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch public reviews:", error);
    return [];
  }
}

// This is the React Server Component for the page
export default async function PropertyPage({
  params,
}: {
  params: { listing_id: string };
}) {
  // FIX: Explicitly get the ID from params
  const resolvedParams = await (params as any);
  const listing_id = resolvedParams.listing_id;

  // Safety check in case the param is missing
  if (!listing_id || listing_id === "undefined") {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-500">
          Error: Invalid or missing listing ID.
        </h1>
      </div>
    );
  }

  // Fetch both sets of data in parallel
  const [listing, reviews] = await Promise.all([
    getListing(listing_id),
    getPublicReviews(listing_id),
  ]);

  const listingName = listing?.name || `Property #${listing_id}`;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* 1. Mocked Property Layout */}
      <div className="mb-8">
        
        {/* --- 2. THIS IS THE UPDATED IMAGE SECTION --- */}
        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700 md:h-96">
          {listing?.image_url ? (
            <Image
              src={listing.image_url}
              alt={`Image of ${listingName}`}
              layout="fill"
              objectFit="cover"
              priority // Load this image first
            />
          ) : (
            <span className="flex h-full items-center justify-center text-slate-500">
              [Property Image Placeholder]
            </span>
          )}
        </div>
        {/* --- END OF UPDATED SECTION --- */}

        <h1 className="text-4xl font-bold tracking-tight">{listingName}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A short, elegant description of this wonderful property would go here.
        </p> {/* <-- 3. THIS WAS THE TYPO. NOW FIXED. */}
      </div>

      <Separator />

      {/* 2. Dedicated Guest Reviews Section */}
      <div className="mt-8">
        <h2 className="mb-6 text-3xl font-semibold">Guest Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{review.guest_name}</span>
                    <Badge variant="secondary">
                      {review.overall_rating.toFixed(1)} / 10
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    " {review.review_text} "
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>This property has no approved guest reviews yet.</p>
        )}
      </div>
    </div>
  );
}