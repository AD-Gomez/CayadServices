/**
 * VehicleYearSelect - Dropdown for selecting vehicle year
 * Uses the unified /api/public/vehicle-options/?field=years endpoint
 */
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { useVehicleYears } from '../hooks/useVehicleOptions';

type Props = {
    name: string;
    label?: string;
    onYearChange?: (year: string) => void;
};

const VehicleYearSelect: React.FC<Props> = ({
    name,
    label = 'Year',
    onYearChange,
}) => {
    const { control, formState: { errors } } = useFormContext();
    const { years, loading, error } = useVehicleYears();

    const hasError = !!(errors as any)[name];

    // Transform years array into react-select options
    const options = years.map((year) => ({
        value: String(year),
        label: String(year),
    }));

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
                        onChange={(opt: any) => {
                            const val = opt?.value ?? '';
                            field.onChange(val);
                            if (onYearChange) onYearChange(val);
                        }}
                        options={options}
                        isLoading={loading}
                        isClearable
                        classNamePrefix="react-select"
                        placeholder="Select Year"
                        noOptionsMessage={() => error ? 'Error loading years' : 'No years available'}
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
                        className="bg-white"
                    />
                )}
            />
            {hasError && <span className="text-red-500 text-xs mt-1">{String((errors as any)[name]?.message)}</span>}
        </div>
    );
};

export default VehicleYearSelect;
