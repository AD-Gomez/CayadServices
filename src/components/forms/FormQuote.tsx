import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import axios from 'axios'
import logoCayad from '../../../public/img/logo-cayad.webp'
import type { FormQuoteTypes } from '../../types/formQuote.type';
import AutocompleteInput from '../inputs/AutoCompletInput';
import CheckboxInput from '../inputs/CustomCheckbox';
import AutoSuggestInput from '../inputs/AutoSuggestInput';
import { useEffect, useState } from 'react';
import DateInput from '../inputs/CustomInputDate';
import CustomInputOnlyText from '../inputs/CustomInputOnlyText';
import CustomInput from '../inputs/CustomInput';
import CustomInputPhone from '../inputs/CustomInputPhone';
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { sendEmail, sendLead } from '../../services/landing';
import { saveEmail, saveLead, saveNumberLead } from '../../services/localStorage';
import { format } from 'date-fns';
import { showNotification } from '../../utils/notificaction';
import { FaRegPaperPlane } from "react-icons/fa";
import ZipcodeAutocompleteRHF from '../inputs/ZipcodeAutocompleteRHF';
import { sendLeadToLanding } from '../../services/lead';
import MakeAsyncSelect from '../MakeAsyncSelect';
import ModelAsyncSelect from '../ModelAsyncSelect';

const validationSchema = yup.object().shape({
  origin_city: yup.string()
    .required('Please provide a valid city or zip code.'),
  destination_city: yup.string()
    .required('Please provide a valid city or zip code.'),
  transport_type: yup.string()
    .required('Transport type is required'),
  Vehicles: yup.array().of(
    yup.object().shape({
      vehicle_model_year: yup.string().required('vehicleYear is required'),
      vehicle_make: yup.string().required('vehicle_make is required'),
      vehicle_model: yup.string().required('vehicle_model is required'),
      vehicle_inop: yup.string().required('vehicleOperable is required')
    })
  ).required(),
  first_name: yup.string()
    .required('Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Name must only contain letters and spaces')
    .min(3, 'Name must be at least 3 characters')
    .max(20, ''),
  phone: yup.string()
    .required('Phone is required')
    .min(14, 'Phone number must be 10 characters'),
  email: yup.string()
    .required('Email is required')
    .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-z]{2,6}$/, 'Invalid e-mail format')
    .email('Email is not valid'),
  ship_date: yup.string()
    .required('Date is required')
    .test('is-valid-date', 'Date is required', value => value !== '' && !isNaN(Date.parse(value)))
})

const extractLeadNumber = (response: string) => {
  const match = response.match(/Lead\s*:\s*(\d+)/);
  if (match && match[1]) {
    return match[1];
  } else {
    throw new Error('No se pudo encontrar el número de lead en la respuesta.');
  }
};

