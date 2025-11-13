// components/VehicleTypeAsyncSelect.tsx
import React, { useMemo, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import { type Option, useAsyncOptions } from '../hooks/useAsyncOptions';

type Props = {
  name: string;
  label?: string;
  endpoint: string; // e.g., apiUrl('/api/vehicles/types')
  make?: string | undefined; // optional filter
  minLength?: number;
  disabled?: boolean;
  hidePresets?: boolean; // when true, filter out car/suv/van from options (default true to preserve old behavior)
};

type CacheEntry = { ts: number; data: Option[] };

const CACHE_PREFIX = 'veh_types_cache:';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function cacheKey(endpoint: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return `${CACHE_PREFIX}${endpoint}?${qs}`;
}

function getCached(endpoint: string, params: Record<string, string>): Option[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = cacheKey(endpoint, params);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: CacheEntry = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data)) return null;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed.data as Option[];
  } catch {
    return null;
  }
}

function setCached(endpoint: string, params: Record<string, string>, data: Option[]) {
  if (typeof window === 'undefined') return;
  try {
    const key = cacheKey(endpoint, params);
    const entry: CacheEntry = { ts: Date.now(), data };
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore quota or serialization errors
  }
}

async function fetchVehicleTypes(endpoint: string, params: Record<string, string>): Promise<Option[]> {
  // Try localStorage cache first
  const cached = getCached(endpoint, params);
  if (cached) return cached;

  const qs = new URLSearchParams(params).toString();
  const url = `${endpoint}${qs ? `?${qs}` : ''}`;
  try {
    console.debug('[VehicleType] fetching', url);
    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('[VehicleType] fetch failed', r.status, txt);
      throw new Error('Failed to fetch vehicle types');
    }
    const data = (await r.json()) as Option[];
    console.debug('[VehicleType] fetched', data?.length ?? 'nil', 'items');
    setCached(endpoint, params, data);
    return data;
  } catch (e) {
    console.error('[VehicleType] fetch error', e);
    throw e;
  }
}

/*
Endpoint contract (canonical list):
GET /api/vehicles/types
Query params:
 - make (optional) - ignored for landing (returns canonical list regardless)
 - search (optional) - filters by partial match on value or label (case-insensitive)
Response 200: JSON array of { value: string, label: string }
Example canonical list (backend):
[
  {"value":"car","label":"Car"},
  {"value":"suv","label":"SUV"},
  {"value":"crossover","label":"Crossover"},
  ...
  {"value":"other","label":"Other"}
]
NOTE: 'pickup' is intentionally not included in the canonical list.
*/
const VehicleTypeAsyncSelect: React.FC<Props> = ({ name, label = 'Other Types', endpoint, make, minLength = 0, disabled, hidePresets = true }) => {
  const { control, formState: { errors } } = useFormContext();
  const [search, setSearch] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [autoRetried, setAutoRetried] = useState(false);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (make) p.make = make;
    if (search.trim()) p.search = search.trim();
    // include refresh tick so consumers can force re-fetch
    if (refreshTick) p._r = String(refreshTick);
    return p;
  }, [make, search, refreshTick]);

  const { options, loading, error } = useAsyncOptions(
    (p) => fetchVehicleTypes(endpoint, p),
    params,
    { delay: 200, minLength }
  );

  // If we get an empty result silently (possibly cached), attempt one automatic retry to bypass cache.
  React.useEffect(() => {
    if (!loading && Array.isArray(options) && options.length === 0 && error == null && !autoRetried) {
      setRefreshTick(t => t + 1);
      setAutoRetried(true);
      console.debug('[VehicleType] auto retry triggered due to empty options');
    }
  }, [loading, options, error, autoRetried]);

  // Hide canonical preset types that are already exposed as buttons in the UI
  const filteredOptions = useMemo(() => {
    if (!Array.isArray(options)) return options;
    if (!hidePresets) return options;
    const presets = new Set(['car', 'suv', 'van']);
    return options.filter((opt) => {
      try {
        const val = (opt?.value ?? '').toString().trim().toLowerCase();
        const lab = (opt?.label ?? '').toString().trim().toLowerCase();
        return !(presets.has(val) || presets.has(lab));
      } catch {
        return true;
      }
    });
  }, [options, hidePresets]);

  const hasError = !!(errors as any)[name];

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            inputId={name}
            value={field.value ? { value: field.value, label: field.value } : null}
            onChange={(opt: any) => field.onChange(opt?.value ?? '')}
            onInputChange={(txt) => setSearch(txt)}
            options={filteredOptions}
            isLoading={loading}
            // render menu in portal so it isn't clipped by parent containers
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            isClearable
            isDisabled={disabled}
            classNamePrefix="react-select"
            placeholder={`Select ${label}`}
            styles={{
              control: (provided) => ({
                ...provided,
                boxShadow: 'none',
                border: `1px solid ${hasError ? 'red' : '#e2e8f0'}`,
                borderRadius: '0.375rem',
                minHeight: '2.5rem',
                '&:hover': { border: `1px solid ${hasError ? 'red' : '#00a1e1'}` },
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              valueContainer: (p) => ({ ...p, padding: '0 0.75rem' }),
              input: (p) => ({ ...p, margin: 0 }),
              placeholder: (p) => ({ ...p, fontSize: '0.875rem' }),
              singleValue: (p) => ({ ...p, fontSize: '0.875rem' }),
              indicatorSeparator: () => ({ display: 'none' }),
            }}
            className={`bg-white`}
          />
        )}
      />
      {!loading && (Array.isArray(options) && options.length === 0) && (
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
          <span>No types available.</span>
          <button type="button" onClick={() => setRefreshTick(t => t + 1)} className="text-btn-blue underline text-[11px]">Retry</button>
        </div>
      )}
      {error != null && (
        <div className="mt-2 text-[11px] text-red-600">Unable to load types. Try again later.</div>
      )}
      {hasError && <span className="text-red-500 text-xs mt-1">{String((errors as any)[name]?.message)}</span>}
    </div>
  );
};

export default VehicleTypeAsyncSelect;
