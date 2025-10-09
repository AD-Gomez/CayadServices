import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js/max';

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

  // Country-specific minimums (national significant number length)
  const MIN_NSN: Record<string, number> = {
    us: 10,
    ca: 10,
    do: 10,
    mx: 10,
    es: 9,
    co: 10,
    ar: 10,
    br: 10, // Brazil landline 10, mobiles 11 (handled by max)
    pe: 9,
    cl: 9,
    ve: 10,
  };

  // English country names for our preferred set
  const COUNTRY_EN: Record<string, string> = {
    us: 'United States',
    ca: 'Canada',
    do: 'Dominican Republic',
    mx: 'Mexico',
    es: 'Spain',
    co: 'Colombia',
    ar: 'Argentina',
    br: 'Brazil',
    pe: 'Peru',
    cl: 'Chile',
    ve: 'Venezuela',
  };

  // Example international formats per country
  const EXAMPLES: Record<string, string> = {
    us: '+1 201 555 0123',
    ca: '+1 204 555 0123',
    do: '+1 809 234 5678',
    mx: '+52 55 1234 5678',
    es: '+34 612 34 56 78',
    co: '+57 321 123 4567',
    ar: '+54 9 11 2345 6789',
    br: '+55 11 91234 5678',
    pe: '+51 912 345 678',
    cl: '+56 9 6123 4567',
    ve: '+58 412 123 4567',
  };

  // Build calling-code -> iso2 map from the examples so we can infer country from a leading +code while typing
  const CALLING_CODE_TO_ISO: Record<string, string> = {};
  Object.keys(EXAMPLES).forEach((iso) => {
    try {
      const p = parsePhoneNumberFromString(EXAMPLES[iso]);
      if (p && p.countryCallingCode) CALLING_CODE_TO_ISO[String(p.countryCallingCode)] = iso;
    } catch {}
  });

  // Compute helper text needs (digits missing) using current form value
  const parsedGlobal = (() => {
    try { return parsePhoneNumberFromString(currentValueGlobal || ''); } catch { return undefined; }
  })();
  // If parsing doesn't give a country (incomplete number), try to infer from the dial code (+xx)
  let iso2Global = parsedGlobal?.country?.toLowerCase?.();
  if (!iso2Global) {
    const m = String(currentValueGlobal || '').match(/^\+(\d{1,3})/);
    if (m) {
      const maybe = CALLING_CODE_TO_ISO[m[1]];
      if (maybe) iso2Global = maybe;
    }
  }
  const nsnLenGlobal = parsedGlobal?.nationalNumber ? String(parsedGlobal.nationalNumber).length : 0;
  const minRequiredGlobal = iso2Global ? MIN_NSN[iso2Global] : undefined;
  const needsMoreDigitsGlobal = interactedGlobal && Boolean(minRequiredGlobal) && nsnLenGlobal > 0 && nsnLenGlobal < Number(minRequiredGlobal);
  const countryLabelEN = iso2Global ? (COUNTRY_EN[iso2Global] || iso2Global.toUpperCase()) : '';
  const exampleForCountry = iso2Global ? (EXAMPLES[iso2Global] || '') : '';

  // Max national significant number lengths for our supported/preferred countries
  // Keys are lower-case ISO2 codes to match react-international-phone conventions
  const MAX_NSN: Record<string, number> = {
    us: 10,
    ca: 10,
    do: 10,
    mx: 10,
    es: 9,
    co: 10,
    ar: 10,
    br: 11,
    pe: 9,
    cl: 9,
    ve: 10,
  };

  return (
  <div className="relative mb-4"> {/* slightly larger bottom margin to separate label/helper from next element */}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ''}
        render={({ field: { value, onChange, onBlur, ref } }) => {
          // Validate by country using libphonenumber-js (works with E.164 input)
          const isE164 = (v: string) => {
            if (!v) return false;
            try {
              return isValidPhoneNumber(String(v));
            } catch {
              return false;
            }
          };
          // Use the globals computed above and also show error if national number is shorter than country minimum
          const parsedLocal = (() => { try { return parsePhoneNumberFromString(String(value || '')); } catch { return undefined; } })();
          const iso2Local = parsedLocal?.country?.toLowerCase?.();
          const minLocal = iso2Local ? MIN_NSN[iso2Local] : undefined;
          const nsnLocal = parsedLocal?.nationalNumber ? String(parsedLocal.nationalNumber) : '';
          const tooShortLocal = interactedGlobal && Boolean(minLocal) && nsnLocal.length > 0 && nsnLocal.length < Number(minLocal);
          const showError = showErrorGlobal || tooShortLocal;
          const valid = !fieldErrorGlobal && interactedGlobal && isE164(String(value || ''));
          return (
            <div className="relative">
              <PhoneInput
                ref={ref as any}
                defaultCountry="us"
                value={String(value || '')}
                onChange={(next) => {
                  const raw = String(next || '');
                  // Try to parse and clamp national number by country max length
                  try {
                    const parsed = parsePhoneNumberFromString(raw);
                    if (parsed && parsed.country) {
                      const iso2 = parsed.country.toLowerCase();
                      const max = MAX_NSN[iso2];
                      if (max && parsed.nationalNumber) {
                        const nsn = parsed.nationalNumber.toString();
                        if (nsn.length > max) {
                          const clamped = nsn.slice(0, max);
                          const clampedE164 = `+${parsed.countryCallingCode}${clamped}`;
                          if (clampedE164 !== raw) {
                            onChange(clampedE164);
                            return;
                          }
                        }
                      }
                    }
                  } catch {}
                  onChange(raw);
                }}
                onBlur={onBlur}
                placeholder="Enter phone number"
                forceDialCode
                inputProps={{ name }}
                className="w-full"
                // Increase left padding so the country selector (flag + chevron) has space
                inputClassName={`peer w-full bg-white text-gray-900 focus:outline-none h-10 pl-14 pr-10 border rounded-r-md ${showError ? 'border-red-500 focus:border-red-500' : valid ? 'border-green-500 focus:border-green-500' : 'border-slate-300 focus:border-btn-blue'}`}
                style={{
                  // Harmonize with Tailwind and prevent layout jumps
                  ['--react-international-phone-height' as any]: '40px',
                  ['--react-international-phone-font-size' as any]: '14px',
                  ['--react-international-phone-dropdown-top' as any]: '42px',
                }}
                countrySelectorStyleProps={{
                  // Make the country selector wider so flag + chevon fit without overlapping the input text
                  buttonClassName: `h-10 bg-white border ${showError ? 'border-red-500 focus:border-red-500' : valid ? 'border-green-500 focus:border-green-500' : 'border-slate-300 focus:border-btn-blue'} rounded-l-md pl-3 pr-3 min-w-[84px] flex items-center justify-start gap-2`,
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
        {needsMoreDigitsGlobal && minRequiredGlobal
          ? `Enter at least ${minRequiredGlobal} digits for ${countryLabelEN}. Missing ${Number(minRequiredGlobal) - nsnLenGlobal}.`
            : showErrorGlobal
            ? String((errors as any)[name]?.message)
            : (iso2Global && (parsedGlobal?.formatInternational?.() || exampleForCountry)) || (exampleForCountry ? `Example: ${exampleForCountry}` : 'Select your country with the flag and type your phone number. It will be saved in international format (+country code...).')}
      </p>
    </div>
  );
};

export default CustomInputPhone;
