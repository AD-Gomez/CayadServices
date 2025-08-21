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
            isDisabled={disabled || !make}
            classNamePrefix="react-select"
            placeholder={`Select ${label}`}
            styles={{
              control: (provided) => ({
                ...provided,
                boxShadow: 'none',
                border: `1px solid ${hasError ? 'red' : '#e2e8f0'}`,
                borderRadius: '0.375rem',
                '&:hover': { border: `1px solid ${hasError ? 'red' : '#00a1ef'}` },
              }),
              indicatorSeparator: () => ({ display: 'none' }),
            }}
            className={`p-2 peer border-0 border-b ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-btn-blue transition bg-white`}
          />
        )}
      />
      <label htmlFor={name}
        className={`absolute left-0 -top-3.5 font-bold text-[#555] text-sm transition-all ${hasError ? 'text-red-500' : 'peer-focus:text-blue-500'}`}>
        {label}
      </label>
      {hasError && <span className="text-red-500 text-xs mt-1">{String((errors as any)[name]?.message)}</span>}
    </div>
  );
};

export default ModelAsyncSelect;
