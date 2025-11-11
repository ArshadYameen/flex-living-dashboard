// web/app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import { Filters } from "@/components/dashboard/filters";
import { Stats } from "@/components/dashboard/stats";
import { ReviewTable } from "@/components/dashboard/review-table";
import { DashboardFilters } from "@/lib/types";
import { Separator } from "@/components/ui/separator"; // shadcn component

export default function DashboardPage() {
  // This state is the "single source of truth" for the filters.
  const [filters, setFilters] = useState<DashboardFilters>({
    listingId: "all",
    minRating: "all",
    channel: "all",
  });

  return (
    <div className="flex-col md:flex">
      {/* Header Bar */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Flex Living Reviews
          </h1>
          {/* We could add a user menu here later */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        
        {/* 1. The Filter Component */}
        <Filters filters={filters} setFilters={setFilters} />

        <Separator className="my-6" />

        {/* 2. The Stats/Charts Component */}
        <Stats filters={filters} />
        
        <Separator className="my-6" />

        {/* 3. The Review Table Component */}
        <ReviewTable filters={filters} />
      </div>
    </div>
  );
}