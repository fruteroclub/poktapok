"use client";

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { ProfileFormData } from "@/lib/validators/profile";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/data/countries";
import { getCitiesByCountry } from "@/data/cities";

/**
 * LocationSection - Country and City selection form section
 * - Country select with flags
 * - City select filtered by selected country
 * - Auto-resets city when country changes
 */
export function LocationSection() {
  const form = useFormContext<ProfileFormData>();
  const selectedCountry = form.watch("countryCode");
  const cities = useMemo(
    () => getCitiesByCountry(selectedCountry),
    [selectedCountry]
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Ubicación</h3>
        <p className="text-sm text-muted-foreground">
          ¿Desde dónde trabajas o estudias?
        </p>
      </div>

      {/* Country Select */}
      <FormField
        control={form.control}
        name="countryCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              País <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Reset city when country changes
                form.setValue("city", "");
                // Set country name
                const country = COUNTRIES.find((c) => c.code === value);
                if (country) {
                  form.setValue("country", country.name);
                }
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu país" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City Select */}
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Ciudad <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedCountry}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu ciudad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
