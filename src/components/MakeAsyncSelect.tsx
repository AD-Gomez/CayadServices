// components/MakeAsyncSelect.tsx
import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import { useAsyncOptions, type Option } from '../hooks/useAsyncOptions';

type Props = {
  name: string;
  label?: string;
  endpoint?: string;
  minLength?: number;
  onPickedMake?: (val: string) => void;
};

async function fetchMakes(endpoint: string, params: Record<string, string>): Promise<Option[]> {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${endpoint}?${qs}`);
  if (!r.ok) throw new Error('Failed to fetch makes');
  return (await r.json()) as Option[];
}

const MakeAsyncSelect: React.FC<Props> = ({
  name,
  label = 'Vehicle Make',
  endpoint = '/api/vehicles/makes',
  minLength = 0,
  onPickedMake,
}) => {
  const { control, setValue, formState: { errors } } = useFormContext();
  const [search, setSearch] = useState('');

  const { options, loading } = useAsyncOptions(
    (p) => fetchMakes(endpoint, p),
    { search },
    { delay: 250, minLength }
  );

  const hasError = !!(errors as any)[name];

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-700 mb-1.5">
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
            onChange={(opt: any) => {
              const val = opt?.value ?? '';
              setValue(name, val, { shouldValidate: true, shouldDirty: true });
              if (onPickedMake) onPickedMake(val);
            }}
            onInputChange={(txt) => setSearch(txt)}
            options={options}
            isLoading={loading}
            isClearable
            classNamePrefix="react-select"
            placeholder={label ? `Select ${label}` : 'Select'}
            styles={{
              control: (provided) => ({
                ...provided,
                boxShadow: 'none',
                border: `1px solid ${hasError ? 'red' : '#e2e8f0'}`,
                borderRadius: '0.375rem',
                minHeight: '2.5rem',
                '&:hover': { border: `1px solid ${hasError ? 'red' : '#00a1e1'}` },
              }),
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
      {hasError && <span className="text-red-500 text-xs mt-1">{String((errors as any)[name]?.message)}</span>}
    </div>
  );
};

export default MakeAsyncSelect;
