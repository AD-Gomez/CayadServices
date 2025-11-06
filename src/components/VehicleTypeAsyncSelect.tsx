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
  const r = await fetch(`${endpoint}?${qs}`, {
    headers: { Accept: 'application/json' },
  });
  if (!r.ok) throw new Error('Failed to fetch vehicle types');
  const data = (await r.json()) as Option[];
  setCached(endpoint, params, data);
  return data;
}

const VehicleTypeAsyncSelect: React.FC<Props> = ({ name, label = 'Vehicle Type', endpoint, make, minLength = 0, disabled }) => {
  const { control, formState: { errors } } = useFormContext();
  const [search, setSearch] = useState('');

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (make) p.make = make;
    if (search.trim()) p.search = search.trim();
    return p;
  }, [make, search]);

  const { options, loading } = useAsyncOptions(
    (p) => fetchVehicleTypes(endpoint, p),
    params,
    { delay: 200, minLength }
  );

  const hasError = !!(errors as any)[name];

  return (
    <div className="flex relative flex-col mb-4">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            inputId={name}
            value={field.value ? { value: field.value, label: field.value } : null}
            onChange={(opt: any) => field.onChange(opt?.value ?? '')}
            onInputChange={(txt) => setSearch(txt)}
            options={options}
            isLoading={loading}
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
                '&:hover': { border: `1px solid ${hasError ? 'red' : '#00a1e1'}` },
              }),
              indicatorSeparator: () => ({ display: 'none' }),
            }}
            className={`p-2 peer border-0 border-b ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-btn-blue transition bg-white`}
          />
        )}
      />
      <label htmlFor={name}
        className={`absolute left-0 -top-3.5 font-bold text-[#555] text-sm transition-all ${hasError ? 'text-red-500' : 'peer-focus:text-btn-blue'}`}>
        {label}
      </label>
      {hasError && <span className="text-red-500 text-xs mt-1">{String((errors as any)[name]?.message)}</span>}
    </div>
  );
};

export default VehicleTypeAsyncSelect;
