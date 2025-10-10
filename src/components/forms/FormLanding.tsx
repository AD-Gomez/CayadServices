import * as yup from 'yup';
import { useCallback, useEffect, useState } from "react";
import CustomInput from "../inputs/CustomInput";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import DateInput from '../inputs/CustomInputDate';
import { saveEmail, saveLead, saveNumberLead } from '../../services/localStorage';
import { FaRegPaperPlane } from "react-icons/fa";
import CustomInputOnlyText from '../inputs/CustomInputOnlyText';
import AutoSuggestInput from '../inputs/AutoSuggestInput';
import CustomInputPhone from '../inputs/CustomInputPhone';
import { format } from 'date-fns';
import { showNotification } from '../../utils/notificaction';
import ZipcodeAutocompleteRHF from '../inputs/ZipcodeAutocompleteRHF';
import { type LandingFormInput } from '../../utils/buildLandingPayload';
import { sendLeadToLanding } from '../../services/lead';
import MakeAsyncSelect from '../MakeAsyncSelect';
import ModelAsyncSelect from '../ModelAsyncSelect';
import { isValidPhoneNumber } from 'libphonenumber-js/max';

interface FormValues {
  origin_city: string;
  destination_city: string;
  transport_type: string;
}

type Step1FormValues = FormValues & {
  origin_city__isValid: boolean;
  destination_city__isValid: boolean;
};

const validationSchemaStep1: yup.ObjectSchema<Step1FormValues> = yup.object({
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
  origin_city__isValid: yup.boolean().default(false),
  destination_city__isValid: yup.boolean().default(false),
}).required();


const Step1 = ({ setActiveStep, setDataSubmit, dataSubmit }: any) => {
  const methods = useForm<Step1FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver<Step1FormValues>(validationSchemaStep1),
    defaultValues: {
      origin_city: dataSubmit.origin_city || '',
      destination_city: dataSubmit.destination_city || '',
      transport_type: dataSubmit.transport_type || '1',
      origin_city__isValid: false,
      destination_city__isValid: false,
    } satisfies Step1FormValues,
  });

  const { handleSubmit, trigger, formState: { errors }, control } = methods;

  const onSubmit = async (data: FormValues) => {
    const isValid = await trigger();
    if (!isValid) {
      return;
    }

    setDataSubmit((prevData: any) => ({
      ...prevData,
      ...data
    }));
    setActiveStep(1);
  };

  return (
    <FormProvider {...methods}>
      <section id="paso1" className="w-full mt-4 flex flex-col items-center">
        <form onSubmit={handleSubmit(onSubmit)} className='w-[90%]'>
          <div className="flex flex-col mb-1 w-full relative bg-white p-4 border border-gray-200">


            <ZipcodeAutocompleteRHF
              fieldNames={{ value: "origin_city" }}
              label="Transport Vehicle FROM"
              placeholder="Miami, FL 33101"
            />
          </div>
          <div className="flex flex-col mb-1 w-full relative bg-white p-4 border border-gray-200">


            <ZipcodeAutocompleteRHF
              fieldNames={{ value: "destination_city" }}
              label="Transport Vehicle TO"
              placeholder="Alameda, CA 94501"
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Transport Type</label>
            <div className="grid grid-cols-2 gap-3">
              <Controller name={'transport_type'} control={control} render={({ field }) => (
                <div>
                  <input {...field} type="radio" id="transport_open_small" value="1" checked={field.value === '1'} className="sr-only peer" />
                  <label htmlFor="transport_open_small" className="block text-center w-full py-2.5 px-3 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors text-sm">Open</label>
                </div>
              )}/>
              <Controller name={'transport_type'} control={control} render={({ field }) => (
                <div>
                  <input {...field} type="radio" id="transport_enclosed_small" value="2" checked={field.value === '2'} className="sr-only peer" />
                  <label htmlFor="transport_enclosed_small" className="block text-center w-full py-2.5 px-3 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors text-sm">Enclosed</label>
                </div>
              )}/>
            </div>
            {errors.transport_type && <p className="text-red-500 text-xs italic mt-1">{errors.transport_type.message}</p>}
          </div>
          <button
            type="submit"
            className="bg-btn-blue flex items-center hover:bg-btn-hover transition-colors duration-500 ease-in-out focus:outline-none justify-center cursor-pointer text-lg mb-4 w-full h-10 mt-5 text-white rounded-lg px-4 font-semibold"
          >
            Add Vehicle Details
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </section>
    </FormProvider>
  );
};

