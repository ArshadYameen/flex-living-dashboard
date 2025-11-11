// web/components/dashboard/review-table.tsx
"use client";

import React, { useMemo } from "react";
import { useReviews, useListings, useApproveReview } from "@/hooks/use-data";
import { DashboardFilters, Review } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function ReviewTable({ filters }: { filters: DashboardFilters }) {
  const { data: reviews, isLoading: isLoadingReviews } = useReviews(filters);
  const { data: listings, isLoading: isLoadingListings } = useListings();
  
  // Get the mutation function from our hook
  const { mutate: approveReview, isPending: isUpdating } = useApproveReview();

  // Create a simple map of listing IDs to names for easy lookup
  const listingNameMap = useMemo(() => {
    return new Map(listings?.map((listing) => [listing.id, listing.name]));
  }, [listings]);

  // This function is called when a toggle is clicked
  const handleApprovalChange = (review: Review, newApprovalState: boolean) => {
    approveReview({
      reviewId: review.id,
      isApproved: newApprovalState,
    });
  };

  const isLoading = isLoadingReviews || isLoadingListings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Inbox</CardTitle>
        <CardDescription>
          Here are all reviews matching your filters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Approve for Website</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Show skeleton loaders while data is fetching
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : reviews && reviews.length > 0 ? (
              // Render the actual data
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {listingNameMap.get(review.listing_id) || "Unknown"}
                  </TableCell>
                  <TableCell>{review.guest_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{review.channel}</Badge>
                  </TableCell>
                  <TableCell>{review.overall_rating.toFixed(1)}</TableCell>
                  <TableCell className="max-w-xs truncate" title={review.review_text}>
                    {review.review_text}
                  </TableCell>
                  <TableCell>
                    {new Date(review.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={review.is_approved}
                      onCheckedChange={(newState) =>
                        handleApprovalChange(review, newState)
                      }
                      // Disable the switch while an update is in progress
                      disabled={isUpdating}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Show a "no results" message
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No reviews found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}