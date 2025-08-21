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
    <div className="flex relative flex-col mb-4">
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
            placeholder={`Select ${label}`}
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

export default MakeAsyncSelect;
