/**
 * VehicleModelSelect - Dropdown for selecting vehicle model
 * Uses the unified /api/public/vehicle-options/?field=models&year=...&make=... endpoint
 * 
 * When a model is selected, automatically captures the 'category' for pricing.
 */
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { useVehicleModels, type ModelOption } from '../hooks/useVehicleOptions';

type Props = {
    name: string;
    label?: string;
    year: string | undefined;
    make: string | undefined;
    /** Called when model is selected with model name and its category (vehicle_type) */
    onModelSelect?: (model: string, category: string) => void;
};

const VehicleModelSelect: React.FC<Props> = ({
    name,
    label = 'Model',
    year,
    make,
    onModelSelect,
}) => {
    const { control, formState: { errors } } = useFormContext();
    const { models, loading, error } = useVehicleModels(year, make);

    const hasError = !!(errors as any)[name];
    const isDisabled = !year || !make;

    // Transform models array into react-select options with category metadata
    const options = models.map((m: ModelOption) => ({
        value: m.model,
        label: m.model,
        category: m.category, // Store category for use when selected
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
                        value={field.value ? options.find(o => o.value === field.value) ?? { value: field.value, label: field.value, category: '' } : null}
                        onChange={(opt: any) => {
                            const val = opt?.value ?? '';
                            const cat = opt?.category ?? '';
                            field.onChange(val);
                            if (onModelSelect && val) {
                                onModelSelect(val, cat);
                            }
                        }}
                        options={options}
                        isLoading={loading}
                        isDisabled={isDisabled}
                        isClearable
                        classNamePrefix="react-select"
                        placeholder={isDisabled ? 'Select year and make first' : 'Select Model'}
                        noOptionsMessage={() => error ? 'Error loading models' : 'No models available'}
                        maxMenuHeight={160}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                        menuPosition="fixed"
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
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            // Show category as a subtle hint in options
                            option: (provided, state) => ({
                                ...provided,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }),
                        }}
                        formatOptionLabel={(option: any) => (
                            <div className="flex justify-between items-center w-full">
                                <span>{option.label}</span>
                                {option.category && (
                                    <span className="text-[10px] text-slate-400 ml-2 uppercase">
                                        {option.category.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>
                        )}
                        className="bg-white"
                    />
                )}
            />
            {hasError && <span className="text-red-500 text-xs mt-1">{String((errors as any)[name]?.message)}</span>}
        </div>
    );
};

export default VehicleModelSelect;
