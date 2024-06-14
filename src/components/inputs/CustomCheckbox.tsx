import React from 'react';
import { useFormContext } from 'react-hook-form';

interface CheckboxInputProps {
  id?: string;
  value?: string;
  label?: string;
  checked?: boolean;
  onChange?: (...event: any[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name: string;
  ref?: React.RefCallback<HTMLInputElement>;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ name, label, value }) => {
  const { register } = useFormContext();

  return (
    <div className="relative mb-6 flex items-center">
      <input
        id={name}
        type="radio"
        value={value}
        {...register(name)}
        className="mr-2 h-5 w-5 rounded-full text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <label
        htmlFor={name}
        className="text-gray-900"
      >
        {label}
      </label>
    </div>
  );
};

export default CheckboxInput;
