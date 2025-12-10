/**
 * VehicleMakeSelect - Dropdown for selecting vehicle make
 * Uses the unified /api/public/vehicle-options/?field=makes&year=... endpoint
 */
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { useVehicleMakes } from '../hooks/useVehicleOptions';

type Props = {
    name: string;
    label?: string;
    year: string | undefined;
    onMakeChange?: (make: string) => void;
};

const VehicleMakeSelect: React.FC<Props> = ({
    name,
    label = 'Make',
    year,
    onMakeChange,
}) => {
    const { control, formState: { errors } } = useFormContext();
    const { makes, loading, error } = useVehicleMakes(year);

    const hasError = !!(errors as any)[name];
    const isDisabled = !year;

    // Transform makes array into react-select options
    const options = makes.map((make) => ({
        value: make,
        label: make,
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
                            if (onMakeChange) onMakeChange(val);
                        }}
                        options={options}
                        isLoading={loading}
                        isDisabled={isDisabled}
                        isClearable
                        classNamePrefix="react-select"
                        placeholder={isDisabled ? 'Select year first' : 'Select Make'}
                        noOptionsMessage={() => error ? 'Error loading makes' : 'No makes available'}
                        styles={{
                            control: (provided) => ({
                                ...provided,
                                boxShadow: 'none',
                                border: `1px solid ${hasError ? 'red' : '#e2e8f0'}`,
                                borderRadius: '0.375rem',
                                minHeight: '2.25rem',
                                height: '2.25rem',
                                fontSize: '0.85rem',
                                backgroundColor: isDisabled ? '#f8fafc' : 'white',
                                '&:hover': { border: `1px solid ${hasError ? 'red' : '#00a1e1'}` },
                            }),
                            valueContainer: (p) => ({ ...p, padding: '0 0.5rem', height: '2.25rem' }),
                            input: (p) => ({ ...p, margin: 0, padding: 0 }),
                            dropdownIndicator: (p) => ({ ...p, padding: '4px' }),
                            clearIndicator: (p) => ({ ...p, padding: '4px' }),
                            placeholder: (p) => ({ ...p, fontSize: '0.8rem', color: isDisabled ? '#94a3b8' : '#64748b' }),
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

export default VehicleMakeSelect;
