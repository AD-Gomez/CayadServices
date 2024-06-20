import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface CustomInputProps {
  name: string;
  label: string;
  type?: string;
  max?: number;
}

const CustomInputOnlyText: React.FC<CustomInputProps> = ({ name, label, type = 'text', max }) => {
  const { register, formState: { errors } } = useFormContext();

  // Función para manejar el cambio en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validar solo letras y espacios
    if (!/^[a-zA-Z\s]*$/.test(value)) {
      e.preventDefault();
      e.target.value = value.slice(0, -1); // Eliminar el último carácter no válido
    }
  };

  return (
    <div className="relative mb-2">
      <input
        id={name}
        type={type}
        maxLength={max} // Asignar maxLength si está definido
        {...register(name, {
          required: `${label} is required`,
        })}
        onChange={handleChange} // Agregar el manejador de cambio
        placeholder={label}
        className={`peer h-10 w-full border-b-2 text-gray-900 focus:outline-none focus:border-btn-blue ${errors[name] ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
      />
      {errors[name] && (
        <div className="absolute top-2.5 text-red-500 right-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
      )}
      <label
        htmlFor={name}
        className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-btn-blue ${errors[name] ? 'text-red-500' : ''}`}
      >
        {label}
      </label>
      {errors[name] && (
        <p className="text-red-500 text-xs italic mt-1">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default CustomInputOnlyText;
