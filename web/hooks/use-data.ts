// web/hooks/use-data.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardFilters, Listing, Review } from "@/lib/types";

// Helper function to fetch JSON from our FastAPI backend
const fetcher = async (url: string) => {
  // We use a relative URL, which will work perfectly when deployed
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return res.json();
};

// Hook 1: Get all listings (for the filter dropdown)
export function useListings() {
  return useQuery<Listing[]>({
    queryKey: ["listings"], // A unique key for this query
    queryFn: () => fetcher("/api/listings"), // The API endpoint
  });
}

// Hook 2: Get reviews based on the current filters
export function useReviews(filters: DashboardFilters) {
  // Build a query string from the filters state
  const params = new URLSearchParams();
  if (filters.listingId !== "all") {
    params.append("listing_id", filters.listingId.toString());
  }
  if (filters.minRating !== "all") {
    params.append("min_rating", filters.minRating.toString());
  }
  if (filters.channel !== "all") {
    params.append("channel", filters.channel);
  }

  const queryString = params.toString();

  return useQuery<Review[]>({
    // The query key *must* include the filters
    // This tells react-query to refetch when the filters change
    queryKey: ["reviews", queryString],
    queryFn: () => fetcher(`/api/reviews?${queryString}`),
  });
}

// Hook 3: The "mutation" to approve/unapprove a review
export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      isApproved,
    }: {
      reviewId: number;
      isApproved: boolean;
    }) => {
      // Call our PATCH endpoint
      const res = await fetch(
        `/api/reviews/${reviewId}/approve?is_approved=${isApproved}`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to update review status");
      }
      return res.json();
    },
    // After a successful update...
    onSuccess: () => {
      // ...tell react-query to refetch all review data to update the UI
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useSyncGoogleReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: number) => {
      const res = await fetch(`/api/google/sync/${listingId}`, {
        method: "POST",
      });
      if (!res.ok) {
        // Try to parse the error message from our FastAPI backend
        const err = await res.json();
        throw new Error(err.detail || "Failed to sync reviews");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Show a browser alert and refetch reviews
      alert(`Sync complete! Added ${data.new_reviews_added} new reviews.`);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      // Show the error from our `throw new Error`
      alert(`Sync failed: ${error.message}`);
    },
  });
}