import { useEffect, useMemo, useState } from "react";
import Tooltip from "../TooltipReact";
import { getLead } from "../../services/localStorage";
import { distanceForLocations, estimateTransitDays, formatKm, formatMiles } from "../../services/distance";
import { format, parse } from "date-fns";

type Vehicle = {
  vehicle_model_year?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_inop?: string; // '0' running, '1' not running
};

type Lead = {
  origin_city?: string;
  destination_city?: string;
  transport_type?: string; // '1' open, '2' enclosed
  ship_date?: string; // MM/dd/yyyy
  Vehicles?: Vehicle[];
};

function safeParseDate(input?: string): Date | null {
  if (!input) return null;
  // Expecting MM/dd/yyyy (from quote form)
  try {
    const d = parse(input, "MM/dd/yyyy", new Date());
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

function formatLongDate(input?: string): string {
  const d = safeParseDate(input);
  return d ? format(d, "MMMM d, yyyy") : "";
}

function summarizeVehicles(vehicles?: Vehicle[]): { label: string; condition: string } {
  if (!vehicles || !vehicles.length) return { label: "", condition: "" };
  const first = vehicles[0];
  const name = [first.vehicle_model_year, first.vehicle_make, first.vehicle_model]
    .filter(Boolean)
    .join(" ");
  const extra = vehicles.length > 1 ? ` + ${vehicles.length - 1} more` : "";
  const allRunning = vehicles.every((v) => (v.vehicle_inop ?? "0") === "0");
  const condition = allRunning ? "Running" : "Not Running";
  return { label: `${name}${extra}`, condition };
}

export default function QuoteDetails() {
  const [lead, setLead] = useState<Lead | null>(null);
  const [distanceMi, setDistanceMi] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loadingDist, setLoadingDist] = useState(false);

  useEffect(() => {
    // Read once on mount; /quote2 is client-only for this part
    const data = getLead();
    setLead(data ?? null);
  }, []);

  const { vehicleText, conditionText } = useMemo(() => {
    const vs = summarizeVehicles(lead?.Vehicles);
    return { vehicleText: vs.label, conditionText: vs.condition };
  }, [lead]);

  useEffect(() => {
    const origin = lead?.origin_city?.trim();
    const dest = lead?.destination_city?.trim();
    if (!origin || !dest) {
      setDistanceMi(null);
      setDistanceKm(null);
      return;
    }
    let mounted = true;
    setLoadingDist(true);
    distanceForLocations(origin, dest)
      .then((res) => {
        if (!mounted) return;
        setDistanceMi(res.miles ?? null);
        setDistanceKm(res.kilometers ?? null);
      })
      .finally(() => mounted && setLoadingDist(false));
    return () => {
      mounted = false;
    };
  }, [lead?.origin_city, lead?.destination_city]);

  const transportType = lead?.transport_type === "2" ? "Enclosed Transport" : lead?.transport_type ? "Open Transport" : "";
  const shipDate = formatLongDate(lead?.ship_date);
  const transit = estimateTransitDays(distanceMi);

  // If no data, show empty fields as requested
  const originLabel = lead?.origin_city ?? "";
  const destinationLabel = lead?.destination_city ?? "";

  return (
    <>
      {/* Shipment Overview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Shipment Overview</h2>
          <div className="inline-flex items-baseline gap-2 rounded-md bg-slate-50 border border-slate-200 px-3 py-1.5 text-sm">
            {/* Order ID component remains in page header */}
            <span className="text-slate-600">Details</span>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4 text-center">
            <div className="w-full">
              <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                Origin
                <Tooltip label="Pick-up location for your vehicle." position="top" />
              </p>
              <p className="font-semibold text-slate-700">{originLabel}</p>
            </div>
            {/* Colorful route indicator (orange to green) */}
            <div className="flex items-center w-28 sm:w-36 md:w-48 lg:w-56 xl:w-64 gap-2 shrink-0" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,.2)]" />
              <span className="h-1 w-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.2)]" />
            </div>
            <div className="w-full">
              <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                Destination
                <Tooltip label="Drop-off location for your vehicle." position="top" />
              </p>
              <p className="font-semibold text-slate-700">{destinationLabel}</p>
            </div>
          </div>

          {/* Distance row */}
          <div className="mt-1 text-center text-sm text-slate-600">
            {loadingDist ? (
              <span>Calculating distance…</span>
            ) : distanceMi ? (
              <span>
                <span className="inline-flex items-center gap-1">
                  Distance
                  <Tooltip label="Approximate driving distance between origin and destination." position="top" />
                </span>: <span className="font-semibold text-slate-800">{formatMiles(distanceMi, 0)}</span>
                {" "}
                <span className="text-slate-400">({formatKm(distanceKm, 0)})</span>
              </span>
            ) : (
              <span>
                <span className="inline-flex items-center gap-1">
                  Distance <Tooltip label="We’ll show distance once both locations are available." position="top" />
                </span>: —
              </span>
            )}
          </div>

          <div className="border-t border-slate-200 my-4" />
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 inline-flex items-center gap-1">
                Vehicle
                <Tooltip label="The main vehicle you’re shipping. If you entered multiple, we show the first plus a count." position="top" />
              </p>
              <p className="font-semibold text-slate-700">{vehicleText}</p>
            </div>
            <div>
              <p className="text-slate-500 inline-flex items-center gap-1">
                First Available Date
                <Tooltip label="The earliest date you’re ready for pick-up. We’ll aim to assign a carrier around this date." position="top" />
              </p>
              <p className="font-semibold text-slate-700">{shipDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-6">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Service Details</h2>
        </div>
        <ul className="divide-y divide-slate-200 text-sm">
          <li className="px-5 py-4 flex justify-between items-center">
            <span className="text-slate-600 inline-flex items-center gap-1">
              Transport Type
              <Tooltip label="Open is most common and budget-friendly. Enclosed offers extra protection for luxury or classic cars." position="top" />
            </span>
            <span className="font-semibold text-slate-800 bg-sky-50 text-sky-700 px-2 py-1 rounded-md">{transportType}</span>
          </li>
          <li className="px-5 py-4 flex justify-between items-center">
            <span className="text-slate-600 inline-flex items-center gap-1">
              Vehicle Condition
              <Tooltip label="Running vehicles can be driven onto the trailer. Not running requires special equipment." position="top" />
            </span>
            <span className="font-semibold text-slate-800">{conditionText}</span>
          </li>
          <li className="px-5 py-4 flex justify-between items-center">
            <span className="text-slate-600 inline-flex items-center gap-1">
              Service Type
              <Tooltip label="Door-to-door means pick-up and delivery as close to your addresses as safely and legally possible." position="top" />
            </span>
            <span className="font-semibold text-slate-800">Door-to-Door</span>
          </li>
          <li className="px-5 py-4 flex justify-between items-center">
            <span className="text-slate-600 inline-flex items-center gap-1">
              Insurance
              <Tooltip label="Carrier cargo insurance is included. You’ll receive the carrier’s insurance details when assigned." position="top" />
            </span>
            <span className="font-semibold text-emerald-600">Fully Included</span>
          </li>
          <li className="px-5 py-4 flex justify-between items-center">
            <span className="text-slate-600 inline-flex items-center gap-1">
              Estimated Transit Time
              <Tooltip label="Typical time on the road once picked up. Actual timing may vary with route and traffic." position="top" />
            </span>
            <span className="font-semibold text-slate-800">{transit ?? ""}</span>
          </li>
          <li className="px-5 py-4 flex justify-between items-center">
            <span className="text-slate-600 inline-flex items-center gap-1">
              Distance
              <Tooltip label="We show both miles and kilometers for convenience." position="top" />
            </span>
            <span className="font-semibold text-slate-800">{distanceMi ? formatMiles(distanceMi, 0) : ""}</span>
          </li>
        </ul>
      </div>
    </>
  );
}
