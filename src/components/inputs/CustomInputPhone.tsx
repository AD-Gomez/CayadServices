import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface CustomInputProps {
  name: string;
  label: string;
  type?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  max?: number;
}

const CustomInputPhone: React.FC<CustomInputProps> = ({ name, label, type = 'text', onBlur, onChange, max }) => {
  const { register, formState: { errors, dirtyFields }, setValue, trigger, watch } = useFormContext();
  const [maskedValue, setMaskedValue] = useState('');
  useEffect(() => {
    console.log('dirtyFields updated:', dirtyFields);
  }, [dirtyFields]);

  // Función para manejar el cambio en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Eliminar todos los caracteres que no sean dígitos
    value = formatPhoneNumber(value); // Formatear el número de teléfono
    setMaskedValue(value); // Actualizar el estado con el valor formateado
    setValue(name, value, { shouldValidate: true }); // Actualizar el valor en el formulario y validar
    trigger(name); // Forzar la validación
    if (onChange) {
      onChange(e); // Propagar el evento onChange si está definido
    }
  };

  // Función para formatear el número de teléfono
  const formatPhoneNumber = (value: string) => {
    // Aplicar la máscara (###) ###-####
    const formatted = value.replace(/^(\d{3})(\d{3})(\d+)$/, '($1) $2-$3');
    return formatted;
  };

  // Chequear si el campo es válido
  const isFieldValid = !errors[name] && dirtyFields[name] === undefined && maskedValue && maskedValue.length >= 14;
  console.log(maskedValue)
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
        className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm 
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

export default CustomInputPhone;
