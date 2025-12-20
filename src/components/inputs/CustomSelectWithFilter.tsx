import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps {
  name: string;
  label: string;
  options: Option[];
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ name, label, options, disabled }) => {
  const { register, setValue } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    filterOptions(value);
  };

  const handleOptionClick = (option: Option) => {
    setValue(name, option.value);
    setInputValue(option.label);
    setShowOptions(false);
  };

  const filterOptions = (value: string) => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  return (
    <div className="relative mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={name}
        {...register(name)}
        type="text"
        disabled={disabled}
        placeholder={`Select ${label}`}
        className="p-2  border-b-2 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out bg-white w-full"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 200)} // Delay closing to handle clicks on options
      />
      {showOptions && (
        <ul className="absolute max-h-[160px] overflow-auto flex-nowrap z-50 mt-1 w-full border border-gray-300 bg-white shadow-lg rounded-md">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectInput;
