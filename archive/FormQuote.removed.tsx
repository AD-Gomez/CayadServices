import { Controller, FormProvider, useForm, useFieldArray } from 'react-hook-form';
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
import { useMemo } from 'react';

type VehicleRow = {
  vehicle_type: string;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_inop: string; // '0' runs, '1' not running
};

type QuoteFormWithFlags = FormQuoteTypes & {
  origin_city__isValid: boolean;
  destination_city__isValid: boolean;
  Vehicles: VehicleRow[];
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
  // Vehicles: multi rows with unified type select
  Vehicles: yup.array().of(yup.object({
    vehicle_type: yup.string().required('Type is required'),
    vehicle_year: yup.string().required('Year is required').matches(/^(19|20)\d{2}$/,'Year must be YYYY').test('year-range','Year out of range', function (val){
      if (!val) return false; const y = Number(val); const max = new Date().getFullYear()+1; const min = 1970; return y >= min && y <= max;
    }),
    vehicle_make: yup.string().required('Make is required').max(40),
    vehicle_model: yup.string().required('Model is required').max(60),
    vehicle_inop: yup.string().oneOf(['0','1']).required(),
  }).required()).required().min(1,'Add at least one vehicle'),
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

// Prevent selecting same origin and destination
validationSchema.test('different-origin-destination', 'El origen y el destino no pueden ser iguales', function (val) {
  if (!val) return true;
  const o = String((val as any).origin_city || '').trim().toLowerCase();
  const d = String((val as any).destination_city || '').trim().toLowerCase();
  if (!o || !d) return true;
  if (o === d) {
    return this.createError({ path: 'destination_city', message: 'El origen y el destino no pueden ser iguales' });
  }
  return true;
});

const FormQuote = () => {
  const methods = useForm<QuoteFormWithFlags>({
    resolver: yupResolver<QuoteFormWithFlags>(validationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      origin_city: '',
      destination_city: '',
      transport_type: '1',
      first_name: '',
      phone: '',
      email: '',
      ship_date: '',
      origin_city__isValid: false,
      destination_city__isValid: false,
      Vehicles: [ { vehicle_type: 'car', vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' } ],
    },
  });

  const { handleSubmit, control, setValue, watch, formState: { errors }, reset } = methods;

  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [disabledSubmit, setDisabledSubmit] = useState<boolean>(false);

  // FieldArray for Vehicles
  const { fields: vehicleFields, append, remove } = useFieldArray({ control, name: 'Vehicles' as const });

  useEffect(() => {
    const currentYear = new Date().getFullYear() + 1; // Include next year model
    const yearsArray = Array.from(new Array(50), (val, index) => {
      const year = currentYear - index;
      return { value: year.toString(), label: year.toString() };
    });
    setYears(yearsArray);
  }, []);

  // Summary by type
  const vehiclesWatch = watch('Vehicles');
  const vehiclesSummary = useMemo(() => {
    if (!vehiclesWatch || vehiclesWatch.length === 0) return '';
    const counts: Record<string, number> = {};
    vehiclesWatch.forEach((row) => {
      const t = String(row?.vehicle_type || '').trim();
      if (!t) return; counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([t, c]) => `${c}× ${t}`).join(', ');
  }, [vehiclesWatch]);

  const handleSubmitLead = async (data: any) => {
    try {
      setDisabledSubmit(true);
      // Vehicles no longer required/collected

      // Phone comes already in E.164 (e.g., +13051234567) from the input component
      const payload: any = { ...data, vehicles_summary: vehiclesSummary };
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
      vehicles_summary: vehiclesSummary,
    };
    handleSubmitLead(dataToLead);
  };

  // Vehicle error helpers removed


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

            {/* Vehicles (multi rows with unified type select) */}
            <fieldset className="space-y-4">
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 bg-sky-500 text-white h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <legend className="text-md font-semibold text-slate-800">Vehicles</legend>
                </div>
                <div aria-live="polite" className="inline-flex items-center gap-2">
                  <span className="text-xs text-slate-500">Added</span>
                  <span className="inline-flex items-center justify-center bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-sm font-semibold">{vehicleFields.length}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-4">
                  {vehicleFields.map((item, index) => {
                    const base = `Vehicles.${index}` as const;
                    const makeWatch = watch(`${base}.vehicle_make` as any);
                    return (
                      <div key={item.id} className="p-3 pt-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50/50 relative">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
                          <Controller name={`${base}.vehicle_year` as any} control={control} render={({ field }) => (
                            <div className="flex flex-col">
                              <select {...field} className="bg-white border border-slate-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:border-sky-600">
                                <option value="">Year</option>
                                {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                              </select>
                              <span className="mt-1 text-[11px] text-slate-500">Year</span>
                            </div>
                          )} />
                          <div className="col-span-1 md:col-span-2">
                            <MakeAsyncSelect
                              name={`${base}.vehicle_make`}
                              label="Make"
                              endpoint={apiUrl('/api/vehicles/makes')}
                              onPickedMake={() => setValue(`${base}.vehicle_model`, '', { shouldDirty: true, shouldValidate: true })}
                            />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <ModelAsyncSelect
                              name={`${base}.vehicle_model`}
                              label="Model"
                              endpoint={apiUrl('/api/vehicles/models')}
                              make={makeWatch}
                              disabled={!makeWatch}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
                          <div className="md:col-span-2">
                            <VehicleTypeAsyncSelect
                              name={`${base}.vehicle_type`}
                              label="Type"
                              endpoint={apiUrl('/api/vehicles/types')}
                              hidePresets={false}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Running?</label>
                              <div className="flex gap-3">
                                <Controller name={`${base}.vehicle_inop` as any} control={control} render={({ field }) => (
                                  <div>
                                    <input {...field} type="radio" id={`run_yes_${index}`} value="0" checked={field.value === '0'} className="sr-only peer" />
                                    <label htmlFor={`run_yes_${index}`} className="text-xs block text-center w-full px-3 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">Yes</label>
                                  </div>
                                )} />
                                <Controller name={`${base}.vehicle_inop` as any} control={control} render={({ field }) => (
                                  <div>
                                    <input {...field} type="radio" id={`run_no_${index}`} value="1" checked={field.value === '1'} className="sr-only peer" />
                                    <label htmlFor={`run_no_${index}`} className="text-xs block text-center w-full px-3 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">No</label>
                                  </div>
                                )} />
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">Non-running vehicles require winch/forklift assistance.</p>
                            </div>
                          </div>
                          <div className="flex items-start justify-end md:col-span-1">
                            {vehicleFields.length > 1 && (
                              <button type="button" onClick={() => remove(index)} className="text-red-600 border border-red-400 hover:bg-red-600 hover:text-white rounded-md px-3 py-2 text-xs font-semibold transition-colors">Remove</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {vehicleFields.length < 10 && (
                    <button type="button" onClick={() => append({ vehicle_type: 'car', vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' })} className="w-full font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-sky-500 hover:text-sky-500 transition-colors text-sm">+ Add Another Vehicle</button>
                  )}
                </div>
                {vehicleFields.length > 0 && (
                  <div className="pt-3">
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-amber-900">You added {vehicleFields.length} vehicle{vehicleFields.length > 1 ? 's' : ''}</p>
                          <p className="text-xs text-amber-800">We’ll use these details to provide accurate quotes.</p>
                        </div>
                        <div className="text-sm text-amber-900 font-medium">{vehiclesSummary}</div>
                      </div>
                    </div>
                  </div>
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
              <button disabled={disabledSubmit} className={`mt-3 w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-all duration-300 text-base ${disabledSubmit ? 'cursor-not-allowed bg-slate-400' : ''}`}>
                Request YOUR Premium Quote
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