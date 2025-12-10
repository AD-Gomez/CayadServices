/**
 * Hook for fetching vehicle options from the unified endpoint
 * GET /api/public/vehicle-options/
 * 
 * Supports cascading dropdowns:
 * 1. Years: ?field=years
 * 2. Makes: ?field=makes&year=2024
 * 3. Models: ?field=models&year=2024&make=Ford
 *    Response: [{"model": "F-150", "category": "pickup_crew_cab"}, ...]
 */

import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../services/config';

export type YearOption = number;

export type MakeOption = string;

export type ModelOption = {
  model: string;
  category: string; // e.g., "sedan", "suv", "pickup_crew_cab"
};

type VehicleOptionsField = 'years' | 'makes' | 'models';

interface FetchParams {
  field: VehicleOptionsField;
  year?: number | string;
  make?: string;
}

const ENDPOINT = '/api/public/vehicle-options/';

// Simple in-memory cache to avoid redundant requests
const cache = new Map<string, unknown>();

function buildCacheKey(params: FetchParams): string {
  return JSON.stringify(params);
}

async function fetchVehicleOptions<T>(params: FetchParams): Promise<T> {
  const key = buildCacheKey(params);
  if (cache.has(key)) {
    return cache.get(key) as T;
  }

  const url = new URL(apiUrl(ENDPOINT));
  url.searchParams.set('field', params.field);
  if (params.year) url.searchParams.set('year', String(params.year));
  if (params.make) url.searchParams.set('make', params.make);

  console.log('[useVehicleOptions] Fetching:', url.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch vehicle options: ${res.status}`);
  }

  const data = await res.json() as T;
  cache.set(key, data);
  return data;
}

/**
 * Hook to fetch available years
 */
export function useVehicleYears() {
  const [years, setYears] = useState<YearOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchVehicleOptions<YearOption[]>({ field: 'years' })
      .then((data) => {
        if (!cancelled) {
          setYears(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[useVehicleYears] Error:', err);
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { years, loading, error };
}

/**
 * Hook to fetch available makes for a given year
 */
export function useVehicleMakes(year: number | string | undefined) {
  const [makes, setMakes] = useState<MakeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!year) {
      setMakes([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchVehicleOptions<MakeOption[]>({ field: 'makes', year })
      .then((data) => {
        if (!cancelled) {
          setMakes(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[useVehicleMakes] Error:', err);
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year]);

  return { makes, loading, error };
}

/**
 * Hook to fetch available models for a given year and make
 */
export function useVehicleModels(year: number | string | undefined, make: string | undefined) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!year || !make) {
      setModels([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchVehicleOptions<ModelOption[]>({ field: 'models', year, make })
      .then((data) => {
        if (!cancelled) {
          setModels(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[useVehicleModels] Error:', err);
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, make]);

  return { models, loading, error };
}

/**
 * Clear the vehicle options cache (useful for testing or forced refresh)
 */
export function clearVehicleOptionsCache() {
  cache.clear();
}
