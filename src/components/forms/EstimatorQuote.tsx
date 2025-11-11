import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ZipcodeAutocompleteRHF from "../inputs/ZipcodeAutocompleteRHF";
import { distanceForLocations, estimateTransitDays, formatMiles } from "../../services/distance";
import { parseCityStateZip } from "../../utils/leadFormat";
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
  .required()
  .test('different-origin-destination', 'Origin and destination cannot be the same', function (val) {
    if (!val) return true;
    const o = String((val as any).origin_city || '').trim().toLowerCase();
    const d = String((val as any).destination_city || '').trim().toLowerCase();
    if (!o || !d) return true;
    if (o === d) {
      return this.createError({ path: 'destination_city', message: 'Origin and destination cannot be the same' });
    }
    return true;
  });

type Step2Values = {
  vehicle_type: string;
  vehicle_year?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_inop?: '0' | '1';
};

const step2Schema = yup
  .object({
    vehicle_type: yup.string().required(),
    vehicle_year: yup.string().optional().matches(/^(19|20)\d{2}$/,'Year must be YYYY').test('year-range','Year out of range', function (val){
      if (!val) return true; const y = Number(val); const max = new Date().getFullYear()+1; const min = 1970; return y >= min && y <= max;
    }),
    vehicle_make: yup.string().optional().max(40),
    vehicle_model: yup.string().optional().max(60),
    vehicle_inop: yup.mixed<'0'|'1'>().oneOf(['0','1']).optional(),
  }) as yup.ObjectSchema<Step2Values>;

type ContactValues = {
  first_name: string;
  phone?: string; // optional, require at least one of phone/email via schema
  email?: string; // optional, require at least one of phone/email via schema
  ship_date: string;
  website?: string; // honeypot
};

type VehicleRow = {
  vehicle_type: string;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_inop: '0' | '1';
};

