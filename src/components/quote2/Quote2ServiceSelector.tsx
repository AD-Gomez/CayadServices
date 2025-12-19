import { useEffect, useMemo, useState, useCallback } from "react";
import { getLead, getQuoteUrl } from "../../services/localStorage";
import { postPriceEstimate, type TransportType, type PriceEstimateResponse } from "../../services/priceEstimate";
import { parseCityStateZip } from "../../utils/leadFormat";
import { estimateTransitDays } from "../../services/distance";
import {
    FaTruck,
    FaShieldAlt,
    FaCheck,
    FaSpinner,
    FaCreditCard,
    FaMapMarkerAlt,
    FaCar,
    FaCalendarAlt,
    FaInfoCircle,
    FaArrowRight,
    FaQuoteRight,
    FaLocationArrow,
    FaClock,
    FaTag,
    FaRocket,
    FaHeadset
} from "react-icons/fa";
import { parse, format } from "date-fns";

// Helper: Format date for API
function formatShipDateForApi(dateStr?: string): string | undefined {
    if (!dateStr) return undefined;
    try {
        const parsed = parse(dateStr, 'MM/dd/yyyy', new Date());
        if (!isNaN(parsed.getTime())) return format(parsed, 'yyyy-MM-dd');
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        return undefined;
    } catch { return undefined; }
}

// Helper: Format date for display
function formatDateForDisplay(dateStr?: string): string {
    if (!dateStr) return 'Flexible';
    try {
        const parsed = parse(dateStr, 'MM/dd/yyyy', new Date());
        if (!isNaN(parsed.getTime())) return format(parsed, 'MMMM d, yyyy');
        const parsed2 = parse(dateStr, 'yyyy-MM-dd', new Date());
        if (!isNaN(parsed2.getTime())) return format(parsed2, 'MMMM d, yyyy');
        return dateStr;
    } catch { return dateStr; }
}

type Lead = {
    origin_city?: string;
    destination_city?: string;
    transport_type?: string;
    ship_date?: string;
    shipping_timeframe?: string;
    client_estimate?: {
        total?: number | null;
        discounted_total?: number | null;
        normal_total?: number | null;
        miles?: number | null;
        transit?: string | null;
        vehicle_class?: string;
        transport_type?: string;
        primary_vehicle?: {
            year?: string;
            make?: string;
            model?: string;
            inop?: '0' | '1';
        };
    };
    Vehicles?: Array<{
        vehicle_type?: string;
        vehicle_year?: string;
        vehicle_make?: string;
        vehicle_model?: string;
        vehicle_inop?: '0' | '1';
    }>;
};

type ReferenceService = 'discounted' | 'regular';
type PriceData = { discounted: number; normal: number; };

