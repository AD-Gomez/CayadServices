import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface CustomInputProps {
  name: string;
  label: string;
  type?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  max?: number;
  defaultValue?: string;
}

const CustomInputPhone: React.FC<CustomInputProps> = ({ name, label, type = 'text', onBlur, onChange, max, defaultValue }) => {
  const { register, formState: { errors, dirtyFields }, setValue, trigger } = useFormContext();
  const [maskedValue, setMaskedValue] = useState(defaultValue || '');

  useEffect(() => {
    // Si defaultValue está presente, formatearlo y establecerlo como valor inicial
    if (defaultValue) {
      const digits = String(defaultValue).replace(/\D/g, '');
      const e164 = toE164(digits);
      const display = e164 || formatForDisplay(digits);
      setMaskedValue(display);
      setValue(name, e164 || display);
    }
  }, [defaultValue, name, setValue]);

  // Función para manejar el cambio en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || '';
    const digits = raw.replace(/\D/g, ''); // keep only digits
    const e164 = toE164(digits); // normalized if valid
    const display = e164 || formatForDisplay(digits);
    setMaskedValue(display);
    // If we have a normalized phone, store that in the form value; otherwise store the display so validation still sees digits
    setValue(name, e164 || display, { shouldValidate: true });
    trigger(name);
    if (onChange) onChange(e);
  };

  // Convert digits to E.164 (+1XXXXXXXXXX) if valid, otherwise return null
  const toE164 = (digits: string) => {
    if (!digits) return null;
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return null;
  };

  // Friendly display while typing. When valid, display E.164.
  const formatForDisplay = (digits: string) => {
    if (!digits) return '';
    const e164 = toE164(digits);
    if (e164) return e164; // show +1XXXXXXXXXX when valid
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Chequear si el campo es válido (based on digits count)
  const rawDigits = (maskedValue || '').replace(/\D/g, '');
  const isDigitsValid = rawDigits.length === 10 || (rawDigits.length === 11 && rawDigits.startsWith('1'));
  const isFieldValid = (!errors[name] || errors[name] === undefined) && (dirtyFields[name] === undefined || dirtyFields[name]) && isDigitsValid;
  return (
    <div className="relative mb-2">
      <input
        id={name}
        type={type}
        value={maskedValue}
        maxLength={max}
        {...register(name)}
        placeholder=""
        onChange={handleChange} // Agregar el manejador de cambio
        onBlur={onBlur} // Propagar el evento onBlur si está definido
        className={`peer h-10 w-full border-b-2 bg-transparent text-gray-900 placeholder-transparent focus:outline-none pl-10 
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
      {/* Dynamic helper text (mnemonic + aria-live for screen readers) */}
      <p className="mt-1 text-xs text-slate-500" aria-live="polite">
        {errors[name]
          ? String(errors[name]?.message)
          : isFieldValid
          ? `Valid number — saved as ${toE164(rawDigits)}`
          : 'Ex: (555) 555-5555. It will automatically convert to +1XXXXXXXXXX when valid.'}
      </p>
    </div>
  );
};

export default CustomInputPhone;