const validationSchema = yup.object({
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
      vehicle_inop: yup.string().required('Condition is required'),
    })
  ).min(1, 'At least one vehicle is required').required(),
}).required();

type Vehicle = {
  vehicle_model_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_inop: string;
};

type FormValuesVehicle = { Vehicles: Vehicle[] };

type Props = {
  setActiveStep: (n: number) => void;
  setDataSubmit: (data: any) => void;
  dataSubmit: { Vehicles?: Vehicle[] };
};

function VehicleRow({
  index,
  control,
  setValue,
  remove,
  years,
}: {
  index: number;
  control: any;
  setValue: any;
  remove: (i: number) => void;
  years: { value: string; label: string }[];
}) {
  const make: string = useWatch({ control, name: `Vehicles.${index}.vehicle_make` });

  return (
    <div className="p-3 pt-4 border border-slate-200 rounded-lg space-y-4 relative bg-slate-50/50 my-4">
      <div className="form--group form--group--section mb-4 mt-4">
        <AutoSuggestInput
          name={`Vehicles.${index}.vehicle_model_year`}
          label="Vehicle Year"
          options={years}
        />
      </div>

      {/* Make (async) */}
      <div className="form--group form--group--section">
        <MakeAsyncSelect
          name={`Vehicles.${index}.vehicle_make`}
          label="Vehicle Make"
          endpoint={`https://backupdjango-production.up.railway.app/api/vehicles/makes`}
          onPickedMake={() => {
            setValue(`Vehicles.${index}.vehicle_model`, '', { shouldDirty: true, shouldValidate: true });
          }}
        />
      </div>

      <div className="form--group mt-4 form--group--section">
        <ModelAsyncSelect
          name={`Vehicles.${index}.vehicle_model`}
          label="Vehicle Model"
          endpoint={`https://backupdjango-production.up.railway.app/api/vehicles/models`}
          make={make}
          disabled={!make}
        />
      </div>

      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Is it running?</label>
        <div className="flex gap-3">
          <Controller name={`Vehicles.${index}.vehicle_inop`} control={control} render={({ field }) => (
              <div>
                  <input {...field} type="radio" id={`running_yes_small_${index}`} value="0" checked={field.value === '0'} className="sr-only peer" />
                  <label htmlFor={`running_yes_small_${index}`} className="text-sm block text-center w-full px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">Yes</label>
              </div>
          )}/>
          <Controller name={`Vehicles.${index}.vehicle_inop`} control={control} render={({ field }) => (
              <div>
                  <input {...field} type="radio" id={`running_no_small_${index}`} value="1" checked={field.value === '1'} className="sr-only peer" />
                  <label htmlFor={`running_no_small_${index}`} className="text-sm block text-center w-full px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">No</label>
              </div>
          )}/>
        </div>
      </div>

      <div className="d-flex end dashed mt-2">
        <button
          type="button"
          onClick={() => remove(index)}
          className="text-red-600 border border-red-400 hover:bg-red-600 hover:text-white rounded-md px-3 py-2 font-semibold transition-colors"
          aria-label={`Remove vehicle ${index + 1}`}
        >
          Remove car
        </button>
      </div>
    </div>
  );
}



