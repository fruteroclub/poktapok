"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountryFlag } from "@/lib/utils/directory";
import { SkillsFilter } from "@/components/directory/skills-filter";
import type { DirectoryFilters } from "@/types/api-v1";

interface FiltersProps {
  filters: DirectoryFilters;
  countries: Array<{ country: string; countryCode: string; count: number }>;
  onFilterChange: (key: keyof DirectoryFilters, value: string | string[] | null) => void;
  onClearAll: () => void;
}

export function Filters({
  filters,
  countries,
  onFilterChange,
  onClearAll,
}: FiltersProps) {
  const hasActiveFilters =
    filters.learningTrack ||
    filters.availabilityStatus ||
    filters.country ||
    (filters.skills && filters.skills.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Track Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Learning Track</Label>
          <RadioGroup
            value={filters.learningTrack || "all"}
            onValueChange={(value) =>
              onFilterChange("learningTrack", value === "all" ? null : value)
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="track-all" />
              <Label htmlFor="track-all" className="font-normal cursor-pointer">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ai" id="track-ai" />
              <Label htmlFor="track-ai" className="font-normal cursor-pointer">
                Code: AI
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="crypto" id="track-crypto" />
              <Label htmlFor="track-crypto" className="font-normal cursor-pointer">
                Crypto/DeFi
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="privacy" id="track-privacy" />
              <Label htmlFor="track-privacy" className="font-normal cursor-pointer">
                Privacy
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Availability Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Availability</Label>
          <RadioGroup
            value={filters.availabilityStatus || "all"}
            onValueChange={(value) =>
              onFilterChange("availabilityStatus", value === "all" ? null : value)
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all" className="font-normal cursor-pointer">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="status-available" />
              <Label
                htmlFor="status-available"
                className="font-normal cursor-pointer"
              >
                Available
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="open_to_offers" id="status-open" />
              <Label htmlFor="status-open" className="font-normal cursor-pointer">
                Open to Offers
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unavailable" id="status-unavailable" />
              <Label
                htmlFor="status-unavailable"
                className="font-normal cursor-pointer"
              >
                Unavailable
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Country Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Country</Label>
          <Select
            value={filters.country || "all"}
            onValueChange={(value) =>
              onFilterChange("country", value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.countryCode} value={country.country}>
                  {getCountryFlag(country.countryCode)} {country.country} (
                  {country.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skills Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Skills</Label>
          <SkillsFilter
            selectedSkillIds={filters.skills || []}
            onSelectionChange={(skillIds) =>
              onFilterChange("skills", skillIds.length > 0 ? skillIds : null)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
