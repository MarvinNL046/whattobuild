"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { SearchForm, PresetGrid } from "@/components/dashboard/search-form";

export default function DashboardPage() {
  const router = useRouter();

  function handlePresetSelect(preset: { niche: string; types: string[] }) {
    const params = new URLSearchParams();
    params.set("q", preset.niche);
    if (preset.types.length > 0) {
      params.set("types", preset.types.join(","));
    }
    router.replace(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable content area — centered greeting + presets */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 sm:px-6">
        <div className="w-full max-w-2xl space-y-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What do you want to explore?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We dig through thousands of real conversations and reviews across the web — sources most tools never even touch.
            </p>
          </div>

          <PresetGrid onSelect={handlePresetSelect} />
        </div>
      </div>

      {/* Fixed bottom input bar */}
      <div className="shrink-0 border-t bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
          <Suspense>
            <SearchForm hidePresets />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