export default function EstimatorQuote({ embedded = false }: { embedded?: boolean }) {
  // Steps simplified: 0 Locations -> 1 Vehicle Type -> 2 Estimate -> 3 Contact
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
  const [miles, setMiles] = useState<number | null>(null);
  const [transit, setTransit] = useState<string | null>(null);
  // We only show the miles actually used for pricing; no extra provenance shown to end-users.
  // Totals from estimator API
  const [estimate, setEstimate] = useState<number | null>(null); // kept for backwards compatibility (discounted total)
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);
  const [normalTotal, setNormalTotal] = useState<number | null>(null);
  const [perMile, setPerMile] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]); // cart of full vehicle rows
  const [estResponses, setEstResponses] = useState<any[]>([]); // raw backend responses per distinct type
  const [confidencePct, setConfidencePct] = useState<number | null>(null);
  
  // Aggregate meta derived from backend responses
  const { overallConfidence, sampleSizeTotal } = useMemo(() => {
    const avail = estResponses.filter((r) => r?.data?.estimate_available);
    const rank: Record<string, number> = { low: 0, medium: 1, high: 2 };
    let worst: string | null = null;
    for (const r of avail) {
      const c = String(r?.data?.confidence || '').toLowerCase();
      if (!c || typeof rank[c] === 'undefined') continue;
      if (worst == null || rank[c] < rank[worst]) worst = c;
    }
    const samples = avail.reduce((acc, r) => acc + (Number(r?.data?.sample_size) || 0), 0);
    return { overallConfidence: worst, sampleSizeTotal: samples };
  }, [estResponses]);

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
    defaultValues: { vehicle_type: "car", vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' },
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
    // Aggregate by vehicle_type from cart
    const distinct = Array.from(new Set(vehicles.map(v => v.vehicle_type)));
    setBusy(true);
    try {
      // Try to extract zip codes from the user-provided city/zip strings
      const o = parseCityStateZip(s1.origin_city || "");
      const d = parseCityStateZip(s1.destination_city || "");
      const origin_zip = o.postalCode || ((s1.origin_city || "").match(/(\d{5})/) || [""])[0];
      const destination_zip = d.postalCode || ((s1.destination_city || "").match(/(\d{5})/) || [""])[0];
      // Prefer canonical endpoint; alias kept for compatibility
      const canonical = apiUrl("/api/public/price-estimate/");
      const alias = apiUrl("/leads/public/price-estimate/");
      const results: any[] = [];
      for (const vt of distinct) {
        const count = vehicles.filter(v => v.vehicle_type === vt).length;
        try {
          let res = await fetch(canonical, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin_zip, destination_zip, vehicle_type: vt, transport_type: 'open', inop: false, vehicles_count: count })
          });
          if (!res.ok) {
            // Try alias as fallback
            res = await fetch(alias, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ origin_zip, destination_zip, vehicle_type: vt, transport_type: 'open', inop: false, vehicles_count: count })
            });
          }
          if (res.ok) {
            const j = await res.json();
            results.push({ type: vt, count, data: j });
          }
        } catch {}
      }
      setEstResponses(results);
      // Aggregate (only consider available estimates with numeric totals)
      const avail = results.filter(r => r?.data?.estimate_available);
      // Sum discounted totals (preferred) and normal totals
      const discountedSum = avail.reduce((acc, r) => acc + (Number(r.data?.discounted_estimate_total ?? r.data?.low_estimate_total) || 0), 0);
      // Prefer provided normal_estimate_total, else derive as discounted * 1.15
      const normalSum = avail.reduce((acc, r) => {
        const d = Number(r.data?.discounted_estimate_total ?? r.data?.low_estimate_total);
        const n = Number(r.data?.normal_estimate_total);
        return acc + (Number.isFinite(n) ? n : (Number.isFinite(d) ? Math.round(d * 1.15 * 100) / 100 : 0));
      }, 0);
      let usedMiles: number | null = null;
      // Prefer the backend-declared distance actually used for pricing when available
      const pricingMiles = avail.find(r => typeof r?.data?.distance_used_for_pricing_miles === 'number')?.data?.distance_used_for_pricing_miles;
      const refFromResp = avail.find(r => typeof r?.data?.reference_distance_miles === 'number')?.data?.reference_distance_miles;
      if (typeof pricingMiles === 'number') {
        usedMiles = pricingMiles;
      } else if (typeof refFromResp === 'number') {
        usedMiles = refFromResp;
      } else {
        // fallback to distance service
        const dist = await distanceForLocations(s1.origin_city, s1.destination_city);
        usedMiles = dist.miles ?? null;
      }
      setMiles(usedMiles);
      // Do not show additional provenance to end users; we only display the distance used for pricing.
      // Prefer backend-provided transit estimate when available (integer days).
      const respTransitDays = avail.find(r => typeof r?.data?.estimated_transit_days === 'number')?.data?.estimated_transit_days;
      if (typeof respTransitDays === 'number' && Number.isFinite(respTransitDays)) {
        setTransit(`${Math.max(0, Math.ceil(respTransitDays))} day${respTransitDays === 1 ? '' : 's'}`);
      } else {
        // fallback to local heuristic string
        setTransit(estimateTransitDays(usedMiles ?? null));
      }
      const roundedDiscounted = discountedSum ? Math.round(discountedSum * 100) / 100 : null;
      const roundedNormal = normalSum ? Math.round(normalSum * 100) / 100 : null;
      setDiscountedTotal(roundedDiscounted);
      setNormalTotal(roundedNormal);
      // keep legacy 'estimate' aligned to discounted total
      setEstimate(roundedDiscounted);
      if (roundedDiscounted != null && usedMiles) {
        setPerMile(Math.round((roundedDiscounted / usedMiles) * 100) / 100);
      } else {
        setPerMile(null);
      }
      // Compute a weighted confidence percentage (by sample size). Fallbacks: min or single value.
      const totalSamples = avail.reduce((acc, r) => acc + (Number(r?.data?.sample_size) || 0), 0);
      let weightedPct: number | null = null;
      if (totalSamples > 0) {
        const num = avail.reduce((acc, r) => acc + ((Number(r?.data?.confidence_pct) || 0) * (Number(r?.data?.sample_size) || 0)), 0);
        weightedPct = Math.round(num / totalSamples);
      } else {
        const firstPct = avail.find(r => typeof r?.data?.confidence_pct === 'number')?.data?.confidence_pct;
        weightedPct = typeof firstPct === 'number' ? Math.round(firstPct) : null;
      }
      if (typeof weightedPct === 'number') setConfidencePct(Math.max(5, Math.min(99, weightedPct)));
    } finally {
      setBusy(false);
    }
  }, [step1, vehicles, miles]);

  const onSubmitStep1 = async (data: Step1Values) => {
    void data; // validation already handled
    setActiveStep(1);
  };

  // Step 2 handlers: add to cart and next
  const addVehicleToCart = async () => {
    const ok = await step2.trigger(["vehicle_type","vehicle_year","vehicle_make","vehicle_model","vehicle_inop"]);
    if (!ok) return;
    const vals = step2.getValues();
    setVehicles(prev => [...prev, {
      vehicle_type: vals.vehicle_type,
      vehicle_year: vals.vehicle_year || '',
      vehicle_make: vals.vehicle_make || '',
      vehicle_model: vals.vehicle_model || '',
      vehicle_inop: vals.vehicle_inop || '0',
    }]);
    // Reset fields for adding another
    step2.reset({ vehicle_type: vals.vehicle_type, vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' }, { keepDefaultValues: false });
  };

  const proceedToEstimate = async () => {
    if (vehicles.length === 0) return;
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
        vehicle_type: vehicles[0]?.vehicle_type ?? s2.vehicle_type,
        vehicle_class: vehicles[0]?.vehicle_type ?? s2.vehicle_type,
        vehicles_count: vehicles.length,
        transport_type: "Open",
      },
    };
    (payload as any).Vehicles = vehicles;
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
        <h1 className={`${titleSize} font-bold text-slate-800`}>
          {activeStep === 0 && 'Get Your Instant Quote'}
          {activeStep === 1 && 'What Are You Shipping?'}
          {activeStep === 2 && 'Your Quote Is Ready!'}
          {activeStep === 3 && 'Almost Done!'}
        </h1>
      </div>

      {/* Step 1: Locations */}
      {activeStep === 0 && (
        <FormProvider {...step1}>
          <form className={`${padding} space-y-5 w-full max-w-none`} onSubmit={step1.handleSubmit(onSubmitStep1)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ZipcodeAutocompleteRHF fieldNames={{ value: "origin_city" }} label="Shipping FROM" placeholder="City or Zip Code" />
              <ZipcodeAutocompleteRHF fieldNames={{ value: "destination_city" }} label="Shipping TO" placeholder="City or Zip Code" />
            </div>
            <div>
              <button className="w-full inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-2.5 hover:bg-sky-700 transition-colors" type="submit">
                Show My Vehicle Options
              </button>
              <p className="mt-2 text-xs text-slate-500">Takes less than a minute</p>
            </div>
          </form>
        </FormProvider>
      )}

      {/* Step 2: Vehicle details and cart */}
      {activeStep === 1 && (
        <FormProvider {...step2}>
          <form className={`${padding} space-y-6 w-full max-w-none`}>
            <fieldset className="space-y-4">
              <div className="flex items-center justify-between">
                <legend className="text-md font-semibold text-slate-800">Add your vehicle</legend>
                <div aria-live="polite" className="inline-flex items-center gap-2">
                  <span className="text-xs text-slate-500">Added</span>
                  <span className="inline-flex items-center justify-center bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-sm font-semibold">{vehicles.length}</span>
                </div>
              </div>
              {/* Single backend type select (including presets) */}
              {/* Layout: 1 column on mobile, 2 columns on md+ for better readability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Vehicle Type */}
                <div className="md:col-span-1">
                  <VehicleTypeAsyncSelect
                    name="vehicle_type"
                    label="Vehicle Type"
                    endpoint={apiUrl('/api/vehicles/types')}
                    hidePresets={false}
                  />
                </div>
                {/* Vehicle Year */}
                <div className="md:col-span-1">
                  <Controller name="vehicle_year" control={step2.control} render={({ field }) => (
                    <div className="flex flex-col">
                      <label htmlFor="vehicle_year" className="text-xs font-semibold text-slate-700 mb-1">Vehicle Year</label>
                      <select id="vehicle_year" {...field} className="appearance-none bg-white border border-slate-300 rounded-md px-3 h-10 text-sm focus:outline-none focus:border-sky-600">
                        <option value="">Select year</option>
                        {Array.from({ length: 50 }, (_, i) => {
                          const current = new Date().getFullYear() + 1;
                          const y = String(current - i);
                          return <option key={y} value={y}>{y}</option>;
                        })}
                      </select>
                    </div>
                  )} />
                </div>
                {/* Vehicle Make */}
                <div className="md:col-span-1">
                  <MakeAsyncSelect
                    name="vehicle_make"
                    label="Vehicle Make"
                    endpoint={apiUrl('/api/vehicles/makes')}
                    onPickedMake={() => {
                      step2.setValue('vehicle_model','',{ shouldDirty: true, shouldValidate: true });
                    }}
                  />
                </div>
                {/* Vehicle Model */}
                <div className="md:col-span-1">
                  <ModelAsyncSelect
                    name="vehicle_model"
                    label="Vehicle Model"
                    endpoint={apiUrl('/api/vehicles/models')}
                    make={step2.watch('vehicle_make')}
                    disabled={!step2.watch('vehicle_make')}
                  />
                </div>
                {/* Running status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Is it running?</label>
                  <Controller
                    name="vehicle_inop"
                    control={step2.control}
                    defaultValue={'0'}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-3">
                        <div>
                          <input
                            type="radio"
                            id="running_yes"
                            value="0"
                            checked={(field.value ?? '0') === '0'}
                            onChange={() => field.onChange('0')}
                            className="sr-only peer"
                          />
                          <label htmlFor="running_yes" className="text-sm block text-center min-w-[96px] px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">Yes</label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="running_no"
                            value="1"
                            checked={field.value === '1'}
                            onChange={() => field.onChange('1')}
                            className="sr-only peer"
                          />
                          <label htmlFor="running_no" className="text-sm block text-center min-w-[96px] px-4 py-2 rounded-lg border border-slate-300 cursor-pointer peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 font-semibold transition-colors">No</label>
                        </div>
                      </div>
                    )}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Non-running vehicles require winch/forklift assistance and may cost more.</p>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button type="button" onClick={addVehicleToCart} className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Add vehicle</button>
              </div>
              {vehicles.length > 0 && (
                <div className="pt-2">
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-amber-900">Vehicles added</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      {vehicles.map((v, idx) => (
                        <span key={idx} className="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 px-3 py-1 text-[12px] font-medium border border-slate-200">
                          {`${v.vehicle_year} ${v.vehicle_make} ${v.vehicle_model}`.trim()} · {v.vehicle_type} · {v.vehicle_inop === '1' ? 'Non-running' : 'Running'}
                          <button type="button" onClick={() => setVehicles(list => list.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-slate-600 leading-none">Remove</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500">Add each vehicle to your cart. Then continue to see your estimated price.</p>
            </fieldset>
            <div className="flex gap-2 items-start">
              <button type="button" onClick={() => setActiveStep(0)} className="w-32 sm:w-36 inline-flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Back
              </button>
              <button className="flex-1 inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-2.5 hover:bg-sky-700 transition-colors" type="button" disabled={busy || vehicles.length === 0} onClick={proceedToEstimate}>
                {busy ? "Calculating..." : `Get My Estimated Price${vehicles.length > 0 ? ` (${vehicles.length} vehicle${vehicles.length>1? 's':''})` : ''}`}
              </button>
            </div>
          </form>
        </FormProvider>
      )}

      {/* Step 3: Estimate & insights */}
      {activeStep === 2 && (
        <div className={`${padding} space-y-6 w-full max-w-none`}>
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs tracking-wider text-slate-500">Special discount for you</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-extrabold text-slate-900">{discountedTotal != null ? `$${discountedTotal.toLocaleString()}` : "--"}</p>
                  {perMile != null && miles != null && (
                    <p className="text-xs text-slate-500">~${perMile}/mi · {formatMiles(miles)}</p>
                  )}
                </div>
                {normalTotal != null && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm line-through text-slate-400">${normalTotal.toLocaleString()}</span>
                    {discountedTotal != null && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">
                        You save ${(Math.max(0, (normalTotal - discountedTotal))).toFixed(0)} ({normalTotal > 0 ? Math.round((1 - discountedTotal / normalTotal) * 100) : 0}%)
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="min-w-[180px] flex-1 sm:flex-initial">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Confidence</span>
                  <span>{confidencePct != null ? `${confidencePct}%` : (overallConfidence ? overallConfidence : "--")}</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(confidencePct ?? 0)}%`,
                      backgroundColor: `hsl(${Math.round(((confidencePct ?? 0) / 100) * 120)}, 85%, 45%)`,
                      transition: 'width 300ms ease-out'
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            {miles != null && (
              <p className="text-xs text-slate-500">Estimated transit time: {transit ?? "--"}</p>
            )}
            <p className="text-[11px] text-slate-500">
              Based on similar real orders. Final price may vary.
            </p>
            {estResponses.length > 1 && (
              <div className="pt-1">
                <p className="text-[11px] font-medium text-slate-600">Breakdown:</p>
                <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
                  {estResponses.map(r => (
                    <li key={r.type}>{r.count}× {r.type}: ${r.data?.discounted_estimate_total ?? r.data?.low_estimate_total ?? '--'}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2 text-amber-900">
            <p className="text-sm font-semibold">Important</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Vehicle size and condition directly impact the total transport cost.</li>
            </ul>
          </div>
          <div>
            {/* Primary CTA with Back always on the same row */}
            <div className="flex gap-2 items-start">
              <button type="button" onClick={() => setActiveStep(1)} className="w-32 sm:w-36 inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</button>
              <button onClick={goToContact} className="flex-1 inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-2.5 hover:bg-sky-700 transition-colors" type="button">Lock In My Quote</button>
            </div>
          </div>
          {/* transit time moved up into the estimate card for a cleaner layout */}
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
            <div className="flex gap-3 items-start pt-1">
              <button type="button" onClick={() => setActiveStep(2)} className="w-32 sm:w-36 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</button>
              <div className="flex-1">
                <button id="submit_button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 text-white font-bold py-3 px-6 hover:bg-orange-700 transition-all duration-300 text-base"
                  type="submit"
                >
                  Get My Final Quote
                  <FaRegPaperPlane />
                </button>
                <p className="mt-2 text-xs text-slate-500">Get your personalized quote and delivery details</p>
              </div>
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
