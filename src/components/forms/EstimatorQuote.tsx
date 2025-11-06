import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm, useWatch, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ZipcodeAutocompleteRHF from "../inputs/ZipcodeAutocompleteRHF";
import { distanceForLocations, estimateTransitDays, formatMiles } from "../../services/distance";
import { estimatePrice } from "../../utils/priceEstimator";
import { apiUrl } from "../../services/config";
import MakeAsyncSelect from "../MakeAsyncSelect";
import ModelAsyncSelect from "../ModelAsyncSelect";
import VehicleTypeAsyncSelect from "../VehicleTypeAsyncSelect";
import AutoSuggestInput from "../inputs/AutoSuggestInput";
import CustomInputOnlyText from "../inputs/CustomInputOnlyText";
import CustomInputPhone from "../inputs/CustomInputPhone";
import CustomInput from "../inputs/CustomInput";
import DateInput from "../inputs/CustomInputDate";
import { FaRegPaperPlane } from "react-icons/fa";
import { format } from "date-fns";
import { sendLeadToLanding } from "../../services/lead";
import { saveEmail, saveLead, saveNumberLead } from "../../services/localStorage";
import { showNotification } from "../../utils/notificaction";
import { isValidPhoneNumber } from "libphonenumber-js/max";

type TransportTypeVal = "1" | "2"; // 1 Open, 2 Enclosed

type Step1Values = {
  origin_city: string;
  destination_city: string;
  origin_city__isValid: boolean;
  destination_city__isValid: boolean;
};

const step1Schema: yup.ObjectSchema<Step1Values> = yup
  .object({
    origin_city: yup
      .string()
      .required("Please provide a valid city or zip code.")
      .test("origin-selected", "Please select a suggestion from the list.", function () {
        return this.parent?.origin_city__isValid === true;
      }),
    destination_city: yup
      .string()
      .required("Please provide a valid city or zip code.")
      .test(
        "destination-selected",
        "Please select a suggestion from the list.",
        function () {
          return this.parent?.destination_city__isValid === true;
        }
      ),
    origin_city__isValid: yup.boolean().default(false),
    destination_city__isValid: yup.boolean().default(false),
  })
  .required();

type Step2Values = {
  vehicle_type: string;
  vehicle_type_mode?: 'preset' | 'other';
};

const step2Schema = yup
  .object({
    vehicle_type: yup.string().required(),
    vehicle_type_mode: yup.mixed<'preset' | 'other'>().oneOf(['preset', 'other']).optional(),
  }) as yup.ObjectSchema<Step2Values>;

type VehicleRow = {
  vehicle_model_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_inop: string; // '0' or '1'
};

type ContactValues = {
  first_name: string;
  phone?: string; // optional, require at least one of phone/email via schema
  email?: string; // optional, require at least one of phone/email via schema
  ship_date: string;
  website?: string; // honeypot
};

type ExactQuoteValues = {
  Vehicles: VehicleRow[];
};

