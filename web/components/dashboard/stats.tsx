"use client";

import React, { useMemo } from "react";
import { useReviews } from "@/hooks/use-data";
import { DashboardFilters } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function Stats({ filters }: { filters: DashboardFilters }) {
  // Get the same filtered data the table will use
  const { data: reviews, isLoading } = useReviews(filters);

  // Memoize calculations to avoid re-running on every render
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: "0.0",
        approvedReviews: 0,
        categoryAverages: [],
      };
    }

    const totalRating = reviews.reduce(
      (acc, review) => acc + review.overall_rating,
      0
    );
    const averageRating = (totalRating / reviews.length).toFixed(1);
    const approvedReviews = reviews.filter(
      (review) => review.is_approved
    ).length;

    // Calculate category averages for the Radar Chart
    const categoryMap = new Map<string, { total: number; count: number }>();
    reviews
      // FIX 1: Add '|| []' to handle reviews with no category_ratings array
      .flatMap((review) => review.category_ratings || [])
      // FIX 2: Add 'filter(Boolean)' to remove any null/undefined entries
      .filter(Boolean)
      .forEach((cat) => {
        // This check ensures 'cat' and 'cat.category' are valid
        if (cat && cat.category) {
          const existing = categoryMap.get(cat.category) || {
            total: 0,
            count: 0,
          };
          categoryMap.set(cat.category, {
            total: existing.total + cat.rating,
            count: existing.count + 1,
          });
        }
      });

    const categoryAverages = Array.from(categoryMap.entries()).map(
      ([name, { total, count }]) => ({
        subject: name
          .split("_")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "), // 'respect_house_rules' -> 'Respect House Rules'
        A: parseFloat((total / count).toFixed(1)),
        fullMark: 10,
      })
    );

    return {
      totalReviews: reviews.length,
      averageRating,
      approvedReviews,
      categoryAverages,
    };
  }, [reviews]);

  // Show a loading state
  if (isLoading) {
    return <StatsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* KPI Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReviews}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageRating} / 10</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Approved for Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approvedReviews}</div>
        </CardContent>
      </Card>

      {/* Category Chart */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={stats.categoryAverages}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <Radar
                dataKey="A"
                name="Average"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// A skeleton loader for the stats section
function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-[100px]" />
      <Skeleton className="h-[100px]" />
      <Skeleton className="h-[100px]" />
      <Skeleton className="h-[100px]" />
      <Skeleton className="col-span-1 h-[300px] md:col-span-2 lg:col-span-4" />
    </div>
  );
}