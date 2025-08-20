import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { searchZipcodes } from "../../services/zipcodes";
import type { ZipResult } from "../../services/zipcodes";

const debounce = <F extends (...args: any[]) => void>(fn: F, delay = 250) => {
    let t: any;
    return (...args: Parameters<F>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
};

type FieldNames = {
    value: string;          // campo que pintas (ej: origin_city ó un "display" combinado)
    postalCode?: string;    // opcional: p. ej. origin_postal_code
    city?: string;          // opcional: origin_city
    state?: string;         // opcional: origin_state
};

interface Props {
    fieldNames: FieldNames;
    label: string;
    placeholder: string;
    minChars?: number;
}

const ZipcodeAutocompleteRHF: React.FC<Props> = ({
    fieldNames,
    label,
    placeholder,
    minChars = 2,
}) => {
    const { control, setValue, clearErrors, formState: { errors } } = useFormContext();

    const { field } = useController({ control, name: fieldNames.value });
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ZipResult[]>([]);
    const [activeIdx, setActiveIdx] = useState(-1);
    const acRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async (q: string) => {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const data = await searchZipcodes(q, ctrl.signal).catch(() => []);
        setItems(data);
        setOpen(!!data.length);
        setActiveIdx(-1);
    }, []);

    const debouncedLoad = useMemo(() => debounce(load, 250), [load]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!acRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);


    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        // usa setValue para forzar validación en cada cambio (opcional pero útil)
        setValue(fieldNames.value, v, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

        if (v.length >= minChars) debouncedLoad(v);
        else {
            setItems([]);
            setOpen(false);
        }
    };


    const select = (it: ZipResult) => {
        // guarda el display y fuerza validación inmediata
        setValue(fieldNames.value, it.label, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

        if (fieldNames.postalCode) setValue(fieldNames.postalCode, it.zip ?? "", { shouldDirty: true });
        if (fieldNames.city) setValue(fieldNames.city, it.city ?? "", { shouldDirty: true });
        if (fieldNames.state) setValue(fieldNames.state, it.state ?? "", { shouldDirty: true });

        clearErrors(fieldNames.value); // limpia errores si había
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || !items.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => (i + 1) % items.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => (i - 1 + items.length) % items.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIdx >= 0) select(items[activeIdx]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const errMsg = (errors as any)?.[fieldNames.value]?.message as string | undefined;

    return (
        <div ref={acRef} className="relative mb-2">
            <input
                id={fieldNames.value}
                value={field.value ?? ""}
                onChange={onChange}
                onBlur={field.onBlur}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={`peer h-10 w-full border-b-2 bg-transparent text-gray-900 placeholder-transparent focus:outline-none
          ${errMsg ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                aria-autocomplete="list"
                aria-controls={`${fieldNames.value}-listbox`}
                aria-expanded={open}
                aria-invalid={!!errMsg}
            />
            <label
                htmlFor={fieldNames.value}
                className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
          peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2
          peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-btn-blue ${errMsg ? "text-red-500" : ""}`}
            >
                {label}
            </label>

            {open && items.length > 0 && (
                <div
                    id={`${fieldNames.value}-listbox`}
                    role="listbox"
                    className="absolute mt-1 bg-white w-full z-10 max-h-56 overflow-y-auto border border-gray-200 shadow-sm"
                >
                    {items.map((it, idx) => {
                        const active = idx === activeIdx;
                        return (
                            <div
                                key={`${it.city}-${it.state}-${it.zip ?? idx}`}
                                role="option"
                                aria-selected={active}
                                className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${active ? "bg-gray-100" : ""}`}
                                onMouseDown={(e) => { e.preventDefault(); select(it); }}
                                onMouseEnter={() => setActiveIdx(idx)}
                            >
                                {it.label}
                            </div>
                        );
                    })}
                </div>
            )}

            {errMsg && <p className="text-red-500 text-xs italic mt-1">{errMsg}</p>}
        </div>
    );
};

export default ZipcodeAutocompleteRHF;
