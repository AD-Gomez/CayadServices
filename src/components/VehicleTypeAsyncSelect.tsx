// components/VehicleTypeAsyncSelect.tsx
/**
 * Component to select vehicle categories from the SuperDispatch catalog.
 * Uses /api/public/vehicle-categories/ to fetch all 19 standardized types.
 * Shows descriptions as tooltips for better UX.
 */
import React, { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select, { components, type OptionProps, type SingleValueProps } from 'react-select';
import { useVehicleCategories, type CategoryOption } from '../hooks/useVehicleOptions';

type Props = {
  name: string;
  label?: string;
  disabled?: boolean;
};

// Custom option component to show description as subtitle
const CustomOption = (props: OptionProps<CategoryOption, false>) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{data.label}</span>
        {data.description && (
          <span className="text-xs text-slate-500 mt-0.5">{data.description}</span>
        )}
      </div>
    </components.Option>
  );
};

// Custom single value to show only the label when selected
const CustomSingleValue = (props: SingleValueProps<CategoryOption, false>) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <span className="text-sm">{data.label}</span>
    </components.SingleValue>
  );
};

const VehicleTypeAsyncSelect: React.FC<Props> = ({
  name,
  label = 'Vehicle Type',
  disabled
}) => {
  const { control, formState: { errors } } = useFormContext();
  const { categories, loading, error } = useVehicleCategories();

  // Convert categories to react-select format
  const options = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    // Filter out standard vehicle types as requested by the user
    // We only want to show heavy/specialty vehicles
    const excludedTypes = new Set([
      'sedan',
      '2_door_coupe',
      'suv',
      'pickup',
      '4_door_pickup',
      'van'
    ]);

    return categories.filter(cat => !excludedTypes.has(cat.value));
  }, [categories]);

  const hasError = !!(errors as any)[name];

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Find the selected option by value
          const selectedOption = options.find(opt => opt.value === field.value) || null;

          return (
            <Select<CategoryOption, false>
              inputId={name}
              value={selectedOption}
              onChange={(opt) => field.onChange(opt?.value ?? '')}
              options={options}
              isLoading={loading}
              // Custom components to show descriptions
              components={{
                Option: CustomOption,
                SingleValue: CustomSingleValue,
              }}
              // Render menu in portal so it isn't clipped by parent containers
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              isClearable
              isDisabled={disabled || loading}
              classNamePrefix="react-select"
              placeholder={`Select ${label}`}
              noOptionsMessage={() => loading ? 'Loading...' : 'No categories available'}
              styles={{
                control: (provided) => ({
                  ...provided,
                  boxShadow: 'none',
                  border: `1px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '0.375rem',
                  minHeight: '2.5rem',
                  '&:hover': { border: `1px solid ${hasError ? '#ef4444' : '#00a1e1'}` },
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                valueContainer: (p) => ({ ...p, padding: '0 0.75rem' }),
                input: (p) => ({ ...p, margin: 0 }),
                placeholder: (p) => ({ ...p, fontSize: '0.875rem', color: '#94a3b8' }),
                singleValue: (p) => ({ ...p, fontSize: '0.875rem' }),
                indicatorSeparator: () => ({ display: 'none' }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? '#0284c7'
                    : state.isFocused
                      ? '#f0f9ff'
                      : 'white',
                  color: state.isSelected ? 'white' : '#1e293b',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  '&:active': {
                    backgroundColor: '#0284c7',
                  },
                }),
              }}
              className="bg-white"
            />
          );
        }}
      />
      {error && (
        <div className="mt-2 text-[11px] text-red-600">
          Unable to load vehicle categories. Please try again later.
        </div>
      )}
      {hasError && (
        <span className="text-red-500 text-xs mt-1">
          {String((errors as any)[name]?.message)}
        </span>
      )}
    </div>
  );
};

export default VehicleTypeAsyncSelect;
