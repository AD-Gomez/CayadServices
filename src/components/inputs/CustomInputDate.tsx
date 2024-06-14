import { forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';

interface DateInputProps {
  name: string;
  label: string;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ name, label }, ref) => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="relative mb-6">
      <input
        id={name}
        type="date"
        {...register(name)}
        className={`p-2 w-full border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out bg-white ${errors[name]?.message ? 'border-red-500' : ''}`}
      />
      {errors[name]?.message !== null && (
        <label htmlFor={name} className="block text-red-500 text-sm mb-1">
          {String(errors[name]?.message)}
        </label>
      )}
      <label
        htmlFor={name}
        className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </label>
    </div>
  );
});

export default DateInput;
