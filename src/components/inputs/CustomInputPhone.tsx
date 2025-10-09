import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface CustomInputProps {
  name: string;
  label: string;
  type?: string;
  max?: number; // kept for compatibility, not used by PhoneInput
  defaultValue?: string;
}

const CustomInputPhone: React.FC<CustomInputProps> = ({ name, label, defaultValue }) => {
  const { control, getValues, formState: { errors, dirtyFields, touchedFields, isSubmitted } } = useFormContext();

  // derive some field-level flags here so they can be used both inside the Controller render
  // and in the helper paragraph below (avoids referencing variables out of scope)
  const fieldErrorGlobal = Boolean((errors as any)[name]);
  // Ignore 'dirty' because some phone inputs auto-populate the dial code on mount which marks the field dirty
  const wasTouchedGlobal = Boolean((touchedFields as any)[name]);
  const currentValueGlobal = String(getValues(name) ?? '');
  // Only consider explicit user touch or form submission as interaction
  const interactedGlobal = wasTouchedGlobal || Boolean(isSubmitted);
  // Avoid showing an error when the phone input auto-populates a short dial code like '+1'
  const showErrorGlobal = fieldErrorGlobal && interactedGlobal && (currentValueGlobal.length > 2 || Boolean(isSubmitted));

  return (
  <div className="relative mb-4"> {/* slightly larger bottom margin to separate label/helper from next element */}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ''}
        render={({ field: { value, onChange, onBlur, ref } }) => {
          const isE164 = (v: string) => /^\+[1-9]\d{5,14}$/.test(v || '');
          // Use the globals computed above for deciding when to show error state
          const showError = showErrorGlobal;
          const valid = !fieldErrorGlobal && interactedGlobal && isE164(String(value || ''));
          return (
            <div className="relative">
              <PhoneInput
                ref={ref as any}
                defaultCountry="us"
                value={String(value || '')}
                onChange={(phone) => onChange(phone)}
                onBlur={onBlur}
                placeholder="Enter phone number"
                forceDialCode
                inputProps={{ name }}
                className="w-full"
                inputClassName={`peer w-full bg-white text-gray-900 focus:outline-none h-10 pl-3 pr-10 border rounded-r-md ${showError ? 'border-red-500 focus:border-red-500' : valid ? 'border-green-500 focus:border-green-500' : 'border-slate-300 focus:border-btn-blue'}`}
                style={{
                  // Harmonize with Tailwind and prevent layout jumps
                  ['--react-international-phone-height' as any]: '40px',
                  ['--react-international-phone-font-size' as any]: '14px',
                  ['--react-international-phone-dropdown-top' as any]: '42px',
                }}
                countrySelectorStyleProps={{
                  buttonClassName: `h-10 bg-white border ${showError ? 'border-red-500 focus:border-red-500' : valid ? 'border-green-500 focus:border-green-500' : 'border-slate-300 focus:border-btn-blue'} rounded-l-md`,
                  dropdownStyleProps: {
                    className: 'absolute z-[9999] max-h-[160px] overflow-auto bg-white shadow-xl', // Cambiado de max-h-[50vh] a max-h-[160px]
                    style: { 
                      position: 'absolute',
                      maxHeight: '160px' // Cambiado de '50vh' a '160px'
                    },
                  },
                }}
                preferredCountries={['us', 'mx', 'ca', 'es', 'co', 'ar', 'br', 'pe', 'cl', 've', 'do']}
              />
              {showError && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
              )}
              {valid && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <label
                htmlFor={name}
                className={`absolute left-0 -top-5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-btn-blue peer-focus:text-sm ${showError ? 'text-red-500' : valid ? 'text-btn-blue' : ''}`}
              >
                {label}
              </label>
            </div>
          );
        }}
      />
  <p className={`mt-2 text-xs ${(showErrorGlobal ? 'text-red-500' : 'text-slate-500')}`} aria-live="polite">
        {showErrorGlobal
          ? String((errors as any)[name]?.message)
          : 'Selecciona el país con la banderita y escribe tu número. Se guarda en formato internacional (+prefijo...).'}
      </p>
    </div>
  );
};

export default CustomInputPhone;
