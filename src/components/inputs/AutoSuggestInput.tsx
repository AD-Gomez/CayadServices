import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';

interface SelectInputProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  defaultValue?: string;
}

const AutoSuggestInput: React.FC<SelectInputProps> = ({ name, label, options, disabled, defaultValue }) => {
  const { control, setValue, formState: { errors } } = useFormContext();

  const handleChange = (selectedOption: any) => {
    setValue(name, selectedOption ? selectedOption.value : '', { shouldValidate: true });
  };

  const hasError = !!errors[name];
  return (
    <div className="flex relative flex-col mb-4">
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select
            {...field}
            defaultInputValue={defaultValue}
            value={options.find(option => option.value === field.value) || null}
            onChange={handleChange}
            options={options}
            isDisabled={disabled}
            classNamePrefix="react-select"
            placeholder={`Select ${label}`}
            isClearable
            styles={{
              control: (provided) => ({
                ...provided,
                boxShadow: 'none',
                border: `1px solid ${hasError ? 'red' : '#e2e8f0'}`,
                borderRadius: '0.375rem',
                '&:hover': {
                  border: `1px solid ${hasError ? 'red' : '#00a1ef'}`,
                },
              }),
              indicatorSeparator: () => ({
                display: 'none',
              }),
            }}
            className={`p-2 peer border-0 border-b ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-btn-blue transition duration-300 ease-in-out bg-white`}
          />
        )}
      />
      <label
        htmlFor={name}
        className={`absolute left-0 -top-3.5 font-bold text-[#555] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm ${hasError ? 'text-red-500' : 'peer-focus:text-blue-500'}`}
      >
        {label}
      </label>
      {hasError && <span className="text-red-500 text-xs mt-1">{String(errors[name]?.message)}</span>}
    </div>
  );
};

export default AutoSuggestInput;
