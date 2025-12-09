// components/ModelAsyncSelect.tsx
import React, { useMemo, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import { useAsyncOptions, type Option } from '../hooks/useAsyncOptions';

type Props = {
  name: string;
  label: string;
  endpoint: string;
  make: string | undefined;
  minLength?: number;
  disabled?: boolean;
};

async function fetchModels(endpoint: string, params: Record<string, string>): Promise<Option[]> {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${endpoint}?${qs}`);
  if (!r.ok) throw new Error('Failed to fetch models');
  return (await r.json()) as Option[];
}

const ModelAsyncSelect: React.FC<Props> = ({ name, label, endpoint, make, minLength = 0, disabled }) => {
  const { control, formState: { errors } } = useFormContext();
  const [search, setSearch] = useState('');

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (make) p.make = make;
    if (search.trim()) p.search = search.trim();
    return p;
  }, [make, search]);

  const { options, loading } = useAsyncOptions(
    (p) => fetchModels(endpoint, p),
    params,
    { delay: 250, minLength }
  );

  const hasError = !!errors[name as keyof typeof errors];

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className="block text-[11px] font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
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
            isDisabled={disabled || !make}
            classNamePrefix="react-select"
            placeholder={`Select ${label}`}
            styles={{
              control: (provided) => ({
                ...provided,
                boxShadow: 'none',
                border: `1px solid ${hasError ? 'red' : '#e2e8f0'}`,
                borderRadius: '0.375rem',
                minHeight: '2.25rem',
                height: '2.25rem',
                fontSize: '0.85rem',
                '&:hover': { border: `1px solid ${hasError ? 'red' : '#00a1e1'}` },
              }),
              valueContainer: (p) => ({ ...p, padding: '0 0.5rem', height: '2.25rem' }),
              input: (p) => ({ ...p, margin: 0, padding: 0 }),
              dropdownIndicator: (p) => ({ ...p, padding: '4px' }),
              clearIndicator: (p) => ({ ...p, padding: '4px' }),
              placeholder: (p) => ({ ...p, fontSize: '0.8rem' }),
              singleValue: (p) => ({ ...p, fontSize: '0.8rem' }),
              indicatorSeparator: () => ({ display: 'none' }),
            }}
            className={`bg-white`}
          />
        )}
      />
      {hasError && <span className="text-red-500 text-xs mt-1">{String((errors as any)[name]?.message)}</span>}
    </div>
  );
};

export default ModelAsyncSelect;
