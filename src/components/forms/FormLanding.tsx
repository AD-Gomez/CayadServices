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

interface FormValues {
  origin_city: string;
  destination_city: string;
  transport_type: string
}

const Step1 = ({ setActiveStep, setDataSubmit }: any) => {
  const validationSchema = yup.object().shape({
    origin_city: yup.string()
      .required('Please provide a valid city or zip code.'),
    destination_city: yup.string()
      .required('Please provide a valid city or zip code.'),
    transport_type: yup.string()
      .required('transportType is required')
  })
  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      origin_city: '',
      destination_city: '',
      transport_type: '1'
    },
  });
  const { handleSubmit, setError, clearErrors } = methods;

  const onSubmit = (data: FormValues) => {
    setDataSubmit(data)
    setActiveStep(1)
  };

  return (
    <FormProvider {...methods}>
      <section id="paso1" className="w-full mt-4 flex flex-col items-center">
        <form onSubmit={handleSubmit(onSubmit)} className='w-[90%]'>
          <div className="flex flex-col mb-1 w-full relative bg-white p-4 border border-gray-200">

            <AutocompleteInput placeholder="Miami, Florida, EE. UU."
              name='origin_city' label='Transport Vehicle FROM'
            />
            <div id="validationOrigin" className="invalid-feedback">
            </div>
          </div>
          <div className="flex flex-col mb-1 w-full relative bg-white p-4 border border-gray-200">
            <AutocompleteInput
              placeholder="Alameda, California, EE. UU." name='destination_city' label=' Transport Vehicle TO '
            />
          </div>
          <div className="flex gap-4 py-2">
            <p className='text-sm'>
              Select <b>Transport Type</b>
            </p>
            <CheckboxInput name='transport_type' label='Open' value='1' />
            <CheckboxInput name='transport_type' label='Enclosed' value='2' />
          </div>
          <button
            type="submit"
            className="bg-btn-blue flex items-center hover:bg-btn-hover transition-colors duration-500 ease-in-out focus:outline-none justify-center cursor-pointer mb-4 w-full h-10 mt-5 text-white"
          >
            Add Vehicle Details
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
            </svg>
          </button>
        </form>
      </section>
    </FormProvider >
  )
}

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
  const methods = useForm<FormStep2>({
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
  console.log(vehicleMarks)
  // Genera los años dinámicamente
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = Array.from(new Array(30), (val, index) => {
      const year = currentYear - index;
      return { value: year.toString(), label: year.toString() };
    });
    setYears(yearsArray);
  }, []);

  // Actualiza las marcas cuando se selecciona un año
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.endsWith('vehicle_model_year')) {
        const index = parseInt(name.split('.')[1], 10);
        const marksData = [
          {
            label: "Ford",
            value: "ford"
          },
          {
            label: "Chevrolet",
            value: "chevrolet"
          },
          {
            label: "Dodge",
            value: "dodge"
          },
          {
            label: "Jeep",
            value: "jeep"
          },
          {
            label: "Tesla",
            value: "tesla"
          },
          {
            label: "Cadillac",
            value: "cadillac"
          },
          {
            label: "Buick",
            value: "buick"
          },
          {
            label: "GMC",
            value: "gmc"
          },
          {
            label: "Chrysler",
            value: "chrysler"
          },
          {
            label: "Lincoln",
            value: "lincoln"
          },
          {
            label: "Ram",
            value: "ram"
          },
          {
            label: "BMW",
            value: "bmw"
          },
          {
            label: "Mercedes-Benz",
            value: "mercedes-benz"
          },
          {
            label: "Audi",
            value: "audi"
          },
          {
            label: "Volkswagen",
            value: "volkswagen"
          },
          {
            label: "Porsche",
            value: "porsche"
          },
          {
            label: "Volvo",
            value: "volvo"
          },
          {
            label: "Land Rover",
            value: "land rover"
          },
          {
            label: "Jaguar",
            value: "jaguar"
          },
          {
            label: "Mini",
            value: "mini"
          },
          {
            label: "Alfa Romeo",
            value: "alfa romeo"
          },
          {
            label: "Ferrari",
            value: "ferrari"
          },
          {
            label: "Lamborghini",
            value: "lamborghini"
          },
          {
            label: "Bentley",
            value: "bentley"
          },
          {
            label: "Rolls-Royce",
            value: "rolls-royce"
          },
          {
            label: "Toyota",
            value: "toyota"
          },
          {
            label: "Honda",
            value: "honda"
          },
          {
            label: "Nissan",
            value: "nissan"
          },
          {
            label: "Subaru",
            value: "subaru"
          },
          {
            label: "Mazda",
            value: "mazda"
          },
          {
            label: "Mitsubishi",
            value: "mitsubishi"
          },
          {
            label: "Lexus",
            value: "lexus"
          },
          {
            label: "Infiniti",
            value: "infiniti"
          },
          {
            label: "Acura",
            value: "acura"
          },
          {
            label: "Hyundai",
            value: "hyundai"
          },
          {
            label: "Kia",
            value: "kia"
          },
          {
            label: "Genesis",
            value: "genesis"
          }
        ]
        setVehicleMarks(prev => ({ ...prev, [index]: marksData }));
        setVehicleModels(prev => ({ ...prev, [index]: [] }));
        const updatedVehicles = getValues('Vehicles').map((item: VehicleForm, idx: number) => (
          idx === index ? { ...item, vehicleMark: '', vehicleModel: '' } : item
        ));
        setValue('Vehicles', updatedVehicles);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues]);

  // Actualiza los modelos cuando se selecciona una marca
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.endsWith('vehicle_make')) {
        const index = parseInt(name.split('.')[1], 10);
        const vehicleYear = getValues(`Vehicles.${index}.vehicle_model_year`);
        if (vehicleYear && value.Vehicles !== undefined) {
          axios
            .get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${value?.Vehicles[index]?.vehicle_make}/modelyear/${vehicleYear}?format=json`)
            .then((response) => {
              const modelsData = response.data.Results.map((model: any) => ({
                value: model.ModelId,
                label: model.Model_Name,
              }));
              setVehicleModels(prev => ({ ...prev, [index]: modelsData }));
              const updatedVehicles = getValues('Vehicles').map((item: VehicleForm, idx: number) => (
                idx === index ? { ...item, vehicleModel: '' } : item
              ));
              setValue('Vehicles', updatedVehicles);
            });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues]);

  const handleStepBack = () => {
    setActiveStep(0)
  }

  // Maneja la sumisión del formulario
  const onSubmit = (data: FormStep2) => {
    setDataSubmit(data);
    console.log(data)
    setActiveStep(2);
  };

  return (
    <FormProvider {...methods}>
      <section id="paso2" className="form--quote--content mt-2 min-w-[90%]  block">
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 my-4">
              <div className="form--group form--group--section mb-4 mt-4">
                <Controller
                  name={`Vehicles.${index}.vehicle_model_year`}
                  control={control}
                  render={({ field }) => (
                    <SelectInput {...field} label="Vehicle Year" options={years} />
                  )}
                />
                <ul id={`vehicleYearList${index}`} className="form--list--content"></ul>
              </div>

              <div className="form--group form--group--section">
                <Controller
                  name={`Vehicles.${index}.vehicle_make`}
                  control={control}
                  render={({ field }) => (
                    <SelectInput {...field} label="Vehicle Make" options={vehicleMarks[index] || []} disabled={!watch(`Vehicles.${index}.vehicle_model_year`)} />
                  )}
                />
                <ul id={`vehicleMarkList${index}`} className="form--list--content"></ul>
              </div>

              <div className="form--group mt-4 form--group--section">
                <Controller
                  name={`Vehicles.${index}.vehicle_model`}
                  control={control}
                  render={({ field }) => (
                    <SelectInput {...field} options={vehicleModels[index] || []} label="Vehicle Model" disabled={!watch(`Vehicles.${index}.vehicle_make`)} />
                  )}
                />
                <ul id={`vehicleModelList${index}`} className="form--list--content"></ul>
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

              <div className="d-flex end dashed">
                <button type="button" onClick={() => remove(index)} className="bg-[#ff0000] text-white w-auto p-2 ">
                  Remove car
                </button>
              </div>
            </div>
          ))}
          <button
            className="bg-white border  border-btn-blue text-btn-blue py-2 px-4 mt-4"
            type="button"
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
              <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
            </svg>
          </button>
        </form>
        <footer className="flex justify-around text-center py-4">
          <div className="flex flex-col items-center">
            <button type="button" onClick={handleStepBack} className="bg-btn-blue flex justify-center items-center text-white w-8 h-8 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>            </button>
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
  const phoneRegExp = /^(\+1|1)?(\s|-|\.)?(\()?(\d{3})(\))?(\s|-|\.)?(\d{3})(\s|-|\.)?(\d{4})$/;

  const validationSchema = yup.object().shape({
    first_name: yup.string()
      .required('Name is required'),
    phone: yup.string()
      .required('Phone is required'),
    email: yup.string()
      .required('Email is required'),
    ship_date: yup.date()
      .required('Date is required')
  })

  const methods = useForm<FormStep3>({
    resolver: yupResolver(validationSchema)
  });

  const { handleSubmit, setError, clearErrors } = methods;

  const originCityAndState = dataSubmit?.origin_city
  const location = separarCiudadYEstado(originCityAndState)
  const onSubmit = (data: FormStep3) => {
    const dataToSend = {
      ...dataSubmit,
      ...data,
      destination_country: 'US',
      destination_state: 'OK',
      origin_state: location.state,
      origin_country: 'US',
    }
    setTimeout(() => {
      handleSubmitLeadAndEmail()
    }, 3000)
    setDataSubmit(dataToSend)
  };

  const handleStepBack = (data: number) => {
    setActiveStep(data)
  }

  return (
    <FormProvider {...methods}>
      <section id="paso3" className={`form--quote--content mt-4 block max-w-[350px] `}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInput name='first_name' label='Name' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInput name='phone' label='Phone Number' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <CustomInput name='email' label='Email Address' />
          </div>
          <div className="flex flex-col mb-1 relative bg-white p-4 border border-gray-200">
            <DateInput name='ship_date' label='Date' />
          </div>
          <div className="flex gap-4 py-2 border-b border-dashed">
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
  )
}

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
    <div className="max-w-[500px] min-w-[450px] mx-auto min-h-96 max-h-[450px] flex-nowrap  xs:min-w-[95%] sm:min-w-[90%] md:min-w-[60%]	overflow-auto	 bg-white flex justify-between items-center flex-col">
      {renderContent()}
    </div>
  );
};

export default FormLanding;
