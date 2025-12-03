import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import Select from 'react-select';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ZipcodeAutocompleteRHF from "../inputs/ZipcodeAutocompleteRHF";
import { distanceForLocations, estimateTransitDays, formatMiles } from "../../services/distance";
import { parseCityStateZip } from "../../utils/leadFormat";
import { apiUrl } from "../../services/config";
import { postPriceEstimate, type PriceEstimateRequest, type PriceEstimateResponse } from "../../services/priceEstimate";
import MakeAsyncSelect from "../MakeAsyncSelect";
import ModelAsyncSelect from "../ModelAsyncSelect";
import VehicleTypeAsyncSelect from "../VehicleTypeAsyncSelect";
import AutoSuggestInput from "../inputs/AutoSuggestInput";
import CustomInputOnlyText from "../inputs/CustomInputOnlyText";
import CustomInputPhone from "../inputs/CustomInputPhone";
import CustomInput from "../inputs/CustomInput";
import DateInput from "../inputs/CustomInputDate";
import { FaRegPaperPlane, FaPlus, FaTrash } from "react-icons/fa";
import { format } from "date-fns";
import { sendLeadToLanding } from "../../services/lead";
import { saveEmail, saveLead, saveNumberLead } from "../../services/localStorage";
import { showNotification } from "../../utils/notificaction";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import Swal from "sweetalert2";

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
    vehicle_year: yup.string().optional().matches(/^(19|20)\d{2}$/, 'Year must be YYYY').test('year-range', 'Year out of range', function (val) {
      if (!val) return true; const y = Number(val); const max = new Date().getFullYear() + 1; const min = 1970; return y >= min && y <= max;
    }),
    vehicle_make: yup.string().optional().max(40),
    vehicle_model: yup.string().optional().max(60),
    vehicle_inop: yup.mixed<'0' | '1'>().oneOf(['0', '1']).optional(),
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
  const [submitting, setSubmitting] = useState(false);
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
    // Start with no preselected vehicle type so the user must choose explicitly
    defaultValues: { vehicle_type: "", vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: '0' },
  });

  // Modo de selección: 'specific' (año/marca/modelo) o 'generic' (solo tipo cuando no sabe detalles)
  const [vehicleMode, setVehicleMode] = useState<'specific' | 'generic'>('specific');
  // Reset fields not used when switching modes to avoid confusion
  useEffect(() => {
    if (vehicleMode === 'generic') {
      // Clear specific fields
      step2.setValue('vehicle_year', '');
      step2.setValue('vehicle_make', '');
      step2.setValue('vehicle_model', '');
    } else {
      // Clear generic field
      step2.setValue('vehicle_type', '');
    }
  }, [vehicleMode]);
  // Evitar auto-agregar duplicados mientras el usuario aún edita
  const [lastAddedSignature, setLastAddedSignature] = useState<string>('');

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
      email: yup.string().optional(),
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
    // Build mixed vehicles list (generic types and specific vehicles)
    type MixedItem = (
      { kind: 'generic'; type: string; inop?: boolean; count: number } |
      { kind: 'specific'; type?: string; year?: number; make?: string; model?: string; inop?: boolean; count: number }
    );
    const genericsMap = new Map<string, MixedItem>();
    const specificsMap = new Map<string, MixedItem>();
    for (const v of vehicles) {
      const inop = (v.vehicle_inop === '1');
      const hasSpecific = !!(v.vehicle_year || v.vehicle_make || v.vehicle_model);
      if (hasSpecific) {
        const key = [v.vehicle_type || '', v.vehicle_year || '', v.vehicle_make || '', v.vehicle_model || '', inop ? '1' : '0'].join('|').toLowerCase();
        if (!specificsMap.has(key)) {
          specificsMap.set(key, {
            kind: 'specific',
            type: v.vehicle_type || undefined,
            year: v.vehicle_year ? Number(v.vehicle_year) : undefined,
            make: v.vehicle_make || undefined,
            model: v.vehicle_model || undefined,
            inop,
            count: 1,
          });
        } else {
          specificsMap.get(key)!.count += 1;
        }
      } else {
        const t = (v.vehicle_type || '').toLowerCase();
        if (!t) continue;
        const key = `${t}|${inop ? '1' : '0'}`;
        if (!genericsMap.has(key)) {
          genericsMap.set(key, { kind: 'generic', type: t, inop, count: 1 });
        } else {
          genericsMap.get(key)!.count += 1;
        }
      }
    }
    const mixedItems: MixedItem[] = [...genericsMap.values(), ...specificsMap.values()];
    setBusy(true);
    try {
      // Extract zips from inputs
      const o = parseCityStateZip(s1.origin_city || "");
      const d = parseCityStateZip(s1.destination_city || "");
      const origin_zip = o.postalCode || ((s1.origin_city || "").match(/(\d{5})/) || [""])[0];
      const destination_zip = d.postalCode || ((s1.destination_city || "").match(/(\d{5})/) || [""])[0];
      // Unified request payload (supports generic and specific vehicles)
      const unifiedPayload: PriceEstimateRequest = {
        origin_zip,
        destination_zip,
        transport_type: 'open',
        vehicles: mixedItems.map(it => it.kind === 'generic'
          ? { type: it.type, inop: !!it.inop, count: it.count }
          : { type: it.type, year: it.year!, make: it.make!, model: it.model!, inop: !!it.inop, count: it.count }
        ),
      };

      const results: any[] = [];
      let unifiedResp: PriceEstimateResponse | null = await postPriceEstimate(unifiedPayload);

      if (unifiedResp && (Array.isArray(unifiedResp.items) || typeof unifiedResp.estimate_available !== 'undefined')) {
        const items = Array.isArray(unifiedResp.items) ? unifiedResp.items : [];
        if (items.length > 0) {
          for (const it of items) {
            const label = (it.year && it.make && it.model) ? `${it.year} ${it.make} ${it.model}` : (it.type || 'vehicle');
            const count = Number(it.count || 1) || 1;
            results.push({ type: String(label), count, data: it });
          }
        } else {
          results.push({ type: 'vehicles', count: vehicles.length, data: unifiedResp });
        }
        setEstResponses(results);
        const discountedSum = (typeof unifiedResp.discounted_estimate_total === 'number')
          ? Number(unifiedResp.discounted_estimate_total)
          : items.reduce((acc: number, it: any) => acc + (Number(it.discounted_estimate_total ?? it.low_estimate_total) || 0), 0);
        const normalSum = (typeof unifiedResp.normal_estimate_total === 'number')
          ? Number(unifiedResp.normal_estimate_total)
          : items.reduce((acc: number, it: any) => {
            const d2 = Number(it.discounted_estimate_total ?? it.low_estimate_total);
            const n2 = Number(it.normal_estimate_total);
            return acc + (Number.isFinite(n2) ? n2 : (Number.isFinite(d2) ? Math.round(d2 * 1.15 * 100) / 100 : 0));
          }, 0);
        let usedMiles: number | null = null;
        const pricingMiles = typeof unifiedResp.distance_used_for_pricing_miles === 'number' ? unifiedResp.distance_used_for_pricing_miles : undefined;
        const refFromResp = typeof unifiedResp.reference_distance_miles === 'number' ? unifiedResp.reference_distance_miles : undefined;
        if (typeof pricingMiles === 'number') usedMiles = pricingMiles;
        else if (typeof refFromResp === 'number') usedMiles = refFromResp;
        else { const dist = await distanceForLocations(s1.origin_city, s1.destination_city); usedMiles = dist.miles ?? null; }
        setMiles(usedMiles);
        const respTransitDays = typeof unifiedResp.estimated_transit_days === 'number' ? unifiedResp.estimated_transit_days : undefined;
        if (typeof respTransitDays === 'number' && Number.isFinite(respTransitDays)) setTransit(`${Math.max(0, Math.ceil(respTransitDays))} day${respTransitDays === 1 ? '' : 's'}`);
        else setTransit(estimateTransitDays(usedMiles ?? null));
        const roundedDiscounted = discountedSum ? Math.round(discountedSum * 100) / 100 : null;
        const roundedNormal = normalSum ? Math.round(normalSum * 100) / 100 : null;
        setDiscountedTotal(roundedDiscounted);
        setNormalTotal(roundedNormal);
        setEstimate(roundedDiscounted);
        setPerMile(roundedDiscounted != null && usedMiles ? Math.round((roundedDiscounted / usedMiles) * 100) / 100 : null);
        const topPct = typeof unifiedResp.confidence_pct === 'number' ? unifiedResp.confidence_pct : null;
        if (typeof topPct === 'number') setConfidencePct(Math.max(5, Math.min(99, Math.round(topPct))));
        else if (Array.isArray(items) && items.length) {
          const totalSamples = items.reduce((acc: number, it: any) => acc + (Number(it.sample_size) || 0), 0);
          if (totalSamples > 0) {
            const num = items.reduce((acc: number, it: any) => acc + ((Number(it.confidence_pct) || 0) * (Number(it.sample_size) || 0)), 0);
            const w = Math.round(num / totalSamples);
            setConfidencePct(Math.max(5, Math.min(99, w)));
          } else {
            const firstPct = items.find((it: any) => typeof it?.confidence_pct === 'number')?.confidence_pct;
            if (typeof firstPct === 'number') setConfidencePct(Math.max(5, Math.min(99, Math.round(firstPct))));
          }
        }
      } else {
        // Backward compatibility: per-type loop
        const distinct = Array.from(new Set(vehicles.map(v => v.vehicle_type)));
        for (const vt of distinct) {
          const count = vehicles.filter(v => v.vehicle_type === vt).length;
          const legacyPayload: PriceEstimateRequest = {
            origin_zip,
            destination_zip,
            transport_type: 'open',
            vehicle_type: vt,
            inop: false,
            vehicles_count: count,
          };
          const resp = await postPriceEstimate(legacyPayload);
          if (resp) {
            results.push({ type: vt, count, data: resp });
          }
        }
        setEstResponses(results);
        const avail = results.filter(r => r?.data?.estimate_available);
        const discountedSum = avail.reduce((acc, r) => acc + (Number(r.data?.discounted_estimate_total ?? r.data?.low_estimate_total) || 0), 0);
        const normalSum = avail.reduce((acc, r) => {
          const d2 = Number(r.data?.discounted_estimate_total ?? r.data?.low_estimate_total);
          const n2 = Number(r.data?.normal_estimate_total);
          return acc + (Number.isFinite(n2) ? n2 : (Number.isFinite(d2) ? Math.round(d2 * 1.15 * 100) / 100 : 0));
        }, 0);
        let usedMiles: number | null = null;
        const pricingMiles = avail.find(r => typeof r?.data?.distance_used_for_pricing_miles === 'number')?.data?.distance_used_for_pricing_miles;
        const refFromResp = avail.find(r => typeof r?.data?.reference_distance_miles === 'number')?.data?.reference_distance_miles;
        if (typeof pricingMiles === 'number') usedMiles = pricingMiles;
        else if (typeof refFromResp === 'number') usedMiles = refFromResp;
        else { const dist = await distanceForLocations(s1.origin_city, s1.destination_city); usedMiles = dist.miles ?? null; }
        setMiles(usedMiles);
        const respTransitDays = avail.find(r => typeof r?.data?.estimated_transit_days === 'number')?.data?.estimated_transit_days;
        if (typeof respTransitDays === 'number' && Number.isFinite(respTransitDays)) setTransit(`${Math.max(0, Math.ceil(respTransitDays))} day${respTransitDays === 1 ? '' : 's'}`);
        else setTransit(estimateTransitDays(usedMiles ?? null));
        const roundedDiscounted = discountedSum ? Math.round(discountedSum * 100) / 100 : null;
        const roundedNormal = normalSum ? Math.round(normalSum * 100) / 100 : null;
        setDiscountedTotal(roundedDiscounted);
        setNormalTotal(roundedNormal);
        setEstimate(roundedDiscounted);
        setPerMile(roundedDiscounted != null && usedMiles ? Math.round((roundedDiscounted / usedMiles) * 100) / 100 : null);
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
      }
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
    const ok = await step2.trigger(["vehicle_type", "vehicle_year", "vehicle_make", "vehicle_model", "vehicle_inop"]);
    if (!ok) return;
    const vals = step2.getValues();
    // Este método se mantiene para compatibilidad, pero la UX ahora auto-agrega.
    const row: VehicleRow = {
      vehicle_type: vals.vehicle_type,
      vehicle_year: vehicleMode === 'specific' ? (vals.vehicle_year || '') : '',
      vehicle_make: vehicleMode === 'specific' ? (vals.vehicle_make || '') : '',
      vehicle_model: vehicleMode === 'specific' ? (vals.vehicle_model || '') : '',
      vehicle_inop: vals.vehicle_inop || '0',
    };
    setVehicles(prev => [...prev, row]);
    setLastAddedSignature(signatureForRow(row));
    // Reset según modo
    if (vehicleMode === 'generic') {
      step2.reset({ vehicle_type: '', vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: vals.vehicle_inop || '0' });
    } else {
      step2.reset({ vehicle_type: vals.vehicle_type, vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: vals.vehicle_inop || '0' });
    }
  };

  // Firma única para evitar duplicaciones accidentales
  function signatureForRow(r: VehicleRow): string {
    return `${r.vehicle_type}|${r.vehicle_year}|${r.vehicle_make}|${r.vehicle_model}|${r.vehicle_inop}`.toLowerCase();
  }

  // Auto-agregar en modo genérico cuando se selecciona el tipo
  useEffect(() => {
    if (vehicleMode !== 'generic') return;
    const vt = step2.getValues('vehicle_type');
    if (!vt) return;
    const row: VehicleRow = { vehicle_type: vt, vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_inop: step2.getValues('vehicle_inop') || '0' };
    const sig = signatureForRow(row);
    if (sig === lastAddedSignature) return;
    setVehicles(prev => [...prev, row]);
    setLastAddedSignature(sig);
    showNotification({ text: 'Vehicle type added', icon: 'success' });
    // limpiar para permitir añadir otro tipo
    step2.setValue('vehicle_type', '');
  }, [step2.watch('vehicle_type'), vehicleMode]);

  // Auto-agregar en modo específico cuando año+make+model completos
  useEffect(() => {
    if (vehicleMode !== 'specific') return;
    const year = step2.getValues('vehicle_year');
    const make = step2.getValues('vehicle_make');
    const model = step2.getValues('vehicle_model');
    if (!year || !make || !model) return;
    // Inferimos un tipo para cálculo si no hay uno elegido (fallback 'car')
    const inferredType = step2.getValues('vehicle_type') || 'car';
    const row: VehicleRow = { vehicle_type: inferredType, vehicle_year: year, vehicle_make: make, vehicle_model: model, vehicle_inop: step2.getValues('vehicle_inop') || '0' };
    const sig = signatureForRow(row);
    if (sig === lastAddedSignature) return;
    setVehicles(prev => [...prev, row]);
    setLastAddedSignature(sig);
    showNotification({ text: 'Specific vehicle added', icon: 'success' });
    // Reset para permitir otro
    step2.setValue('vehicle_year', '');
    step2.setValue('vehicle_make', '');
    step2.setValue('vehicle_model', '');
  }, [step2.watch('vehicle_year'), step2.watch('vehicle_make'), step2.watch('vehicle_model'), vehicleMode]);

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

  const [emailSuggestion, setEmailSuggestion] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'warning' | 'blocked'>('idle');
  const [emailConfirmedOverride, setEmailConfirmedOverride] = useState(false);

  const validateEmail = async (email: string): Promise<'valid' | 'blocked' | 'warning' | 'idle'> => {
    if (!email) {
      setEmailStatus('idle');
      return 'valid';
    }

    // Always validate against backend to ensure score is checked
    setEmailStatus('loading');
    try {
      const response = await fetch(apiUrl('/api/customers/validate-email-landing/'), {
        method: 'POST',
        headers: {
          'X-API-KEY': import.meta.env.PUBLIC_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      const score = typeof data.score === 'number' ? data.score : 0;

      if (score < 50) {
        setEmailStatus('blocked');
        step4.setError('email', {
          type: 'manual',
          message: 'Invalid email address.'
        });
        return 'blocked';
      }

      // Score >= 50: Check for suggestions or valid
      if (data.suggested) {
        setEmailSuggestion(data.suggested);
        setEmailStatus('warning');
        // Don't set error yet, just warning UI
        return 'warning';
      }

      // Valid
      step4.clearErrors('email');
      setEmailSuggestion('');
      setEmailStatus('valid');
      return 'valid';

    } catch (error) {
      console.error('Email validation error:', error);
      setEmailStatus('idle');
      return 'valid'; // Fallback
    }
  };

  const handleEmailConfirmation = async () => {
    const result = await Swal.fire({
      title: 'Verify Email Address',
      html: `We couldn't verify <b>${step4.getValues('email')}</b>.<br/>It might be a typo or a temporary address.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0284c7', // sky-600
      cancelButtonColor: '#64748b', // slate-500
      confirmButtonText: 'Use this email anyway',
      cancelButtonText: 'Let me check again',
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      setEmailConfirmedOverride(true);
      step4.clearErrors('email');
      setEmailStatus('valid'); // Visually valid now
      return true;
    }
    return false;
  };

  const submitLead = async () => {
    if (submitting) return;
    const s1 = step1.getValues();
    const s2 = step2.getValues();
    const s4: any = step4.getValues();
    // Honeypot and min-time checks
    if (s4?.website && String(s4.website).trim() !== "") {
      showNotification({ text: "Error sending lead", icon: "error" });
      return;
    }
    // Reduced to 1s to avoid blocking legitimate fast users (autofill)
    if (step4ShownAt && Date.now() - step4ShownAt < 1000) {
      showNotification({ text: "Please wait a moment before submitting.", icon: "error" });
      return;
    }

    if (s4.email && !emailConfirmedOverride) {
      // If status is blocked, stop immediately
      if (emailStatus === 'blocked') {
        showNotification({ text: "Please provide a valid email address.", icon: "error" });
        return;
      }

      // If status is invalid (legacy) or warning, ask for confirmation
      if (emailStatus === 'invalid' || emailStatus === 'warning') {
        const confirmed = await handleEmailConfirmation();
        if (!confirmed) return;
      } else if (emailStatus === 'idle') {
        // Validate if not yet validated
        const status = await validateEmail(s4.email);

        if (status === 'blocked') {
          showNotification({ text: "Please provide a valid email address.", icon: "error" });
          return;
        }

        if (status === 'warning') {
          const confirmed = await handleEmailConfirmation();
          if (!confirmed) return;
        }
      }
    }

    setSubmitting(true);
    // Determine primary vehicle (first in the cart) or fallback to current step2 values
    const primaryVehicle = vehicles[0] ?? {
      vehicle_type: s2.vehicle_type,
      vehicle_year: s2.vehicle_year || '',
      vehicle_make: s2.vehicle_make || '',
      vehicle_model: s2.vehicle_model || '',
      vehicle_inop: s2.vehicle_inop || '0',
    };

    const payload: any = {
      ...s1,
      transport_type: "1", // assume Open for quick quote
      ...s4,
      client_estimate: {
        miles,
        per_mile: perMile,
        total: estimate,
        transit,
        vehicle_type: primaryVehicle?.vehicle_type ?? s2.vehicle_type,
        vehicle_class: primaryVehicle?.vehicle_type ?? s2.vehicle_type,
        vehicles_count: vehicles.length,
        transport_type: "Open",
        // include the specific primary vehicle details so backend receives year/make/model/inop
        primary_vehicle: {
          year: primaryVehicle.vehicle_year || '',
          make: primaryVehicle.vehicle_make || '',
          model: primaryVehicle.vehicle_model || '',
          inop: primaryVehicle.vehicle_inop || '0',
        },
      },
    };
    // Sanitizar vehículos para envío: si tiene datos específicos borramos vehicle_type público
    const sanitizedVehicles = vehicles.map(v => {
      const hasSpecific = (v.vehicle_year || v.vehicle_make || v.vehicle_model);
      return hasSpecific ? { ...v, vehicle_type: '' } : v;
    });
    (payload as any).Vehicles = sanitizedVehicles;
    try {
      const formatted = { ...payload, ship_date: formatShipDateLocal(s4.ship_date as any) };
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
        setSubmitting(false);
      }
    } catch (e) {
      showNotification({ text: "Error sending lead", icon: "error" });
      setSubmitting(false);
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
            {activeStep === 0 && 'Get Your Instant Estimated Price'}
            {activeStep === 1 && 'What Are You Shipping?'}
            {activeStep === 2 && 'Your Estimated Price is Ready!'}
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
                <button className="w-full inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-3 text-base hover:bg-sky-700 transition-colors" type="submit">
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
            <form className={`${padding} space-y-4 w-full max-w-none`}>
              <fieldset className="space-y-4">
                <div className="flex items-center justify-between">
                  <legend className="text-md font-semibold text-slate-800">Add your vehicle</legend>
                  <div aria-live="polite" className="inline-flex items-center gap-2">
                    <span className="text-xs text-slate-500">Added</span>
                    <span className="inline-flex items-center justify-center bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-sm font-semibold">{vehicles.length}</span>
                  </div>
                </div>
                {/* Selector de modo de captura */}
                <div className="rounded-md border border-slate-200 p-3 bg-slate-50 space-y-2">
                  <p className="text-xs text-slate-600 font-medium">How would you like to describe your vehicle?</p>
                  <div className="flex flex-col gap-2">
                    <button type="button"
                      onClick={() => setVehicleMode('specific')}
                      className={`flex-1 text-left px-3 py-2 rounded-md border text-xs font-semibold transition-colors ${vehicleMode === 'specific' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:border-sky-400'}`}>Full Details</button>
                    <button type="button"
                      onClick={() => setVehicleMode('generic')}
                      className={`flex-1 text-left px-3 py-2 rounded-md border text-xs font-semibold transition-colors ${vehicleMode === 'generic' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:border-sky-400'}`}>Other</button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {vehicleMode === 'specific' && 'Enter exact details. If your exact vehicle is not recognized, we still classify it internally.'}
                    {vehicleMode === 'generic' && 'Select only a generic type if you do not know the details OR your exact vehicle does not appear. It will be added automatically.'}
                  </p>
                </div>
                {/* Fields in responsive layout */}
                <div className="grid grid-cols-1 gap-4 pt-1">
                  {vehicleMode === 'generic' && (
                    <>
                      <div>
                        <VehicleTypeAsyncSelect
                          name="vehicle_type"
                          label={'Vehicle Type'}
                          endpoint={apiUrl('/api/vehicles/types/?for_landing=1')}
                          hidePresets={false}
                        />
                        <p className="text-[10px] mt-1 text-slate-500">Added automatically when selected.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Is it running?</label>
                        <Controller
                          name="vehicle_inop"
                          control={step2.control}
                          defaultValue={'0'}
                          render={({ field }) => (
                            <div className="flex items-center">
                              <button
                                type="button"
                                aria-pressed={(field.value ?? '0') !== '1'}
                                onClick={() => field.onChange((field.value ?? '0') === '1' ? '0' : '1')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${((field.value ?? '0') === '1') ? 'bg-slate-300' : 'bg-sky-600'}`}
                              >
                                <span className={`${((field.value ?? '0') === '1') ? 'translate-x-0' : 'translate-x-5'} inline-block h-4 w-4 transform rounded-full bg-white transition`}></span>
                              </button>
                              <span className="ml-2 text-sm text-slate-700">{((field.value ?? '0') === '1') ? 'No' : 'Yes'}</span>
                            </div>
                          )}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Non-running vehicles may require winch/forklift assistance and may cost more.</p>
                      </div>
                    </>
                  )}

                  {vehicleMode === 'specific' && (
                    <>
                      {/* Year */}
                      <div>
                        <Controller
                          name="vehicle_year"
                          control={step2.control}
                          render={({ field }) => {
                            const current = new Date().getFullYear() + 1;
                            const years = Array.from({ length: 50 }, (_, i) => ({ value: String(current - i), label: String(current - i) }));
                            const hasError = !!(step2.formState?.errors as any)?.vehicle_year;
                            return (
                              <div className="flex flex-col">
                                <label htmlFor="vehicle_year" className="text-xs font-semibold text-slate-700 mb-1">Vehicle Year</label>
                                <Select
                                  inputId="vehicle_year"
                                  value={field.value ? { value: field.value, label: field.value } : null}
                                  onChange={(opt: any) => field.onChange(opt?.value ?? '')}
                                  options={years}
                                  isClearable
                                  classNamePrefix="react-select"
                                  placeholder="Select year"
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      boxShadow: 'none',
                                      border: `1px solid ${hasError ? 'red' : '#e2e8f0'}`,
                                      borderRadius: '0.375rem',
                                      minHeight: '2.5rem',
                                      '&:hover': { border: `1px solid ${hasError ? 'red' : '#00a1e1'}` },
                                    }),
                                    valueContainer: (p) => ({ ...p, padding: '0 0.75rem' }),
                                    input: (p) => ({ ...p, margin: 0 }),
                                    placeholder: (p) => ({ ...p, fontSize: '0.875rem' }),
                                    singleValue: (p) => ({ ...p, fontSize: '0.875rem' }),
                                    indicatorSeparator: () => ({ display: 'none' }),
                                    menu: (p) => ({ ...p, maxHeight: '12rem' }),
                                    menuList: (p) => ({ ...p, maxHeight: '12rem', overflowY: 'auto' }),
                                  }}
                                  className={`bg-white`}
                                />
                              </div>
                            );
                          }}
                        />
                      </div>
                      <div>
                        <MakeAsyncSelect
                          name="vehicle_make"
                          label="Vehicle Make"
                          endpoint={apiUrl('/api/vehicles/makes')}
                          onPickedMake={() => {
                            step2.setValue('vehicle_model', '', { shouldDirty: true, shouldValidate: true });
                          }}
                        />
                      </div>
                      {/* Model */}
                      <div>
                        <ModelAsyncSelect
                          name="vehicle_model"
                          label="Vehicle Model"
                          endpoint={apiUrl('/api/vehicles/models')}
                          make={step2.watch('vehicle_make')}
                          disabled={!step2.watch('vehicle_make')}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Is it running?</label>
                        <Controller
                          name="vehicle_inop"
                          control={step2.control}
                          defaultValue={'0'}
                          render={({ field }) => (
                            <div className="flex items-center">
                              <button
                                type="button"
                                aria-pressed={(field.value ?? '0') !== '1'}
                                onClick={() => field.onChange((field.value ?? '0') === '1' ? '0' : '1')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${((field.value ?? '0') === '1') ? 'bg-slate-300' : 'bg-sky-600'}`}
                              >
                                <span className={`${((field.value ?? '0') === '1') ? 'translate-x-0' : 'translate-x-5'} inline-block h-4 w-4 transform rounded-full bg-white transition`}></span>
                              </button>
                              <span className="ml-2 text-sm text-slate-700">{((field.value ?? '0') === '1') ? 'No' : 'Yes'}</span>
                            </div>
                          )}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Non-running vehicles may require winch/forklift assistance and may cost more.</p>
                      </div>
                    </>
                  )}
                </div>
                {/* Botón manual removido: ahora se agregan automáticamente según modo */}
                {vehicles.length > 0 && (
                  <div className="pt-2">
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm font-semibold text-amber-900">Vehicles added</p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        {vehicles.map((v, idx) => (
                          <span key={idx} className="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 px-3 py-1 text-[12px] font-medium border border-slate-200">
                            {v.vehicle_year || v.vehicle_make || v.vehicle_model ? `${v.vehicle_year} ${v.vehicle_make} ${v.vehicle_model}`.trim() : v.vehicle_type || 'Tipo'} · {v.vehicle_inop === '1' ? 'Non-running' : 'Running'}
                            <button
                              type="button"
                              onClick={() => setVehicles(list => list.filter((_, i) => i !== idx))}
                              aria-label={`Remove vehicle ${idx + 1}`}
                              title="Remove vehicle"
                              className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-colors"
                            >
                              <FaTrash className="h-3 w-3" />
                              <span className="sr-only">Remove vehicle</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                <button type="button" onClick={() => setActiveStep(0)} className="inline-flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Back
                </button>
                <button className="flex-1 inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-3 text-base hover:bg-sky-700 transition-colors" type="button" disabled={busy || vehicles.length === 0} onClick={proceedToEstimate}>
                  {busy ? "Calculating..." : `Get My Estimated Price${vehicles.length > 0 ? ` · ${numberToWord(vehicles.length)} vehicle${vehicles.length > 1 ? 's' : ''}` : ''}`}
                </button>
              </div>
            </form>
          </FormProvider>
        )}

        {/* Step 3: Estimate & insights */}
        {activeStep === 2 && (
          <div className={`${padding} space-y-6 w-full max-w-none`}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-wider uppercase text-slate-500">Special discount for you</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
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
                <div className="w-full sm:min-w-[180px] sm:flex-1 sm:flex-initial">
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
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:p-4 space-y-2 text-amber-900">
              <p className="text-sm font-semibold">Important</p>
              <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
                <li>This is an estimated price based on past orders. Our specialists will confirm the final price.</li>
                <li>Vehicle size and condition directly impact the total transport cost.</li>
              </ul>
            </div>
            <div>
              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                <button type="button" onClick={() => setActiveStep(1)} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</button>
                <button onClick={goToContact} className="flex-1 inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-semibold py-3 text-base hover:bg-sky-700 transition-colors" type="button">Lock In My Quote</button>
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
                <div>
                  <CustomInput
                    name="email"
                    max={30}
                    label="Email Address"
                    skipAutoValid={true}
                    isLoading={emailStatus === 'loading'}
                    status={
                      emailStatus === 'warning' ? 'warning' :
                        emailStatus === 'valid' ? 'success' :
                          (emailStatus === 'invalid' || emailStatus === 'blocked') ? 'error' : undefined
                    }
                    rightElement={
                      emailStatus === 'warning' ? (
                        <span className="text-amber-500" title="Suggestion available">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : undefined
                    }
                    onBlur={(e) => validateEmail(e.target.value)}
                    onChange={() => {
                      if (emailSuggestion) setEmailSuggestion('');
                      if (emailStatus !== 'idle') setEmailStatus('idle');
                      if (emailConfirmedOverride) setEmailConfirmedOverride(false);
                      step4.clearErrors('email');
                    }}
                  />
                  {/* Suggestion Card */}
                  {emailSuggestion && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 shadow-sm fadeInUp">
                      <div className="text-amber-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.387 17.387 0 005.268 0zM9.772 17.119a18.994 18.994 0 01-2.966-.231 18.992 18.992 0 01-4.245-2.381 9.712 9.712 0 006.089 6.216 12.182 12.182 0 011.122-3.604z" />
                          <path d="M2.279 12.752a9.711 9.711 0 01.945-5.003 12.754 12.754 0 004.339 2.708 18.991 18.991 0 00.214 4.772 17.165 17.165 0 01-5.498-2.477zM12 10.5a12.74 12.74 0 018.996-3.795A9.708 9.708 0 0012 2.99a9.708 9.708 0 00-8.996 3.715 12.74 12.74 0 018.996 3.795z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-amber-800 font-medium">Possible typo detected</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Did you mean <button type="button" className="font-bold underline hover:text-amber-900" onClick={() => {
                            step4.setValue('email', emailSuggestion);
                            setEmailSuggestion('');
                            setEmailStatus('valid');
                            step4.clearErrors('email');
                          }}>{emailSuggestion}</button>?
                        </p>
                      </div>
                      <button type="button" onClick={() => setEmailSuggestion('')} className="text-amber-400 hover:text-amber-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {/* Invalid Email Confirmation UI (if not using modal, or as helper) */}
                  {emailStatus === 'invalid' && !emailConfirmedOverride && (
                    <div className="mt-1 flex justify-end">
                      <button type="button" onClick={handleEmailConfirmation} className="text-[10px] text-slate-400 hover:text-slate-600 underline">
                        I am sure this email is correct
                      </button>
                    </div>
                  )}
                </div>
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
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start pt-1">
                <button type="button" onClick={() => setActiveStep(2)} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</button>
                <div className="flex-1">
                  <button id="submit_button"
                    disabled={submitting}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 text-white font-bold py-3 px-6 hover:bg-orange-700 transition-all duration-300 text-base ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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

// Ensures date formatting without timezone shifts (avoids off-by-one day)
function formatShipDateLocal(input: string | Date | null | undefined): string {
  if (!input) return "";
  // If it's a plain 'yyyy-MM-dd' string, compose MM/dd/yyyy directly
  if (typeof input === 'string') {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [, y, mm, dd] = m;
      return `${mm}/${dd}/${y}`;
    }
    // Try Date parse as fallback but normalize to local date part
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const mm = String(local.getMonth() + 1).padStart(2, '0');
      const dd = String(local.getDate()).padStart(2, '0');
      const y = String(local.getFullYear());
      return `${mm}/${dd}/${y}`;
    }
    return String(input);
  }
  // It's a Date: take local Y/M/D
  const d = input as Date;
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const y = String(local.getFullYear());
  return `${mm}/${dd}/${y}`;
}

function numberToWord(n: number): string {
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  return words[n] || String(n);
}