function VehicleRows() {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "Vehicles" });
  const [years] = useState(() => {
    const currentYear = new Date().getFullYear() + 1;
    return Array.from({ length: 50 }, (_, i) => {
      const y = String(currentYear - i);
      return { value: y, label: y };
    });
  });
  return (
    <div className="space-y-4">
      {fields.map((item, index) => {
        const make = useWatch({ control, name: `Vehicles.${index}.vehicle_make` });
        return (
          <div key={item.id} className="p-3 pt-4 border border-slate-200 rounded-lg space-y-4 relative bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Controller name={`Vehicles.${index}.vehicle_model_year`} control={control} render={({ field }) => (
                <AutoSuggestInput {...field} label="Year" options={years} />
              )} />
              <MakeAsyncSelect
                name={`Vehicles.${index}.vehicle_make`}
                label="Make"
                endpoint={apiUrl("/api/vehicles/makes")}
                onPickedMake={() =>
                  setValue(`Vehicles.${index}.vehicle_model`, "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <ModelAsyncSelect
                name={`Vehicles.${index}.vehicle_model`}
                label="Model"
                endpoint={apiUrl("/api/vehicles/models")}
                make={make}
                disabled={!make}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Is it running?</label>
              <p className="text-xs text-slate-500 mb-2">Non-running vehicles require winch or forklift assistance and typically cost more.</p>
              <div className="flex gap-3">
                <Controller name={`Vehicles.${index}.vehicle_inop`} control={control} render={({ field }) => (
                  <div>
                    <input {...field} type="radio" id={`running_yes_small_${index}`} value="0" checked={field.value === "0"} className="sr-only peer" />
                    <label htmlFor={`running_yes_small_${index}`} className="text-sm block text-center w-full px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">Yes</label>
                  </div>
                )}/>
                <Controller name={`Vehicles.${index}.vehicle_inop`} control={control} render={({ field }) => (
                  <div>
                    <input {...field} type="radio" id={`running_no_small_${index}`} value="1" checked={field.value === "1"} className="sr-only peer" />
                    <label htmlFor={`running_no_small_${index}`} className="text-sm block text-center w-full px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">No</label>
                  </div>
                )}/>
              </div>
            </div>
            {fields.length > 1 && (
              <div className="text-right">
                <button type="button" onClick={() => remove(index)} className="text-red-600 border border-red-400 hover:bg-red-600 hover:text-white rounded-md px-3 py-2 font-semibold transition-colors">Remove car</button>
              </div>
            )}
          </div>
        );
      })}
      {fields.length < 10 && (
        <button
          type="button"
          onClick={() => append({ vehicle_model_year: "", vehicle_make: "", vehicle_model: "", vehicle_inop: "0" })}
          className="w-full font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-sky-500 hover:text-sky-500 transition-colors text-sm"
        >
          + Add Another Vehicle
        </button>
      )}
    </div>
  );
}

// Helper component for vehicle type selection (preset + other)
const PresetOrOtherVehicleType: React.FC<{ step: ReturnType<typeof useForm<Step2Values>> }> = ({ step }) => {
  const presets: string[] = [
    "sedan",
    "coupe",
    "suv",
    "pickup",
    "van",
    "motorcycle",
    "convertible",
    "crossover",
    "hatchback",
    "minivan",
  ];
  const mode = step.watch('vehicle_type_mode');
  const current = step.watch('vehicle_type');
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {presets.map((opt) => (
          <Controller key={opt} name="vehicle_type" control={step.control} render={({ field }) => (
            <div>
              <input
                {...field}
                type="radio"
                id={`preset_${opt}`}
                value={opt}
                checked={field.value === opt && mode === 'preset'}
                className="sr-only peer"
                onChange={(e) => {
                  field.onChange(e.target.value);
                  step.setValue('vehicle_type_mode', 'preset', { shouldDirty: true, shouldValidate: true });
                }}
              />
              <label
                htmlFor={`preset_${opt}`}
                className="block text-center w-full py-2 px-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold text-[11px] capitalize tracking-tight transition-colors"
              >
                {opt}
              </label>
            </div>
          )} />
        ))}
        <Controller name="vehicle_type_mode" control={step.control} render={({ field }) => (
          <div>
            <input
              type="radio"
              id="preset_other"
              value="other"
              checked={field.value === 'other'}
              className="sr-only peer"
              onChange={() => field.onChange('other')}
            />
            <label
              htmlFor="preset_other"
              className="block text-center w-full py-2 px-2 rounded-lg border border-amber-400 cursor-pointer peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500 font-semibold text-[11px] uppercase transition-colors"
            >
              Other
            </label>
          </div>
        )} />
      </div>
      {mode === 'other' && (
        <div className="pt-1">
          <VehicleTypeAsyncSelect
            name="vehicle_type"
            label="Other Type"
            endpoint={apiUrl('/api/vehicles/types')}
          />
        </div>
      )}
      {mode === 'preset' && current && (
        <p className="text-xs text-slate-500">Selected: {current}</p>
      )}
    </div>
  );
};

