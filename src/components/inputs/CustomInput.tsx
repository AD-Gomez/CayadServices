// src/components/CustomInput.tsx
import { useFormContext } from 'react-hook-form';

interface CustomInputProps {
  name: string;
  label: string;
  type?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const CustomInput: React.FC<CustomInputProps> = ({ name, label, type = 'text', onBlur, onChange }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="relative mb-6">
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder=" "
        className={`peer h-10 w-full border-b-2 bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600 ${errors[name]?.message ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
      />
      {errors[name]?.message
        ? <label
          htmlFor={name}
          className={`absolute left-0 -top-3.5 text-red-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-red-500 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-red-500 ${errors[name]?.message ? 'text-red-500' : ''}`}
        >
          Error
        </label>
        : <label
          htmlFor={name}
          className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600 ${errors[name]?.message ? 'text-red-500' : ''}`}
        >
          {label}
        </label>
      }
      {errors[name]?.message && (
        <p className="text-red-500 text-xs italic mt-1">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default CustomInput;
