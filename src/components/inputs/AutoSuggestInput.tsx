import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';

interface SelectInputProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const AutoSuggestInput: React.FC<SelectInputProps> = ({ name, label, options, disabled }) => {
  const { control, setValue } = useFormContext();

  const handleChange = (selectedOption: any) => {
    setValue(name, selectedOption ? selectedOption.value : '', { shouldValidate: true });
  };

  return (
    <div className="flex relative flex-col mb-4">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
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
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                '&:hover': {
                  border: '1px solid #00a1ef',
                },
              }),
              indicatorSeparator: () => ({
                display: 'none',
              }),
            }}
            className="p-2 peer border-0 border-b border-gray-300 focus:outline-none focus:border-btn-blue transition duration-300 ease-in-out bg-white"
          />
        )}
      />
      <label
        htmlFor={name}
        className="absolute left-0 -top-3.5 font-bold text-[#555] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-500"
      >
        {label}
      </label>
    </div>
  );
};

export default AutoSuggestInput;