export default function Quote2ServiceSelector() {
    const [lead, setLead] = useState<Lead | null>(null);
    const [quoteUrl, setQuoteUrl] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<ReferenceService>('regular');
    const [prices, setPrices] = useState<PriceData | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const data = getLead();
        setLead(data ?? null);
        setQuoteUrl(getQuoteUrl());

        if (data?.client_estimate) {
            const ce = data.client_estimate;
            const discounted = ce.discounted_total ?? ce.total ?? null;
            const normal = ce.normal_total ?? (discounted ? Math.round(discounted * 1.15) : null);
            if (discounted !== null && normal !== null) {
                setPrices({
                    discounted: Number(discounted.toFixed(2)),
                    normal: Number(normal.toFixed(2))
                });
                setLoading(false);
            }
        }
    }, []);

    // Build vehicle list for API
    const buildVehiclesArray = useCallback(() => {
        if (!lead) return [];
        const vehicles = (lead.Vehicles || []).map(v => {
            if (v.vehicle_year || v.vehicle_make || v.vehicle_model) {
                return {
                    year: parseInt(v.vehicle_year || '0', 10),
                    make: v.vehicle_make || '',
                    model: v.vehicle_model || '',
                    type: v.vehicle_type || 'car',
                    inop: v.vehicle_inop === '1',
                    count: 1
                };
            }
            return { type: v.vehicle_type || 'car', inop: v.vehicle_inop === '1', count: 1 };
        });

        if (vehicles.length === 0) {
            const pv = lead.client_estimate?.primary_vehicle;
            const vehicleClass = lead.client_estimate?.vehicle_class || 'car';
            const yearNum = pv?.year ? parseInt(pv.year, 10) : undefined;

            if (yearNum && yearNum > 1900) {
                vehicles.push({
                    year: yearNum,
                    make: pv?.make || '',
                    model: pv?.model || '',
                    type: vehicleClass,
                    inop: pv?.inop === '1',
                    count: 1
                });
            } else {
                vehicles.push({ type: vehicleClass, inop: pv?.inop === '1', count: 1 });
            }
        }
        return vehicles;
    }, [lead]);

    // Fetch fresh estimate if needed
    const fetchEstimate = useCallback(async (): Promise<PriceData | null> => {
        if (!lead) return null;
        const oZip = parseCityStateZip(lead.origin_city || "").postalCode || (lead.origin_city || "").match(/(\d{5})/)?.[0];
        const dZip = parseCityStateZip(lead.destination_city || "").postalCode || (lead.destination_city || "").match(/(\d{5})/)?.[0];

        if (!oZip || !dZip) return null;

        const vehicles = buildVehiclesArray();
        if (vehicles.length === 0) return null;

        try {
            const resp: PriceEstimateResponse | null = await postPriceEstimate({
                origin_zip: oZip,
                destination_zip: dZip,
                transport_type: lead.transport_type === '2' ? 'enclosed' : 'open',
                shipping_timeframe: lead.shipping_timeframe,
                ship_date: formatShipDateForApi(lead.ship_date),
                vehicles: vehicles
            });

            if (resp?.estimate_available) {
                const discounted = resp.discounted_estimate_total ?? resp.normal_estimate_total ?? null;
                const normal = resp.normal_estimate_total ?? (discounted ? Math.round(discounted * 1.15) : null);
                if (discounted !== null && normal !== null) {
                    return {
                        discounted: Number(discounted.toFixed(2)),
                        normal: Number(normal.toFixed(2))
                    };
                }
            }
        } catch (err) { console.error('Error fetching estimate:', err); }
        return null;
    }, [lead, buildVehiclesArray]);

    useEffect(() => {
        if (!lead || prices !== null) return;
        setLoading(true);
        fetchEstimate().then(res => {
            if (res) setPrices(res);
            setLoading(false);
        });
    }, [lead]);

    const handleVerifyCard = () => {
        if (quoteUrl) window.open(quoteUrl, '_blank');
    };

    const origin = useMemo(() => parseCityStateZip(lead?.origin_city || ''), [lead]);
    const destination = useMemo(() => parseCityStateZip(lead?.destination_city || ''), [lead]);
    const vehicleName = useMemo(() => {
        const pv = lead?.client_estimate?.primary_vehicle || lead?.Vehicles?.[0];
        const vPart = lead?.client_estimate?.primary_vehicle;
        if (vPart?.year || vPart?.make) return `${vPart.year || ''} ${vPart.make || ''} ${vPart.model || ''}`;
        const vArr = lead?.Vehicles?.[0];
        if (vArr?.vehicle_year || vArr?.vehicle_make) return `${vArr.vehicle_year || ''} ${vArr.vehicle_make || ''} ${vArr.vehicle_model || ''}`;
        return lead?.client_estimate?.vehicle_class || 'Vehicle';
    }, [lead]);

    const transportTypeLabel = lead?.transport_type === '2' ? 'Enclosed Transport' : 'Open Transport';
    const miles = lead?.client_estimate?.miles ?? 0;
    const savings = prices ? (prices.normal - prices.discounted) : 0;

    const transitTime = useMemo(() => {
        if (lead?.client_estimate?.transit) return lead.client_estimate.transit;
        return estimateTransitDays(miles);
    }, [lead?.client_estimate?.transit, miles]);

    return (
        <div className="w-full max-w-6xl mx-auto font-sans text-slate-800">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Main Dashboard */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Header Card (Brand Blue) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-3">
                                    <FaQuoteRight className="text-sky-300" />
                                    Your Quote is Ready!
                                </h1>
                                <p className="text-sky-100 text-sm mt-1 ml-9">Order #25279594 • Price guaranteed for 7 days</p>
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20 backdrop-blur-sm">
                                    <FaCheck size={10} /> Live Rate
                                </span>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="relative mb-8">
                                {/* Mobile Line (Horizontal but subtle) */}
                                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -translate-y-1/2 md:hidden"></div>
                                {/* Desktop Line */}
                                <div className="absolute top-[28px] left-[60px] right-[60px] h-0.5 border-t-2 border-dashed border-slate-200 hidden md:block"></div>

                                <div className="flex flex-row justify-between items-start md:items-center gap-4 relative z-10">
                                    {/* Origin */}
                                    <div className="flex-1 flex flex-col items-center text-center gap-2">
                                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-sky-600 shadow-sm relative pr-0.5">
                                            <FaLocationArrow className="-rotate-45" size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Origin</p>
                                            <h3 className="text-sm md:text-xl font-bold text-slate-900 leading-tight">{origin.city}</h3>
                                            <p className="text-xs md:text-sm text-slate-500">{origin.state} {origin.postalCode}</p>
                                        </div>
                                    </div>

                                    {/* Distance Pill */}
                                    <div className="self-center bg-slate-50 border border-slate-200 px-3 py-1 rounded-full shadow-sm z-20">
                                        <span className="text-xs md:text-sm font-bold text-slate-700 whitespace-nowrap">{miles > 0 ? miles.toLocaleString() : '---'} <span className="font-normal text-slate-500">mi</span></span>
                                    </div>

                                    {/* Destination */}
                                    <div className="flex-1 flex flex-col items-center text-center gap-2">
                                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                            <FaMapMarkerAlt size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Destination</p>
                                            <h3 className="text-sm md:text-xl font-bold text-slate-900 leading-tight">{destination.city}</h3>
                                            <p className="text-xs md:text-sm text-slate-500">{destination.state} {destination.postalCode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><FaCar /> Vehicle</span>
                                    <span className="text-sm font-semibold text-slate-700 truncate" title={vehicleName}>{vehicleName}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><FaCalendarAlt /> Date</span>
                                    <span className="text-sm font-semibold text-slate-700">{formatDateForDisplay(lead?.ship_date)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><FaTruck /> Service</span>
                                    <span className="text-sm font-semibold text-slate-700">{transportTypeLabel}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><FaClock /> Transit</span>
                                    <span className="text-sm font-semibold text-slate-700">{transitTime || '---'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Selection */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Select Your Rate Plan
                        </h2>

                        {loading ? (
                            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                                <FaSpinner className="animate-spin text-4xl text-sky-600 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Calculating rates...</p>
                            </div>
                        ) : prices ? (
                            <div className="flex flex-col gap-6">
                                {/* Standard Priority Service (Brand Blue Highlight) */}
                                <div
                                    onClick={() => setSelectedOption('regular')}
                                    className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden group ${selectedOption === 'regular'
                                            ? 'border-sky-600 bg-white ring-4 ring-sky-50 shadow-xl z-10'
                                            : 'border-slate-200 bg-white hover:border-sky-400'
                                        }`}
                                >
                                    <div className="absolute top-0 right-0 bg-sky-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                                        <FaRocket className="text-amber-300" /> Recommended for Speed
                                    </div>

                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 mt-2">
                                                    <h3 className="text-xl font-bold text-sky-900 flex items-center gap-2">
                                                        Standard Priority Service
                                                    </h3>
                                                    {selectedOption === 'regular' && <FaCheck className="text-sky-600" />}
                                                </div>
                                                <div className="flex items-baseline gap-2 mb-6">
                                                    <span className="text-4xl font-black text-slate-900">${prices.normal.toFixed(2)}</span>
                                                    <span className="text-sm text-slate-500 font-medium">USD</span>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                                                    <li className="flex items-start gap-2 text-sm text-slate-700 font-bold">
                                                        <FaRocket className="text-sky-600 mt-1 shrink-0" size={14} />
                                                        <span>Fast Pickup (1-2 days)</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-slate-700 font-bold">
                                                        <FaCheck className="text-sky-600 mt-1 shrink-0" size={14} />
                                                        <span>First-In-Line Dispatch <span className="block text-xs font-normal text-slate-500">Usually same day assignment</span></span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-slate-700 font-bold">
                                                        <FaHeadset className="text-sky-600 mt-1 shrink-0" size={14} />
                                                        <span>VIP 24/7 Support</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                                        <FaCheck className="text-slate-400 mt-1 shrink-0" size={14} />
                                                        <span>Standard Card Processing</span>
                                                    </li>
                                                </div>
                                            </div>

                                            {/* Due Today Box */}
                                            <div className="bg-sky-50 rounded-xl p-5 border border-sky-100 min-w-[140px] text-center shrink-0">
                                                <p className="text-[10px] font-bold text-sky-800 uppercase tracking-widest mb-1">Due Today</p>
                                                <p className="text-3xl font-black text-sky-600 mb-1">$0</p>
                                                <p className="text-[10px] text-sky-700">Pay later</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Economy Service */}
                                <div
                                    onClick={() => setSelectedOption('discounted')}
                                    className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden ${selectedOption === 'discounted'
                                            ? 'border-emerald-500 bg-white ring-4 ring-emerald-50 shadow-lg'
                                            : 'border-slate-200 bg-white hover:border-emerald-200'
                                        }`}
                                >
                                    {selectedOption === 'discounted' && (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                                            <FaTag className="text-white" /> Money Saver
                                        </div>
                                    )}

                                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-700">Economy Service</h3>
                                                {selectedOption === 'discounted' && <FaCheck className="text-emerald-500" />}
                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide">Save ${savings.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-3xl font-bold text-slate-700">${prices.discounted.toFixed(2)}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3">Flexible option for maximum savings.</p>

                                            <div className="flex flex-wrap gap-4">
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded">
                                                    <FaClock className="text-slate-400" /> Flexible Pickup (1-5 days)
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded">
                                                    <FaCheck className="text-slate-400" /> Discounted Cash Price
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="bg-amber-50 rounded-2xl p-8 text-center text-amber-800 border border-amber-100">
                                <FaInfoCircle className="mx-auto text-3xl mb-3 opacity-50" />
                                <p className="font-medium text-lg">We couldn't generate an instant quote.</p>
                                <p className="text-sm mt-2 opacity-75">Please contact support for a custom Price.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Summary & CTA */}
                <div className="lg:col-span-4 space-y-6">

                    {/* CTA Box (Brand Blue Button) */}
                    <div className="bg-white rounded-3xl shadow-lg shadow-sky-900/5 border border-slate-100 p-6 md:p-8 sticky top-24">
                        <div className="text-center mb-6">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Estimated</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tight">
                                ${prices ? (selectedOption === 'discounted' ? prices.discounted.toFixed(0) : prices.normal.toFixed(0)) : '---'}
                            </p>
                            {selectedOption === 'discounted' && prices && (
                                <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">
                                    Savings Applied
                                </span>
                            )}
                            {selectedOption === 'regular' && prices && (
                                <span className="inline-block mt-2 bg-sky-100 text-sky-700 text-xs font-bold px-2 py-1 rounded-lg">
                                    Priority Service
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500">Service Class</span>
                                <span className="font-medium text-slate-900">{selectedOption === 'regular' ? 'Priority / Fast' : 'Economy / Flexible'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500">Insurance</span>
                                <span className="font-medium text-emerald-600">Included</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500">Due Today</span>
                                <span className="font-medium text-slate-900">$0.00</span>
                            </div>
                        </div>

                        <button
                            onClick={handleVerifyCard}
                            disabled={!quoteUrl || loading}
                            className="w-full h-14 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg shadow-xl shadow-sky-600/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <FaCreditCard className="text-sky-200 group-hover:text-white transition-colors" />
                            <span>Verify Card Info</span>
                        </button>

                        <p className="text-xs text-center text-slate-400 mt-4 leading-relaxed">
                            No payment is required today. We only verify your card to secure your spot.
                        </p>

                        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center text-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-1"><FaShieldAlt size={14} /></div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase">Insured</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-1"><FaCheck size={14} /></div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase">Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile Bottom Bar (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50 lg:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                        <p className="text-2xl font-black text-slate-900">${prices ? (selectedOption === 'discounted' ? prices.discounted.toFixed(0) : prices.normal.toFixed(0)) : '---'}</p>
                    </div>
                    <button
                        onClick={handleVerifyCard}
                        disabled={!quoteUrl || loading}
                        className="flex-1 h-12 rounded-full bg-sky-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                    >
                        Verify Card <FaArrowRight size={12} className="opacity-50" />
                    </button>
                </div>
            </div>
            <div className="h-24 lg:hidden"></div>

        </div>
    );
}
