import * as yup from 'yup'
import { useCallback, useEffect, useState } from "react";
import CustomInput from "../inputs/CustomInput";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AutocompleteInput from '../inputs/AutoCompletInput';
import CheckboxInput from '../inputs/CustomCheckbox';
import axios from 'axios'
import SelectInput from '../inputs/CustomSelect';
import DateInput from '../inputs/CustomInputDate';
import { getEmail, getLead, getSendedEmail, getSendedLead, saveEmail, saveLead, sendedEmail, sendedLead } from '../../services/localStorage';
import { sendEmail, sendLead } from '../../services/landing';
import { FaRegPaperPlane } from "react-icons/fa";
import CustomInputOnlyText from '../inputs/CustomInputOnlyText';
import AutoSuggestInput from '../inputs/AutoSuggestInput';
import CustomInputPhone from '../inputs/CustomInputPhone';


interface FormValues {
  origin_city: string;
  destination_city: string;
  transport_type: string;
}

const validationSchemaStep1 = yup.object().shape({
  origin_city: yup.string()
    .required('Please provide a valid city or zip code.'),
  destination_city: yup.string()
    .required('Please provide a valid city or zip code.'),
  transport_type: yup.string()
    .required('Transport type is required')
});

const Step1 = ({ setActiveStep, setDataSubmit }: any) => {
  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchemaStep1),
    defaultValues: {
      origin_city: '',
      destination_city: '',
      transport_type: '1'
    },
  });

  const { handleSubmit, trigger, setError, clearErrors, formState: { errors } } = methods;

  const onSubmit = async (data: FormValues) => {
    const isValid = await trigger();
    if (!isValid) {
      return;
    }

    setDataSubmit(data);
    setActiveStep(1);
  };

  return (
    <FormProvider {...methods}>
      <section id="paso1" className="w-full mt-4 flex flex-col items-center">
        <form onSubmit={handleSubmit(onSubmit)} className='w-[90%]'>
          <div className="flex flex-col mb-1 w-full relative bg-white p-4 border border-gray-200">
            <AutocompleteInput
              name='origin_city'
              label='Transport Vehicle FROM'
              placeholder="Miami, Florida, EE. UU."
              trigger={trigger}
              clearErrors={clearErrors}
              setError={setError}
            />
            <div id="validationOrigin" className="invalid-feedback">
              {errors.origin_city && <p className="text-red-500 text-xs italic mt-1">{errors.origin_city.message}</p>}
            </div>
          </div>
          <div className="flex flex-col mb-1 w-full relative bg-white p-4 border border-gray-200">
            <AutocompleteInput
              name='destination_city'
              label='Transport Vehicle TO'
              placeholder="Alameda, California, EE. UU."
              trigger={trigger}
              clearErrors={clearErrors}
              setError={setError}
            />
            <div id="validationDestination" className="invalid-feedback">
              {errors.destination_city && <p className="text-red-500 text-xs italic mt-1">{errors.destination_city.message}</p>}
            </div>
          </div>
          <div className="flex gap-4 py-2">
            <p className='text-sm'>
              Select <b>Transport Type</b>
            </p>
            <Controller
              name="transport_type"
              control={methods.control}
              render={({ field }) => (
                <>
                  <CheckboxInput {...field} name="transport_type" label="Open" value="1" />
                  <CheckboxInput {...field} name="transport_type" label="Enclosed" value="2" />
                </>
              )}
            />
            {errors.transport_type && <p className="text-red-500 text-xs italic mt-1">{errors.transport_type.message}</p>}
          </div>
          <button
            type="submit"
            className="bg-btn-blue flex items-center hover:bg-btn-hover transition-colors duration-500 ease-in-out focus:outline-none justify-center cursor-pointer mb-4 w-full h-10 mt-5 text-white"
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


// Definición de la interfaz de los datos del formulario
interface VehicleForm {
  vehicle_model_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicleOperable: string;
}

interface FormStep2 {
  Vehicles: VehicleForm[];
}

const validationSchema = yup.object().shape({
  Vehicles: yup.array().of(
    yup.object().shape({
      vehicle_model_year: yup.string().required('vehicleYear is required'),
      vehicle_make: yup.string().required('vehicle_make is required'),
      vehicle_model: yup.string().required('vehicle_model is required'),
      vehicleOperable: yup.string().required('vehicleOperable is required')
    })
  ).required()
});

const Step2 = ({ setActiveStep, setDataSubmit }: any) => {
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      Vehicles: [
        { vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicleOperable: '1' },
      ],
    },
  });

  const { handleSubmit, control, getValues, setValue, watch } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Vehicles',
  });

  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [vehicleMarks, setVehicleMarks] = useState<{ [key: number]: { value: string; label: string }[] }>({});
  const [vehicleModels, setVehicleModels] = useState<{ [key: number]: { value: string; label: string }[] }>({});

  // Generate years dynamically
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = Array.from(new Array(30), (val, index) => {
      const year = currentYear - index;
      return { value: year.toString(), label: year.toString() };
    });
    setYears(yearsArray);
  }, []);

  // Update vehicle marks when year is selected
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.endsWith('vehicle_model_year')) {
        const index = parseInt(name.split('.')[1], 10);
        const marksData = [
          { label: "Ford", value: "ford" },
          { label: "Chevrolet", value: "chevrolet" },
          { label: "Dodge", value: "dodge" },
          { label: "Jeep", value: "jeep" },
          { label: "Tesla", value: "tesla" },
          { label: "Cadillac", value: "cadillac" },
          { label: "Buick", value: "buick" },
          { label: "GMC", value: "gmc" },
          { label: "Chrysler", value: "chrysler" },
          { label: "Lincoln", value: "lincoln" },
          { label: "Ram", value: "ram" },
          { label: "BMW", value: "bmw" },
          { label: "Mercedes-Benz", value: "mercedes-benz" },
          { label: "Audi", value: "audi" },
          { label: "Volkswagen", value: "volkswagen" },
          { label: "Porsche", value: "porsche" },
          { label: "Volvo", value: "volvo" },
          { label: "Land Rover", value: "land rover" },
          { label: "Jaguar", value: "jaguar" },
          { label: "Mini", value: "mini" },
          { label: "Alfa Romeo", value: "alfa romeo" },
          { label: "Ferrari", value: "ferrari" },
          { label: "Lamborghini", value: "lamborghini" },
          { label: "Bentley", value: "bentley" },
          { label: "Rolls-Royce", value: "rolls-royce" },
          { label: "Toyota", value: "toyota" },
          { label: "Honda", value: "honda" },
          { label: "Nissan", value: "nissan" },
          { label: "Subaru", value: "subaru" },
          { label: "Mazda", value: "mazda" },
          { label: "Mitsubishi", value: "mitsubishi" },
          { label: "Lexus", value: "lexus" },
          { label: "Infiniti", value: "infiniti" },
          { label: "Acura", value: "acura" },
          { label: "Hyundai", value: "hyundai" },
          { label: "Kia", value: "kia" },
          { label: "Genesis", value: "genesis" },
        ];
        setVehicleMarks(prev => ({ ...prev, [index]: marksData }));
        setVehicleModels(prev => ({ ...prev, [index]: [] }));

        const updatedVehicles = getValues('Vehicles').map((item, idx) => (
          idx === index ? { ...item, vehicle_make: '', vehicle_model: '' } : item
        ));
        setValue('Vehicles', updatedVehicles);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues]);

  // Update vehicle models when make is selected
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.endsWith('vehicle_make')) {
        const index = parseInt(name.split('.')[1], 10);
        const vehicleYear = getValues(`Vehicles.${index}.vehicle_model_year`);
        const vehicleMake = getValues(`Vehicles.${index}.vehicle_make`);

        if (vehicleYear && vehicleMake) {
          axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${vehicleMake}/modelyear/${vehicleYear}?format=json`)
            .then((response) => {
              const modelsData = response.data.Results.map((model: any) => ({
                value: model.Model_Name,
                label: model.Model_Name,
              }));

              setVehicleModels(prev => ({ ...prev, [index]: modelsData }));

              setValue(`Vehicles.${index}.vehicle_model`, '');
            });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, getValues, setValue]);

  const handleStepBack = () => {
    setActiveStep(0);
  }

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
          field.vehicleOperable !== ''
      );
      setDisabled(!isFormComplete);
    }
  }, [allFields, modelField]);

  const onSubmit = (data: any) => {
    console.log(data);
    setDataSubmit(data);
    setActiveStep(2);
  };

  return (
    <FormProvider {...methods}>
      <section id="paso2" className="form--quote--content mt-2 min-w-[90%] block">
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 my-4">
              <div className="form--group form--group--section mb-4 mt-4">
                <Controller
                  name={`Vehicles.${index}.vehicle_model_year`}
                  control={control}
                  render={({ field }) => (
                    <AutoSuggestInput {...field} label="Vehicle Year" options={years} />
                  )}
                />
              </div>

              <div className="form--group form--group--section">
                <Controller
                  name={`Vehicles.${index}.vehicle_make`}
                  control={control}
                  render={({ field }) => (
                    <AutoSuggestInput {...field} label="Vehicle Make" options={vehicleMarks[index] || []} disabled={!watch(`Vehicles.${index}.vehicle_model_year`)} />
                  )}
                />
              </div>

              <div className="form--group mt-4 form--group--section">
                <Controller
                  name={`Vehicles.${index}.vehicle_model`}
                  control={control}
                  render={({ field }) => (
                    <AutoSuggestInput {...field} options={vehicleModels[index] || []} label="Vehicle Model" disabled={!watch(`Vehicles.${index}.vehicle_make`)} />
                  )}
                />
              </div>

              <div className="flex w-full justify-around">
                <p className='xs:text-sm'>Is The <b className=''>Vehicle Operable?</b></p>
                <div>
                  <Controller
                    name={`Vehicles.${index}.vehicleOperable`}
                    control={control}
                    render={({ field }) => (
                      <CheckboxInput {...field} id={`vehicleIsOperable${index}`} value="1" label="Yes" checked={field.value === '1'} />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name={`Vehicles.${index}.vehicleOperable`}
                    control={control}
                    render={({ field }) => (
                      <CheckboxInput {...field} id={`vehicleIsNotOperable${index}`} value="0" label="No" checked={field.value === '0'} />
                    )}
                  />
                </div>
              </div>

              {fields.length > 1 && (
                <div className="d-flex end dashed">
                  <button type="button" onClick={() => remove(index)} className="bg-[#ff0000] text-white w-auto p-2">
                    Remove car
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            className={`bg-white border border-btn-blue text-btn-blue py-2 px-4 mt-4 ${disabled ? 'cursor-not-allowed bg-slate-200' : 'cursor-pointer'}`}
            type="button" disabled={disabled}
            onClick={() => append({ vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicleOperable: '1' })}
          >
            Add Another Vehicle
          </button>
          <button
            className="bg-btn-blue flex justify-center items-center hover:bg-btn-hover transition-colors duration-500 ease-in-out focus:outline-none cursor-pointer w-full h-10 mt-5 text-white"
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

interface FormStep3 {
  first_name: string
  phone: string
  email: string
  ship_date: Date
}

function separarCiudadYEstado (locationString: string) {
  const [city, state] = locationString.split(',').map(part => part.trim());

  return {
    city: city || "",
    state: state || ""
  };
}

const Step3 = ({ dataSubmit, handleSubmitLeadAndEmail, setActiveStep, setDataSubmit }: any) => {
  const validationSchema = yup.object().shape({
    first_name: yup.string()
      .required('Name is required')
      .matches(/^[a-zA-Z\s]+$/, 'Name must only contain letters and spaces')
      .min(3, 'Name must be at least 3 characters')
      .max(20, ''),
    phone: yup.string()
      .required('Phone is required')
      .min(14, 'Phone must be at least 10 characters'),
    email: yup.string()
      .required('Email is required')
      .email('Email is not valid'),
    ship_date: yup.string()
      .required('Date is required')
      .test('is-valid-date', 'Date is required', value => value !== '' && !isNaN(Date.parse(value)))
  });

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange' // Para que las validaciones se actualicen en tiempo real
  });

  const { handleSubmit, formState: { isValid } } = methods;

  useEffect(() => {
    if (isValid) {
      // Aquí puedes realizar alguna acción cuando todos los campos sean válidos
      console.log(isValid)
    }
  }, [isValid]);

  const originCityAndState = dataSubmit?.origin_city;
  const location = separarCiudadYEstado(originCityAndState);

  const onSubmit = (data: any) => {
    const dataToSend = {
      ...dataSubmit,
      ...data,
      destination_country: 'US',
      destination_state: 'OK',
      origin_state: location.state,
      origin_country: 'US',
    };
    console.log(data);
  };

  const handleStepBack = (data: any) => {
    setActiveStep(data);
  };

  return (
    <FormProvider {...methods}>
      <section id="paso3" className={`form--quote--content mt-4 block max-w-[90%]`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInputOnlyText name='first_name' max={20} type='text' label='Name' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInputPhone name='phone' type='text' max={14} label='Phone Number' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInput name='email' max={30} label='Email Address' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <DateInput name='ship_date' label='Date' />
          </div>
          <div className="flex text-xs gap-4 py-2 border-b border-dashed">
            <small id="termsAndConditions">
              By providing your phone number/email and clicking through,
              you agree to our Terms, Privacy Policy, and authorize us to make or initiate sales calls, text msgs, and
              prerecorded voicemails to that number using an automated system. Your agreement is not a
              condition of purchasing products, goods or services. You may opt out at any time.
            </small>
          </div>
          <button
            id="submit_button"
            className="bg-btn-blue hover:bg-btn-hover transition-colors duration-500 ease-in-out focus:outline-none flex items-center justify-center cursor-pointer w-full h-10 mt-5 text-white"
            type="submit"
          >
            <p className='mr-2'>
              Submit
            </p>
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

const FormLanding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [dataSubmit, setDataSubmit] = useState<any>({})
  const lead = getLead()
  const emailCayad = getEmail()
  const isSendedEmail = getSendedEmail()
  const isSendedLead = getSendedLead()
  const updateFormData = (newData: any) => {
    setDataSubmit((prevData: any) => ({
      ...prevData,
      ...newData,
    }));
  };

  const saveDataInLocalStorage = () => {
    saveEmail(dataSubmit)
    saveLead(dataSubmit)
    sendedEmail(false)
    sendedLead(false)
  }

  const handleSubmitLeadAndEmail = async () => {
    console.log('a punto de detonar')
    console.log(emailCayad, isSendedEmail)
    if (lead && emailCayad && !isSendedEmail && !isSendedLead) {
      console.log('detonar')
      const responseEmail = await sendEmail(emailCayad)
      const responseLead = await sendLead(lead)

      console.log(responseEmail, responseLead)
    }
  }

  useEffect(() => {
    if (dataSubmit?.Vehicles && Array.isArray(dataSubmit?.Vehicles)) {
      setTimeout(saveDataInLocalStorage, 1000)
    }
  }, [dataSubmit])

  console.log(dataSubmit)
  const renderContent = useCallback(() => {
    switch (activeStep) {
      case 1:
        return <Step2 setActiveStep={setActiveStep} setDataSubmit={updateFormData} />;
      case 2:
        return <Step3 dataSubmit={dataSubmit} setActiveStep={setActiveStep} handleSubmitLeadAndEmail={handleSubmitLeadAndEmail} setDataSubmit={updateFormData} />;

      default:
        return <Step1 setActiveStep={setActiveStep} setDataSubmit={setDataSubmit} />
    }
  }, [activeStep]);
  return (
    <div className="max-w-[500px] mb-8 min-w-[450px] mx-auto min-h-96 max-h-[450px] flex-nowrap  xs:min-w-[95%] sm:min-w-[90%] md:min-w-[60%]	overflow-auto	 bg-white flex justify-between items-center flex-col">
      {renderContent()}
    </div>
  );
};

export default FormLanding;
