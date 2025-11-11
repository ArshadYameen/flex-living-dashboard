"use client";

import React from "react";
// Add useSyncGoogleReviews
import { useListings, useSyncGoogleReviews } from "@/hooks/use-data";
import { DashboardFilters } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import the Button

interface FiltersProps {
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
}

export function Filters({ filters, setFilters }: FiltersProps) {
  const { data: listings, isLoading: isLoadingListings } = useListings();
  // Get the new sync function
  const { mutate: syncReviews, isPending: isSyncing } = useSyncGoogleReviews();

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    // ... (your existing handleFilterChange function)
    let processedValue: number | string | "all" = value;
    if (key === "listingId" || key === "minRating") {
      processedValue = value === "all" ? "all" : Number(value);
    }
    setFilters((prev) => ({
      ...prev,
      [key]: processedValue,
    }));
  };

  const handleSyncClick = () => {
    if (filters.listingId !== "all") {
      syncReviews(filters.listingId);
    }
  };

  return (
    // Update the layout to make room for the button
    <div className="flex flex-wrap items-end gap-4">
      {/* Property Filter */}
      <div className="grid w-full flex-1 max-w-sm items-center gap-1.5">
        <Label htmlFor="property-filter">Property</Label>
        <Select
          value={filters.listingId.toString()}
          onValueChange={(value) => handleFilterChange("listingId", value)}
          disabled={isLoadingListings}
        >
          <SelectTrigger id="property-filter">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {listings?.map((listing) => (
              <SelectItem key={listing.id} value={listing.id.toString()}>
                {listing.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="grid w-full flex-1 max-w-sm items-center gap-1.5">
        <Label htmlFor="rating-filter">Minimum Rating</Label>
        <Select
          value={filters.minRating.toString()}
          onValueChange={(value) => handleFilterChange("minRating", value)}
        >
          <SelectTrigger id="rating-filter">
            <SelectValue placeholder="Select min rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            <SelectItem value="9">9+ Stars</SelectItem>
            {/* ... (rest of the ratings) */}
          </SelectContent>
        </Select>
      </div>

      {/* Channel Filter */}
      <div className="grid w-full flex-1 max-w-sm items-center gap-1.5">
        <Label htmlFor="channel-filter">Channel</Label>
        <Select
          value={filters.channel}
          onValueChange={(value) => handleFilterChange("channel", value)}
        >
          <SelectTrigger id="channel-filter">
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="hostaway">Hostaway</SelectItem>
            <SelectItem value="google">Google</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- NEW SYNC BUTTON --- */}
      {/* Only show the button if a specific property is selected */}
      {filters.listingId !== "all" && (
        <Button onClick={handleSyncClick} disabled={isSyncing}>
          {isSyncing ? "Syncing..." : "Sync Google Reviews"}
        </Button>
      )}
    </div>
  );
}