const Step2: React.FC<Props> = ({ setActiveStep, setDataSubmit, dataSubmit }) => {
  const methods = useForm<FormValuesVehicle>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      Vehicles: dataSubmit?.Vehicles || [
        { vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' },
      ],
    },
    mode: 'onChange',
  });

  const { handleSubmit, control, setValue } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'Vehicles' });

  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const currentYear = new Date().getFullYear() + 1; // Include next year model
    setYears(
      Array.from({ length: 50 }, (_, i) => {
        const y = String(currentYear - i);
        return { value: y, label: y };
      })
    );
  }, []);

  // Allow adding vehicles at any time; validation occurs on submit. Limit to max 10 vehicles.

  const onSubmit = (data: FormValuesVehicle) => {
    const normalized: FormValuesVehicle = {
      Vehicles: data.Vehicles.map(v => ({
        ...v,
        vehicle_make: v.vehicle_make?.toLowerCase() ?? '',
        vehicle_model: v.vehicle_model?.toLowerCase() ?? '',
      })),
    };
    setDataSubmit(normalized);
    setActiveStep(2);
  };

  const handleStepBack = () => setActiveStep(0);

  return (
    <FormProvider {...methods}>
      <section id="paso2" className="form--quote--content mt-2 min-w-[90%] block">
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((item, idx) => (
            <VehicleRow
              key={item.id}
              index={idx}
              control={control}
              setValue={setValue}
              remove={remove}
              years={years}
            />
          ))}

          {fields.length < 10 && (
            <button
              className={`bg-white border border-btn-blue text-btn-blue py-2 px-4 mt-4 rounded-lg cursor-pointer`}
              type="button"
              onClick={() =>
                append({ vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' })
              }
            >
              Add Another Vehicle
            </button>
          )}

          <button
            className="bg-btn-blue flex justify-center items-center hover:bg-btn-hover transition-colors duration-500 ease-in-out focus:outline-none cursor-pointer w-full h-10 mt-5 text-white rounded-lg font-semibold"
            type="submit"
          >
            Contact Details
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        </form>

        <footer className="flex justify-around text-center py-4">
          <div className="flex flex-col items-center">
            <button type="button" onClick={handleStepBack} className="bg-btn-blue flex justify-center items-center text-white w-8 h-8 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <small>Location</small>
          </div>
          <div className="flex flex-col items-center">
            <button type="button" className="border border-btn-blue text-btn-blue w-8 h-8 rounded-full">2</button>
            <small>Vehicle(s)</small>
          </div>
          <div className="flex flex-col items-center">
            <button type="button" className="border border-btn-blue text-btn-blue w-8 h-8 rounded-full">3</button>
            <small>Contact</small>
          </div>
        </footer>
      </section>
    </FormProvider>
  );
};

// removed unused helper separarCiudadYEstado

const Step3 = ({ dataSubmit, handleSubmitLeadAndEmail, setActiveStep, setDataSubmit }: any) => {
  const [disabled, setDisabled] = useState<boolean>(false)
  const validationSchema = yup.object().shape({
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
      .test('is-valid-date', 'Date is required', value => value !== '' && !isNaN(Date.parse(value)))
  });

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: dataSubmit.first_name || '',
      phone: dataSubmit.phone || '',
      email: dataSubmit.email || '',
      ship_date: dataSubmit.ship_date || '',
    },
  });

  const { handleSubmit } = methods;

  const originCityAndState = dataSubmit?.origin_city;

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return format(dateObj, 'MM/dd/yyyy');
  };
  const onSubmit = (data: any) => {
    setDisabled(true)
    const formattedDate = formatDate(data.ship_date);

    const dataToSend = {
      ...dataSubmit,
      ...data,
      AuthKey: "f895aa95-10ea-41ae-984f-c123bf7e0ff0",
      ship_date: formattedDate
    };
    handleSubmitLeadAndEmail(dataToSend)
  };
  const handleStepBack = (step: number) => {
    const datavalue = methods.getValues()
    setDataSubmit(datavalue);
    setActiveStep(step);
  };

  return (
    <FormProvider {...methods}>
      <section id="paso3" className={`form--quote--content mt-4 block max-w-[90%]`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInputOnlyText name='first_name' max={20} type='text' label='Name' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInputPhone name='phone' type='text' max={14} label='Phone' defaultValue={methods.getValues('phone')}
            />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInput name='email' max={30} label='Email' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <DateInput name='ship_date' label='Date' />
          </div>
          <div className="flex text-xs gap-4 py-2 border-b border-dashed">
            <small id="termsAndConditions">
              By providing your phone number/email and clicking through, you agree to Cayad Auto Transport's
              <a href="/pdfs/Terms-and-Conditions.pdf" className="text-btn-blue underline"> Terms </a>
              and <a href="/privacy-policy/" className="text-btn-blue underline"> Privacy Policy </a> , and authorize us to make or initiate sales Calls, SMS, Emails, and prerecorded voicemails to that number using an automated system. Your agreement is not a condition of purchasing any products, goods, or services. You may opt out at any time by typing STOP. Message & data rates may apply.
            </small>
          </div>
          <button
            id="submit_button" disabled={disabled}
            className={`bg-btn-blue hover:bg-btn-hover transition-colors duration-500 ease-in-out focus:outline-none flex items-center justify-center cursor-pointer w-full h-10 mt-5 text-white rounded-lg font-semibold
              ${disabled ? 'opacity-[0.6] hover:cursor-not-allowed ' : ''}
              `}
            type="submit"
          >

            {disabled
              ? <p className='mr-2'>Loading</p>
              : <p className='mr-2'>Submit</p>
            }


            <FaRegPaperPlane />
          </button>
        </form>
        <footer className="flex justify-around text-center py-4">
          <div className="flex flex-col items-center" >
            <button type="button" onClick={() => { handleStepBack(0) }} className="bg-btn-blue text-center flex justify-center items-center text-white w-8 h-8 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <small>Location</small>
          </div>
          <div className="flex flex-col items-center" >
            <button type="button" onClick={() => { handleStepBack(1) }} className="bg-btn-blue flex justify-center items-center text-white w-8 h-8 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <small>Vehicle(s)</small>
          </div>
          <div className="flex flex-col items-center">
            <button type="button" className="border border-btn-blue text-btn-blue w-8 h-8 rounded-full">3</button>
            <small>Contact</small>
          </div>
        </footer>
      </section>
    </FormProvider>
  );
};

