import React from 'react';
import { useFormContext } from 'react-hook-form';

interface CustomInputProps {
  name: string;
  label: string;
  type?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  max?: number; // Hacer el max opcional
}

const CustomInput: React.FC<CustomInputProps> = ({ name, label, type = 'text', onBlur, onChange, max }) => {
  const { register, formState: { errors, dirtyFields }, watch } = useFormContext();
  const value = watch(name);
  const isFieldValid = !errors[name] && dirtyFields[name] && value;

  return (
    <div className="relative mb-2">
      <input
        id={name}
        type={type}
        inputMode={type === 'number' ? 'numeric' : undefined}
        maxLength={max}
        {...register(name)}
        placeholder=""
        className={`peer h-10 w-full border-b-2 bg-transparent text-gray-900 placeholder-transparent focus:outline-none 
          ${errors[name] ? 'border-red-500 focus:border-red-500' : isFieldValid ? 'border-green-500 focus:border-green-500' : 'border-gray-300'}`}
      />
      {errors[name] && (
        <div className="absolute top-2.5 text-red-500 right-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
      )}
      {isFieldValid && (
        <div className="absolute top-2.5 text-green-500 right-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <label
        htmlFor={name}
        className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-btn-blue peer-focus:text-sm 
          ${errors[name] ? 'text-red-500' : isFieldValid ? 'text-btn-blue' : ''}`}
      >
        {label}
      </label>
      {errors[name] && (
        <p className="text-red-500 text-xs italic mt-1">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default CustomInput;
