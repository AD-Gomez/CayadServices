import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface AutocompleteInputProps {
  name: string;
  label: string;
  placeholder: string;
  country?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ name, label, placeholder, country = 'US' }) => {
  const { register, setValue, formState: { errors } } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      componentRestrictions: { country },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setInputValue(inputRef.current?.value || '');
        setValue(name, inputRef.current?.value || '');
      }
    });
  }, [country, name, setValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setValue(name, event.target.value);
  };

  return (
    <div className="relative mb-6">
      <input
        id={name}
        {...register(name)}
        value={inputValue}
        onChange={handleInputChange}
        ref={inputRef}
        placeholder={placeholder}
        className={`peer h-10 w-full border-b-2 bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600 ${errors[name] ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
      />
      {errors[name] && (
        <div className='absolute top-2.5 text-red-500 right-2.5'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 ">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
      )}
      <label
        htmlFor={name}
        className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600 ${errors[name] ? 'text-red-500' : ''}`}
      >
        {label}
      </label>
      {errors[name] && (
        <p className="text-red-500 text-xs italic mt-1">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default AutocompleteInput;
