// src/components/SelectInput.tsx
import { useFormContext } from 'react-hook-form';

interface SelectInputProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ name, label, options, disabled }) => {
  const { register } = useFormContext();

  return (
    <div className="flex relative flex-col mb-4">
      <select
        id={name}
        {...register(name)}
        disabled={disabled}
        className="p-2 peer border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out bg-white"
      >
        <option value="">{`Select ${label}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={name}
        className="absolute left-0 -top-3.5 font-bold text-[#555] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </label>
    </div>
  );
};

export default SelectInput;
