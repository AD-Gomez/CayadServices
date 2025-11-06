import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import axios from 'axios';
import logoCayad from '../../../public/img/logo-cayad.webp';
import type { FormQuoteTypes } from '../../types/formQuote.type';
import AutocompleteInput from '../inputs/AutoCompletInput';
import CheckboxInput from '../inputs/CustomCheckbox';
import AutoSuggestInput from '../inputs/AutoSuggestInput';
import { useEffect, useState } from 'react';
import DateInput from '../inputs/CustomInputDate';
import CustomInputOnlyText from '../inputs/CustomInputOnlyText';
import CustomInput from '../inputs/CustomInput';
import CustomInputPhone from '../inputs/CustomInputPhone';
import * as yup from 'yup';
import { isValidPhoneNumber } from 'libphonenumber-js/max';
import { yupResolver } from '@hookform/resolvers/yup';
import { sendEmail, sendLead } from '../../services/landing';
import { saveEmail, saveLead, saveNumberLead } from '../../services/localStorage';
import { format } from 'date-fns';
import { showNotification } from '../../utils/notificaction';
import { FaRegPaperPlane, FaTrash } from "react-icons/fa";
import ZipcodeAutocompleteRHF from '../inputs/ZipcodeAutocompleteRHF';
import { sendLeadToLanding } from '../../services/lead';
import MakeAsyncSelect from '../MakeAsyncSelect';
import ModelAsyncSelect from '../ModelAsyncSelect';
import VehicleTypeAsyncSelect from '../VehicleTypeAsyncSelect';
import { apiUrl } from '../../services/config';

type QuoteFormWithFlags = FormQuoteTypes & {
  origin_city__isValid: boolean;
  destination_city__isValid: boolean;
};

const validationSchema: yup.ObjectSchema<QuoteFormWithFlags> = yup.object({
  origin_city: yup
    .string()
    .required('Please provide a valid city or zip code.')
    .test('origin-selected', 'Please select a suggestion from the list.', function () {
      return this.parent?.origin_city__isValid === true;
    }),
  destination_city: yup
    .string()
    .required('Please provide a valid city or zip code.')
    .test('destination-selected', 'Please select a suggestion from the list.', function () {
      return this.parent?.destination_city__isValid === true;
    }),
  transport_type: yup.string().required('Transport type is required'),
  Vehicles: yup.array().of(
    yup.object().shape({
      vehicle_model_year: yup.string()
        .required('Year is required')
        .matches(/^\d{4}$/, 'Year must be a 4 digit number')
        .test('year-range', 'Year is out of valid range', (val) => {
          if (!val) return false;
          const year = parseInt(val, 10);
          const currentYear = new Date().getFullYear() + 1; // allow next year
          return year >= 1900 && year <= currentYear;
        }),
      vehicle_make: yup.string().required('Make is required'),
      vehicle_model: yup.string().required('Model is required'),
      vehicle_type: yup.string().required('Vehicle type is required'),
      vehicle_inop: yup.string().required('Condition is required'),
    })
  ).min(1, 'At least one vehicle is required').required(),
  first_name: yup.string()
    .required('Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Name must only contain letters and spaces')
    .min(3, 'Name must be at least 3 characters')
    .max(20, 'Name must be at most 20 characters'),
  phone: yup.string()
    .required('Phone is required')
    .test('valid-phone', 'Enter a valid phone number for the selected country.', (val) => {
      if (!val) return false;
      try {
        // Validate using libphonenumber against full metadata; value is E.164 from the input
        return isValidPhoneNumber(String(val));
      } catch {
        return false;
      }
    }),
  email: yup.string()
    .required('Email is required')
    .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-z]{2,6}$/, 'Invalid e-mail format')
    .email('Email is not valid'),
  ship_date: yup.string()
    .required('Date is required')
    .test('is-valid-date', 'Date is required', value => value !== '' && !isNaN(Date.parse(value))),
  origin_city__isValid: yup.boolean().default(false),
  destination_city__isValid: yup.boolean().default(false),
}).required();