// Legacy helper removed: lead number is returned by sendLeadToLanding JSON response

const FormLanding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [dataSubmit, setDataSubmit] = useState<any>({});
  const [disabled, setDisabled] = useState(false);

  const updateFormData = (newData: any) => {
    setDataSubmit((prevData: any) => ({
      ...prevData,
      ...newData,
    }));
  };

  const handleSubmitLead = async (data: LandingFormInput) => {
    try {
      setDisabled(true);

      // Phone comes already in E.164 format from CustomInputPhone
      const payload: LandingFormInput = { ...data };
      const resp = await sendLeadToLanding(payload);

      if (resp?.status === "success" && typeof resp.id !== "undefined") {
        saveNumberLead(String(resp.id));
        showNotification({ text: "Success!", icon: "success" });
        saveLead?.(payload as any);
        saveEmail?.({ ...(payload as any), crm_lead_id: resp.id });

        setTimeout(() => {
          window.location.href = "/quote2";
        }, 2000);
      } else {
        showNotification({ text: "Error sending quote", icon: "error" });
      }
    } catch (err) {
      showNotification({ text: "Error sending lead", icon: "error" });
    } finally {
      setDisabled(false);
    }
  };

  const renderContent = useCallback(() => {
    switch (activeStep) {
      case 1:
        return (
          <Step2
            setActiveStep={setActiveStep}
            dataSubmit={dataSubmit}
            setDataSubmit={updateFormData}
          />
        );
      case 2:
        return (
          <Step3
            disabled={disabled}
            dataSubmit={dataSubmit}
            setActiveStep={setActiveStep}
            // ⬇️ mantiene la misma prop que tenías
            handleSubmitLeadAndEmail={handleSubmitLead}
            setDataSubmit={updateFormData}
          />
        );
      default:
        return (
          <Step1
            setActiveStep={setActiveStep}
            dataSubmit={dataSubmit}
            setDataSubmit={setDataSubmit}
          />
        );
    }
  }, [activeStep, dataSubmit, disabled]);

  return (
    <div
      className="
        mx-auto mb-8 flex flex-col items-center justify-between
        overflow-auto rounded-lg bg-white min-h-96 max-h-[450px]
        w-[95%] sm:w-[90%] md:w-[60%] lg:w-[500px] max-w-[500px]
        border border-slate-200 shadow-lg
      "
    >
      {renderContent()}
    </div>
  );
};

export default FormLanding;





