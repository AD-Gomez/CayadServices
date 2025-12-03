import React from 'react';
import { useFormContext } from 'react-hook-form';

interface CustomInputProps {
  name: string;
  label: string;
  type?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  max?: number;
  isLoading?: boolean;
  rightElement?: React.ReactNode;
  status?: 'error' | 'success' | 'warning';
  skipAutoValid?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ name, label, type = 'text', max, onBlur, onChange, isLoading, rightElement, status, skipAutoValid }) => {
  const { register, formState: { errors, dirtyFields }, watch } = useFormContext();
  const value = watch(name);
  const isFieldValid = !skipAutoValid && !isLoading && !errors[name] && dirtyFields[name] && value;

  const { ref, onBlur: rhfOnBlur, onChange: rhfOnChange, ...restRegister } = register(name);

  const getBorderClass = () => {
    if (status === 'error' || errors[name]) return 'border-red-500 focus:border-red-500';
    if (status === 'warning') return 'border-amber-500 focus:border-amber-500';
    if (status === 'success' || isFieldValid) return 'border-green-500 focus:border-green-500';
    return 'border-gray-300';
  };

  const getLabelColorClass = () => {
    if (status === 'error' || errors[name]) return 'text-red-500';
    if (status === 'warning') return 'text-amber-500';
    if (status === 'success' || isFieldValid) return 'text-btn-blue';
    return '';
  };

  return (
    <div className="relative mb-2">
      <input
        id={name}
        type={type}
        inputMode={type === 'number' ? 'numeric' : undefined}
        maxLength={max}
        {...restRegister}
        ref={ref}
        onBlur={(e) => {
          rhfOnBlur(e);
          onBlur?.(e);
        }}
        onChange={(e) => {
          rhfOnChange(e);
          onChange?.(e);
        }}
        placeholder=""
        className={`peer h-10 w-full border-b-2 bg-transparent text-gray-900 placeholder-transparent focus:outline-none 
          ${getBorderClass()}`}
      />
      {isLoading && (
        <div className="absolute top-2.5 right-2.5">
          <svg className="animate-spin h-5 w-5 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {!isLoading && rightElement && (
        <div className="absolute top-2.5 right-2.5">
          {rightElement}
        </div>
      )}
      {!isLoading && !rightElement && (status === 'error' || errors[name]) && (
        <div className="absolute top-2.5 text-red-500 right-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
      )}
      {!isLoading && !rightElement && !errors[name] && status !== 'warning' && (status === 'success' || isFieldValid) && (
        <div className="absolute top-2.5 text-green-500 right-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <label
        htmlFor={name}
        className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-btn-blue peer-focus:text-sm 
          ${getLabelColorClass()}`}
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
