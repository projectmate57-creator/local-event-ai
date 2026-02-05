import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

const dateRanges = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
] as const;

const sortOptions = [
  { value: "soonest", label: "Soonest" },
  { value: "newest", label: "Newest" },
] as const;

export function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput("");
    onFiltersChange({ ...filters, search: undefined });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 space-y-4"
    >
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search events by title, venue, or city..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-12 pl-12 pr-12 text-base"
        />
        {searchInput && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date range pills */}
        <div className="flex flex-wrap gap-2">
          {dateRanges.map((range) => (
            <Button
              key={range.value}
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  dateRange: range.value as EventFilters["dateRange"],
                })
              }
              className={cn(
                "rounded-full transition-all",
                filters.dateRange === range.value &&
                  "border-primary bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {range.label}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Sort options */}
        <div className="flex gap-2">
          {sortOptions.map((sort) => (
            <Button
              key={sort.value}
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  sortBy: sort.value as EventFilters["sortBy"],
                })
              }
              className={cn(
                "rounded-full transition-all",
                filters.sortBy === sort.value &&
                  "border-primary bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {sort.label}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
