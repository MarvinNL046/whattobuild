import { Suspense } from "react";
import { SearchForm } from "@/components/dashboard/search-form";
import { QueryList } from "@/components/dashboard/query-list";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          What do you want to explore?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a niche and we'll find real pain points from Reddit, reviews, and forums.
        </p>
      </div>

      <Suspense>
        <SearchForm />
      </Suspense>

      <Separator />

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Recent research
        </h2>
        <QueryList />
      </div>
    </div>
  );
}