const FormQuote = () => {
  const methods = useForm<FormQuoteTypes>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',          // ← revalida al escribir/seleccionar
    reValidateMode: 'onChange',
    defaultValues: {
      Vehicles: [
        { vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' },
      ],
      transport_type: '1'
    },
  });
  const { handleSubmit, control, trigger, setError, clearErrors, getValues, setValue, watch, formState: { errors }, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Vehicles',
  });

  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [disabledSubmit, setDisabledSubmit] = useState<boolean>(false);

  // Generate years dynamically
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = Array.from(new Array(30), (val, index) => {
      const year = currentYear - index;
      return { value: year.toString(), label: year.toString() };
    });
    setYears(yearsArray);
  }, []);



  const BASE = import.meta.env.PUBLIC_API_URL

  const [disabled, setDisabled] = useState(true)

  const allFields = watch('Vehicles');
  const [index, setIndex] = useState<number>(0);
  const modelField = watch(`Vehicles.${index}.vehicle_model`);

  useEffect(() => {
    setIndex(allFields.length - 1);
  }, [allFields]);

  useEffect(() => {
    if (modelField !== '') {
      const isFormComplete = allFields.every(
        (field) =>
          field.vehicle_model_year !== '' &&
          field.vehicle_make !== '' &&
          field.vehicle_inop !== ''
      );
      setDisabled(!isFormComplete);
    }
  }, [allFields, modelField]);

  const handleSubmitLead = async (data: any) => {
    try {
      setDisabled(true);
      const resp = await sendLeadToLanding(data); // -> { status: "success", id }

      if (resp?.status === "success" && resp.id) {
        // ✅ guarda el id como string
        saveNumberLead(String(resp.id));

        showNotification({ text: "success", icon: "success" });
        saveLead?.(data);
        saveEmail?.({ ...data, crm_lead_id: resp.id });

        setTimeout(() => {
          reset?.();
          window.location.href = "/quote2";
        }, 2000);
      } else {
        showNotification({ text: "Error", icon: "error" });
      }
    } catch (e) {
      console.error(e);
      showNotification({ text: "Error sending lead", icon: "error" });
    } finally {
      setDisabled(false);
      setDisabledSubmit?.(false);
    }
  };


  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return format(dateObj, 'MM/dd/yyyy');
  };

  const onSubmit = (data: FormQuoteTypes) => {
    setDisabledSubmit(true)
    const formattedDate = formatDate(data.ship_date);

    const dataToLead = {
      AuthKey: "f895aa95-10ea-41ae-984f-c123bf7e0ff0",
      ...data,
      ship_date: formattedDate,
    }
    handleSubmitLead(dataToLead)
  };

  return (
    <FormProvider {...methods}>
      <div className="h-max w-[60%] mt-4 xs:mt-0 sm:mt-0 md:w-[80%] sm:w-full xs:w-full  flex flex-col  items-center bg-white rounded">
        <form className='w-full h-full flex flex-col items-center' onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-full justify-between px-8  mt-4">
            <div className='max-h-[50px] max-w-[200px]'>
              <a href="/">
                <img src={logoCayad.src} />
              </a>
            </div>
            <p className=' font-bold text-[180x]'>Request a quote</p>
            <div className="AuthorizeNetSeal" >
              <script type="text/javascript">var ANS_customer_id = "40b07bd0-492e-41ef-af3d-203518035d55";</script>
              <script type="text/javascript"
                src="//verify.authorize.net:443/anetseal/seal.js"></script>
            </div>
          </div>
          <div className='w-[95%] p-4 mb-4 mt-4 rounded-sm min-h-[150px] max-h-[170px]  border-[1px]
          md:min-h-[250px] md:max-h-[300px] sm:min-h-[250px] sm:max-h-[300px] xs:min-h-[250px] xs:max-h-[300px]
          '>
            <div className='flex w-full'>
              <p className='font-bold'>1</p>
              <p className='ml-2'>
                Origin & Destination
              </p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-1 sm:grid-cols-1 xs:grid-cols-1 gap-4 p-2'>
              <div>
                <ZipcodeAutocompleteRHF
                  fieldNames={{ value: 'origin_city' }}
                  label='Transport Vehicle FROM'
                  placeholder='Miami, FL 33101'
                />
                {errors.origin_city && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.origin_city.message}</p>
                )}
              </div>

              <div>
                <ZipcodeAutocompleteRHF
                  fieldNames={{ value: 'destination_city' }}
                  label='Transport Vehicle TO'
                  placeholder='Alameda, CA 94501'
                />
                {errors.destination_city && (   // ← ojo, aquí era origin_city por error
                  <p className="text-red-500 text-xs italic mt-1">{errors.destination_city.message}</p>
                )}
              </div>

              <div className="flex w-full">
                <p className='xs:text-sm'>Select Transport Type</p>
                <div className='ml-2'>
                  <Controller
                    name={'transport_type'}
                    control={control}
                    render={({ field }) => (
                      <CheckboxInput {...field} value="1" label="Open" name='transport_type' checked={field.value === '1'} />
                    )}
                  />
                </div>
                <div className='ml-2'>
                  <Controller
                    name={'transport_type'}
                    control={control}
                    render={({ field }) => (
                      <CheckboxInput {...field} value="2" name='transport_type' label="Enclosed" checked={field.value === '0'} />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='w-[95%] p-4   rounded-sm min-h-[250px] flex-nowrap overflow-auto max-h-[375px] border-[1px]
          md:min-h-[380px] md:max-h-[400px] sm:min-h-[410px] sm:max-h-[450px] xs:min-h-[410px] xs:max-h-[450px]
          '>
            <div className='flex w-full'>
              <p className='font-bold'>2</p>
              <p className='ml-2'>
                Vehicle Details
              </p>
            </div>
            <div className='mt-8'>
              {fields.map((item, index) => (
                <div key={item.id} className=' mt-4  min-h-[130px] max-h-[300px]'>
                  <div className="grid grid-cols-3 sm:grid-cols-1 xs:grid-cols-1 gap-4">
                    <Controller
                      name={`Vehicles.${index}.vehicle_model_year`}
                      control={control}
                      render={({ field }) => (
                        <AutoSuggestInput {...field} label="Vehicle Year" options={years} />
                      )}
                    />

                    <MakeAsyncSelect
                      name={`Vehicles.${index}.vehicle_make`}
                      label="Vehicle Make"
                      endpoint={`${BASE}/api/vehicles/makes`}
                      onPickedMake={() => {
                        setValue(`Vehicles.${index}.vehicle_model`, '', { shouldDirty: true, shouldValidate: true });
                      }}
                    />

                    <ModelAsyncSelect
                      name={`Vehicles.${index}.vehicle_model`}
                      label="Vehicle Model"
                      endpoint={`${BASE}/api/vehicles/models`}
                      make={watch(`Vehicles.${index}.vehicle_make`)}
                      disabled={!watch(`Vehicles.${index}.vehicle_make`)}
                    />
                  </div>

                  <div className="flex w-full mb-8 ">
                    <p className='xs:text-sm ml-2'>Is it<b className=''>Running?</b></p>
                    <Controller
                      name={`Vehicles.${index}.vehicle_inop`}
                      control={control}
                      render={({ field }) => (
                        <CheckboxInput
                          {...field}
                          id={`vehicleIsOperable${index}`}
                          value="0"
                          label="Yes"
                          checked={field.value === '0'}
                          onChange={() => field.onChange('0')}
                        />
                      )}
                    />

                    <Controller
                      name={`Vehicles.${index}.vehicle_inop`}
                      control={control}
                      render={({ field }) => (
                        <CheckboxInput
                          {...field}
                          id={`vehicleIsNotOperable${index}`}
                          value="1"
                          label="No"
                          checked={field.value === '1'}
                          onChange={() => field.onChange('1')}
                        />
                      )}
                    />

                    {fields.length > 1 && (
                      <div className="flex w-[62%] justify-end mb-8 dashed">
                        <button type="button" onClick={() => remove(index)} className="bg-[#ff0000] text-white w-auto p-2">
                          Remove car
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
              <button
                className={`bg-white border  border-btn-blue text-btn-blue py-2 px-4  mb-2 ${disabled ? 'cursor-not-allowed bg-slate-200' : 'cursor-pointer'}`}
                type="button" disabled={disabled}
                onClick={() => append({ vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' })}
              >
                Add Another Vehicle
              </button>
            </div>
          </div>

          <div className='w-[95%] p-4 mb-8 mt-4 rounded-sm md:min-h-[300px] md:max-h-[450px] min-h-[150px] max-h-[220px] 
          xs:min-h-[300px] xs:max-h-[450px] sm:min-h-[300px] sm:max-h-[450px]
          border-[1px]'>
            <div className='flex w-full'>
              <p className='font-bold'>3</p>
              <p className='ml-2'>
                Shipment Details
              </p>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-1 xs:grid-cols-1 gap-4 p-2 mt-6'>
              <DateInput name='ship_date' label='Date' />

              <CustomInputOnlyText name='first_name' max={20} type='text' label='Name' />

              <CustomInput name='email' max={30} label='Email' />

              <CustomInputPhone name='phone' type='text' max={14} label='Phone' />
            </div>

          </div>

          <small className='mb-4 px-8'>By providing your phone number/email and clicking through, you agree to Cayad Auto Transport's
            <a href="/pdfs/Terms-and-Conditions.pdf" className="text-btn-blue underline"> Terms </a>
            and <a href="/privacy-policy/" className="text-btn-blue underline"> Privacy Policy </a> , and authorize us to make or initiate sales Calls, SMS, Emails, and prerecorded voicemails to that number using an automated system. Your agreement is not a condition of purchasing any products, goods, or services. You may opt out at any time by typing STOP. Message & data rates may apply.
          </small>

          <button disabled={disabledSubmit} className={`bg-btn-blue flex items-center justify-center mb-12 w-[95%] p-2 text-white rounded hover:bg-btn-hover transition-colors duration-300 ${disabledSubmit ? 'cursor-not-allowed bg-slate-200' : 'cursor-pointer'}`}>
            Submit
            <FaRegPaperPlane className='ml-2' />

          </button>

        </form>
      </div>
    </FormProvider>
  )
}

export default FormQuote;