const FormQuote = () => {
  const methods = useForm<QuoteFormWithFlags>({
    resolver: yupResolver<QuoteFormWithFlags>(validationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      origin_city: '',
      destination_city: '',
      transport_type: '1',
      Vehicles: [
        { vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicle_type: 'sedan', vehicle_inop: '0', vehicle_type_mode: 'preset' },
      ],
      first_name: '',
      phone: '',
      email: '',
      ship_date: '',
      origin_city__isValid: false,
      destination_city__isValid: false,
    },
  });

  const { handleSubmit, control, setValue, watch, formState: { errors }, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Vehicles',
  });

  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [disabledSubmit, setDisabledSubmit] = useState<boolean>(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear() + 1; // Include next year model
    const yearsArray = Array.from(new Array(50), (val, index) => {
      const year = currentYear - index;
      return { value: year.toString(), label: year.toString() };
    });
    setYears(yearsArray);
  }, []);

  const [disabled, setDisabled] = useState(true);
  const allFields = watch('Vehicles');
  const [index, setIndex] = useState<number>(0);
  const modelField = watch(`Vehicles.${index}.vehicle_model`);

  useEffect(() => {
    setIndex(allFields.length - 1);
  }, [allFields]);

  useEffect(() => {
    if (modelField !== '') {
      const isFormComplete = allFields.every(
        (field: any) =>
          field.vehicle_model_year !== '' &&
          field.vehicle_make !== '' &&
          field.vehicle_inop !== '' &&
          field.vehicle_type !== ''
      );
      setDisabled(!isFormComplete);
    }
  }, [allFields, modelField]);

  const handleSubmitLead = async (data: any) => {
    try {
      setDisabled(true);
      // Ensure there is at least one vehicle
      if (!data?.Vehicles || !Array.isArray(data.Vehicles) || data.Vehicles.length < 1) {
        showNotification({ text: 'At least one vehicle is required to request a quote.', icon: 'error' });
        setDisabled(false);
        return;
      }

      // Phone comes already in E.164 (e.g., +13051234567) from the input component
      const payload: any = { ...data };
      const resp = await sendLeadToLanding(payload);

      if (resp?.status === "success" && resp.id) {
        saveNumberLead(String(resp.id));
        showNotification({ text: "Success!", icon: "success" });
        saveLead?.(data);
        saveEmail?.({ ...data, crm_lead_id: resp.id });
        setTimeout(() => {
          reset?.();
          window.location.href = "/quote2";
        }, 2000);
      } else {
        showNotification({ text: "Error sending quote", icon: "error" });
      }
    } catch (e) {
      console.error(e);
      showNotification({ text: "Error sending lead", icon: "error" });
    } finally {
      setDisabled(false);
      setDisabledSubmit(false);
    }
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return format(dateObj, 'MM/dd/yyyy');
  };

  const onSubmit = (data: FormQuoteTypes) => {
    setDisabledSubmit(true);
    const formattedDate = formatDate(data.ship_date);
    const dataToLead = {
      AuthKey: "f895aa95-10ea-41ae-984f-c123bf7e0ff0", // Example key
      ...data,
      ship_date: formattedDate,
    };
    handleSubmitLead(dataToLead);
  };

  // Helper to determine if there are vehicle-related errors to show to the user
  const vehiclesErrors = (errors as any)?.Vehicles;
  const hasVehiclesError = (() => {
    if (!vehiclesErrors) return false;
    if (vehiclesErrors?.message) return true;
    // If it's an array, check if any index contains an error object
    if (Array.isArray(vehiclesErrors)) {
      return vehiclesErrors.some((item: any) => item && Object.keys(item).length > 0);
    }
    // Otherwise if it's an object with keys, show generic message
    return Object.keys(vehiclesErrors).length > 0;
  })();

  const vehiclesErrorMessage = (() => {
    if (!vehiclesErrors) return '';
    if (!Array.isArray(vehiclesErrors) && typeof vehiclesErrors.message === 'string') return vehiclesErrors.message;
    if (Array.isArray(vehiclesErrors)) {
      // If any item has keys, show a clear message
      for (const item of vehiclesErrors) {
        if (item && typeof item === 'object' && Object.keys(item).length > 0) {
          return 'Please complete all vehicle fields.';
        }
      }
      return 'Please add at least one valid vehicle and ensure all fields are completed.';
    }
    if (typeof vehiclesErrors === 'object' && Object.keys(vehiclesErrors).length > 0) return 'Please complete vehicle details.';
    return '';
  })();


    return (
    <FormProvider {...methods}>
      {/*
        ESTE ES EL DIV PRINCIPAL.
        Nota cómo NO tiene clases de altura como h-screen, min-h-screen, etc.
        Solo define la apariencia de la tarjeta. Esto es clave.
      */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Get Your Premium Shipping Quote</h1>
          <p className="mt-1 text-sm text-slate-500">Fast, easy, and no obligation.</p>
        </div>

        <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            
            <fieldset className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-sky-500 text-white h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <legend className="text-md font-semibold text-slate-800">Origin & Destination</legend>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-x-4 gap-y-5">
                <ZipcodeAutocompleteRHF fieldNames={{ value: 'origin_city' }} label='Shipping FROM' placeholder='City or Zip Code' />
                <ZipcodeAutocompleteRHF fieldNames={{ value: 'destination_city' }} label='Shipping TO' placeholder='City or Zip Code' />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transport Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <Controller name={'transport_type'} control={control} render={({ field }) => (
                    <div>
                      <input {...field} type="radio" id="transport_open" value="1" checked={field.value === '1'} className="sr-only peer" />
                      <label htmlFor="transport_open" className="block text-center w-full py-2.5 px-3 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors text-sm">Open</label>
                    </div>
                  )}/>
                  <Controller name={'transport_type'} control={control} render={({ field }) => (
                    <div>
                      <input {...field} type="radio" id="transport_enclosed" value="2" checked={field.value === '2'} className="sr-only peer" />
                      <label htmlFor="transport_enclosed" className="block text-center w-full py-2.5 px-3 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors text-sm">Enclosed</label>
                    </div>
                  )}/>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-sky-500 text-white h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <legend className="text-md font-semibold text-slate-800">Vehicle Details</legend>
              </div>
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="p-3 pt-4 border border-slate-200 rounded-lg space-y-4 relative bg-slate-50/50">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 transition-colors" aria-label="Remove vehicle">
                        <FaTrash />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                      <Controller name={`Vehicles.${index}.vehicle_model_year`} control={control} render={({ field }) => <AutoSuggestInput {...field} label="Year" options={years} />} />
                      <MakeAsyncSelect name={`Vehicles.${index}.vehicle_make`} label="Make" endpoint={apiUrl('/api/vehicles/makes')} onPickedMake={() => setValue(`Vehicles.${index}.vehicle_model`, '', { shouldDirty: true, shouldValidate: true })} />
                      <ModelAsyncSelect name={`Vehicles.${index}.vehicle_model`} label="Model" endpoint={apiUrl('/api/vehicles/models')} make={watch(`Vehicles.${index}.vehicle_make`)} disabled={!watch(`Vehicles.${index}.vehicle_make`)} />
                    </div>
                    {/* Vehicle type: presets (3 per row) + Other (backend) */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        {['sedan','coupe','suv','pickup','van','motorcycle'].map((opt) => (
                          <Controller key={opt} name={`Vehicles.${index}.vehicle_type`} control={control} render={({ field }) => (
                            <div>
                              <input {...field} type="radio" id={`vt_${opt}_${index}`} value={opt} checked={field.value === opt && watch(`Vehicles.${index}.vehicle_type_mode`) !== 'other'} className="sr-only peer" onChange={(e) => {
                                field.onChange(e.target.value);
                                setValue(`Vehicles.${index}.vehicle_type_mode`, 'preset', { shouldDirty: true, shouldValidate: true });
                              }} />
                              <label htmlFor={`vt_${opt}_${index}`} className="block text-center w-full py-2 px-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold text-[11px] capitalize transition-colors">{opt}</label>
                            </div>
                          )} />
                        ))}
                        <Controller name={`Vehicles.${index}.vehicle_type_mode`} control={control} render={({ field }) => (
                          <div>
                            <input type="radio" id={`vt_other_${index}`} value="other" checked={field.value === 'other'} className="sr-only peer" onChange={() => field.onChange('other')} />
                            <label htmlFor={`vt_other_${index}`} className="block text-center w-full py-2 px-2 rounded-lg border border-amber-400 cursor-pointer peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500 font-semibold text-[11px] uppercase transition-colors">Other</label>
                          </div>
                        )} />
                      </div>
                      {watch(`Vehicles.${index}.vehicle_type_mode`) === 'other' && (
                        <VehicleTypeAsyncSelect
                          name={`Vehicles.${index}.vehicle_type`}
                          label="Other Type"
                          endpoint={apiUrl('/api/vehicles/types')}
                          make={watch(`Vehicles.${index}.vehicle_make`)}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Is it running?</label>
                      <div className="flex gap-3">
                        <Controller name={`Vehicles.${index}.vehicle_inop`} control={control} render={({ field }) => (
                            <div>
                                <input {...field} type="radio" id={`running_yes_${index}`} value="0" checked={field.value === '0'} className="sr-only peer" />
                                <label htmlFor={`running_yes_${index}`} className="text-sm block text-center w-full px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">Yes</label>
                            </div>
                        )}/>
                        <Controller name={`Vehicles.${index}.vehicle_inop`} control={control} render={({ field }) => (
                            <div>
                                <input {...field} type="radio" id={`running_no_${index}`} value="1" checked={field.value === '1'} className="sr-only peer" />
                                <label htmlFor={`running_no_${index}`} className="text-sm block text-center w-full px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">No</label>
                            </div>
                        )}/>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" disabled={disabled} onClick={() => append({ vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicle_type: 'sedan', vehicle_inop: '0', vehicle_type_mode: 'preset' })} className={`w-full font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-sky-500 hover:text-sky-500 transition-colors text-sm ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                  + Add Another Vehicle
                </button>
                {hasVehiclesError && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {vehiclesErrorMessage || 'Please add at least one valid vehicle and ensure all fields are completed.'}
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-sky-500 text-white h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <legend className="text-md font-semibold text-slate-800">Contact & Date</legend>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-x-4 gap-y-5">
                <DateInput name='ship_date' label='Preferred Pickup Date' />
                <CustomInputOnlyText name='first_name' max={20} type='text' label='Full Name' />
                <CustomInput name='email' max={30} label='Email Address' />
                <CustomInputPhone name='phone' type='text' max={14} label='Phone Number' />
              </div>
            </fieldset>
            
            <div>
              <small className="text-xs text-slate-500">
                By clicking "Get My Quote", you agree to our 
                <a href="/pdfs/Terms-and-Conditions.pdf" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-700"> Terms </a>
                and <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-700"> Privacy Policy</a>, and consent to receive calls, texts, and emails.
              </small>
              <button disabled={disabledSubmit} className={`mt-3 w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-all duration-300 text-base ${disabledSubmit ? 'cursor-not-allowed bg-slate-400' : ''}`}>
                Get My Premium Quote
                <FaRegPaperPlane />
              </button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default FormQuote;