export default function EstimatorQuote({ embedded = false }: { embedded?: boolean }) {
  // Steps simplified: 0 Locations -> 1 Vehicle Type -> 2 Estimate -> 3 Contact
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
  const [miles, setMiles] = useState<number | null>(null);
  const [transit, setTransit] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [perMile, setPerMile] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // Step 1: Locations
  const step1 = useForm<Step1Values>({
    resolver: yupResolver(step1Schema),
    mode: "onChange",
    defaultValues: {
      origin_city: "",
      destination_city: "",
      origin_city__isValid: false,
      destination_city__isValid: false,
    },
  });

  const step2 = useForm<Step2Values>({
    resolver: yupResolver(step2Schema),
    mode: "onChange",
    defaultValues: { vehicle_type: "sedan", vehicle_type_mode: 'preset' },
  });

  const contactSchema: yup.ObjectSchema<ContactValues> = yup
    .object({
      first_name: yup
        .string()
        .required("Name is required")
        .matches(/^[a-zA-Z\s]+$/, "Name must only contain letters and spaces")
        .min(3)
        .max(20),
      phone: yup
        .string()
        .optional()
        .test("valid-phone", "Enter a valid phone number", (val) => {
          if (!val) return true;
          try { return isValidPhoneNumber(String(val)); } catch { return false; }
        }),
      email: yup.string().optional().email("Email is not valid"),
      ship_date: yup.string().required("Date is required"),
      website: yup.string().max(0).optional(),
    })
    .test("phone-or-email", "Please provide at least a phone number or an email.", (val) => {
      if (!val) return false;
      const hasPhone = !!val.phone && String(val.phone).trim() !== "";
      const hasEmail = !!val.email && String(val.email).trim() !== "";
      return hasPhone || hasEmail;
    });
  const step4 = useForm<ContactValues>({ resolver: yupResolver(contactSchema), mode: "onChange" });

  const computeEstimate = useCallback(async () => {
    const s1 = step1.getValues();
    const s2 = step2.getValues();
    setBusy(true);
    try {
      const dist = await distanceForLocations(s1.origin_city, s1.destination_city);
      setMiles(dist.miles);
      setTransit(estimateTransitDays(dist.miles));
      const est = estimatePrice({ miles: dist.miles, vehicleType: s2.vehicle_type, transportType: "Open" });
      setEstimate(est.estimate);
      setPerMile(est.perMile);
    } finally {
      setBusy(false);
    }
  }, [step1, step2]);

  const onSubmitStep1 = async (data: Step1Values) => {
    void data; // validation already handled
    setActiveStep(1);
  };

  const onSubmitStep2 = async (data: Step2Values) => {
    void data;
    await computeEstimate();
    setActiveStep(2);
  };

  const goToContact = () => {
    setActiveStep(3);
  };

  // Track when Step 4 becomes visible for a simple min-time anti-spam gate
  const [step4ShownAt, setStep4ShownAt] = useState<number | null>(null);
  useEffect(() => {
    if (activeStep === 3) {
      setStep4ShownAt(Date.now());
    }
  }, [activeStep]);

  const submitLead = async () => {
    const s1 = step1.getValues();
    const s2 = step2.getValues();
  const s4: any = step4.getValues();
    // Honeypot and min-time checks
    if (s4?.website && String(s4.website).trim() !== "") {
      showNotification({ text: "Error sending lead", icon: "error" });
      return;
    }
    if (step4ShownAt && Date.now() - step4ShownAt < 3000) {
      showNotification({ text: "Please wait a moment before submitting.", icon: "error" });
      return;
    }
    const payload: any = {
      ...s1,
      transport_type: "1", // assume Open for quick quote
      ...s4,
      client_estimate: {
        miles,
        per_mile: perMile,
        total: estimate,
        transit,
        vehicle_type: (s2 as any).vehicle_type,
        vehicle_class: (s2 as any).vehicle_type,
        transport_type: "Open",
      },
    };
    try {
      const formatted = { ...payload, ship_date: format(new Date(s4.ship_date), "MM/dd/yyyy") };
      const resp = await sendLeadToLanding(formatted);
      if (resp?.status === "success" && typeof resp.id !== "undefined") {
        saveNumberLead(String(resp.id));
        showNotification({ text: "Success!", icon: "success" });
        saveLead?.(formatted as any);
        saveEmail?.({ ...(formatted as any), crm_lead_id: resp.id });
        setTimeout(() => {
          window.location.href = "/quote2";
        }, 1200);
      } else {
        showNotification({ text: "Error sending quote", icon: "error" });
      }
    } catch (e) {
      showNotification({ text: "Error sending lead", icon: "error" });
    }
  };

  const padding = embedded ? "p-4" : "p-6";
  const titleSize = embedded ? "text-xl" : "text-2xl";

  const content = (
    <div className="w-full">
      <>
      {/* Vehicle Type Selection */}
      <div className={`${padding} border-b border-slate-200`}>
        <h1 className={`${titleSize} font-bold text-slate-800`}>Get Your Estimated Price</h1>
      </div>

      {/* Step 1: Locations */}
      {activeStep === 0 && (
        <FormProvider {...step1}>
          <form className={`${padding} space-y-5 w-full max-w-none`} onSubmit={step1.handleSubmit(onSubmitStep1)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ZipcodeAutocompleteRHF fieldNames={{ value: "origin_city" }} label="Shipping FROM" placeholder="City or Zip Code" />
              <ZipcodeAutocompleteRHF fieldNames={{ value: "destination_city" }} label="Shipping TO" placeholder="City or Zip Code" />
            </div>
            <button className="w-full inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-2.5 hover:bg-sky-700 transition-colors" type="submit">
              Next: Vehicle Type
            </button>
          </form>
        </FormProvider>
      )}

      {/* Step 2: Vehicle Type (assumes Open & Runs) */}
      {activeStep === 1 && (
        <FormProvider {...step2}>
          <form className={`${padding} space-y-6 w-full max-w-none`} onSubmit={step2.handleSubmit(onSubmitStep2)}>
            <fieldset className="space-y-4">
              <legend className="text-md font-semibold text-slate-800">Vehicle Type</legend>
              <PresetOrOtherVehicleType step={step2} />
              <p className="text-xs text-slate-500">Vehicle dimensions and weight affect pricing. SUVs, vans, and pickups usually cost more.</p>
            </fieldset>
            <button className="w-full inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-2.5 hover:bg-sky-700 transition-colors" type="submit" disabled={busy}>
              {busy ? "Calculating..." : "See Estimated Price"}
            </button>
          </form>
        </FormProvider>
      )}

      {/* Step 3: Estimate & insights */}
      {activeStep === 2 && (
        <div className={`${padding} space-y-6 w-full max-w-none`}>
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-sm text-slate-600 mb-1">Estimated Price</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-800">{estimate != null ? `$${estimate}` : "--"}</p>
              <p className="text-xs text-slate-500">{perMile != null && miles != null ? `(~$${perMile}/mi · ${formatMiles(miles)})` : null}</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">Assuming Open and Runs & Drives</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2 text-amber-900">
            <p className="text-sm font-semibold">Important</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Vehicle size and measurements affect the total price of the transport.</li>
              <li>If the car doesn't run we have to use a winch or forklift to load/unload it, which increases the price of the quote.</li>
            </ul>
          </div>
          <div>
            <button onClick={goToContact} className="w-full inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-2.5 hover:bg-sky-700 transition-colors" type="button">Get my premium quote</button>
          </div>
          <div className="text-xs text-slate-500">
            {miles != null && (
              <p>Estimated transit time: {transit ?? "--"}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 4 (exact path): Vehicle details */}
      {/* Contact Step */}
      {activeStep === 3 && (
        <FormProvider {...step4}>
          <form className={`${padding} space-y-5 w-full max-w-none`} onSubmit={(e) => { e.preventDefault(); void step4.handleSubmit(submitLead)(); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInputOnlyText name="first_name" max={20} type="text" label="Full Name" />
              <CustomInputPhone name="phone" type="text" max={14} label="Phone Number" />
              <CustomInput name="email" max={30} label="Email Address" />
              <DateInput name="ship_date" label="Preferred Pickup Date" />
            </div>
            {/* Honeypot field to deter bots */}
            <input type="text" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" {...(step4.register as any)("website")} />
            <div className="flex items-start">
              <small className="text-xs text-slate-500">
                By providing your phone number/email and clicking through, you agree to Cayad Auto Transport's
                <a href="/pdfs/Terms-and-Conditions.pdf" className="text-btn-blue underline"> Terms </a>
                and <a href="/privacy-policy/" className="text-btn-blue underline"> Privacy Policy </a>, and authorize us to make or initiate sales Calls, SMS, Emails, and prerecorded voicemails. Message & data rates may apply.
              </small>
            </div>
            <button id="submit_button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 text-white font-bold py-3 px-6 hover:bg-sky-700 transition-all duration-300 text-base"
              type="submit"
            >
              Get my premium quote
              <FaRegPaperPlane />
            </button>
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setActiveStep(2)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</button>
            </div>
          </form>
        </FormProvider>
      )}
      </>
    </div>
  );

  if (embedded) return content;

  return <div className="bg-white rounded-xl shadow-lg border border-slate-200">{content}</div>;
}
