import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ChevronDown, X } from "lucide-react";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "BUY" | "SELL" | null;
  symbol?: string;
  instrumentKey?: string;
  series?: string;
}

type ProductType = "MIS" | "CNC";
type OrderType = "MARKET" | "LIMIT" | "SL" | "SL-M";

export default function OrderModal({
  isOpen,
  onClose,
  type,
  symbol,
  instrumentKey,
  series,
}: OrderModalProps) {
  const [productType, setProductType] = useState<ProductType>("MIS");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [qty, setQty] = useState<number>(65);
  const [price, setPrice] = useState<number>(23297.4);
  const [strategy, setStrategy] = useState<string>("All Strategies");
  const [advanced, setAdvanced] = useState<boolean>(false);
  const [triggerPrice, setTriggerPrice] = useState<number | "">("");
  const [disclosedQty, setDisclosedQty] = useState<number | "">("");

  const isBuy = type === "BUY";

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setProductType("MIS");
    setOrderType("MARKET");
    setQty(65);
    setPrice(23297.4);
    setStrategy("All Strategies");
    setAdvanced(false);
    setTriggerPrice("");
    setDisclosedQty("");
  }, [isOpen, type, symbol]);

  const total = useMemo(() => {
    const q = Number(qty || 0);
    const p = Number(price || 0);
    return q * p;
  }, [qty, price]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-3">
        <div className="w-full max-w-[640px] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          {/* Header */}
          <div
            className={`flex items-start justify-between px-4 py-3 text-white ${
              isBuy ? "bg-[#4181E0]" : "bg-[#F55A1F]"
            }`}
          >
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold uppercase leading-tight">
                {symbol || "NIFTY 30MAR2026"}
              </h2>
              <p className="mt-1 text-[12px] font-medium opacity-95">
                NSE ₹4,134.00
              </p>
            </div>

            <div className="flex items-center gap-2 ml-3">
              {/* Toggle */}
              <button
                type="button"
                className={`relative h-6 w-11 rounded-full transition ${
                  isBuy ? "bg-white/25" : "bg-white/25"
                }`}
              >
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="rounded p-1.5 hover:bg-white/10 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-[#FAFAFA] px-4 py-4">
            {/* Row 1 */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              {/* Product Type */}
              <div className="flex gap-8">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-1.5 text-[14px] text-neutral-700">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === "MIS"}
                      onChange={() => setProductType("MIS")}
                      className="h-3.5 w-3.5 accent-blue-600"
                    />
                    <span>Intraday</span>
                  </div>
                  <div className="ml-5 mt-0.5 text-[12px] text-neutral-600">
                    MIS
                  </div>
                </label>

                <label className="cursor-pointer">
                  <div className="flex items-center gap-1.5 text-[14px] text-neutral-700">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === "CNC"}
                      onChange={() => setProductType("CNC")}
                      className="h-3.5 w-3.5 accent-blue-600"
                    />
                    <span>Longterm</span>
                  </div>
                  <div className="ml-5 mt-0.5 text-[12px] text-neutral-600">
                    CNC
                  </div>
                </label>
              </div>

              {/* Strategy + Advanced */}
              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="min-w-[220px] appearance-none rounded border border-neutral-300 bg-white px-3 py-2 pr-9 text-[14px] text-neutral-700 outline-none focus:border-neutral-400"
                  >
                    <option>All Strategies</option>
                    <option>Strategy 1</option>
                    <option>Strategy 2</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600"
                  />
                </div>

                <button
                  onClick={() => setAdvanced((prev) => !prev)}
                  className={`text-[13px] font-medium ${
                    isBuy ? "text-[#4181E0]" : "text-[#F55A1F]"
                  }`}
                >
                  Advanced{" "}
                  <span className="inline-block">{advanced ? "▲" : "▼"}</span>
                </button>
              </div>
            </div>

            {/* Qty Price Total */}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Qty.">
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="h-[46px] w-full border border-neutral-300 bg-white px-3 text-[16px] font-medium text-neutral-800 outline-none focus:border-neutral-400"
                />
              </Field>

              <Field label="Price">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={orderType === "MARKET" || orderType === "SL-M"}
                  className={`h-[46px] w-full border border-neutral-300 px-3 text-[16px] font-medium text-neutral-800 outline-none focus:border-neutral-400 ${
                    orderType === "MARKET" || orderType === "SL-M"
                      ? "bg-[#E9ECEF] text-neutral-500"
                      : "bg-white"
                  }`}
                />
              </Field>

              <Field label="Total">
                <input
                  type="text"
                  readOnly
                  value={Number.isFinite(total) ? total.toFixed(1) : "0.0"}
                  className="h-[46px] w-full border border-neutral-300 bg-white px-3 text-[16px] font-medium text-neutral-800 outline-none"
                />
              </Field>
            </div>

            {/* Order Type */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 px-0.5">
              <div className="flex items-center gap-5">
                <RadioOption
                  label="Market"
                  checked={orderType === "MARKET"}
                  onChange={() => setOrderType("MARKET")}
                  active
                />
                <RadioOption
                  label="Limit"
                  checked={orderType === "LIMIT"}
                  onChange={() => setOrderType("LIMIT")}
                />
              </div>

              <div className="flex items-center gap-5">
                <RadioOption
                  label="SL"
                  checked={orderType === "SL"}
                  onChange={() => setOrderType("SL")}
                />
                <RadioOption
                  label="SL-M"
                  checked={orderType === "SL-M"}
                  onChange={() => setOrderType("SL-M")}
                />
              </div>
            </div>

            {/* Advanced */}
            {advanced && (
              <div className="mt-4 rounded border border-neutral-200 bg-white p-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Trigger Price" compact>
                    <input
                      type="number"
                      value={triggerPrice}
                      onChange={(e) =>
                        setTriggerPrice(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      placeholder="Enter trigger price"
                      className="h-[40px] w-full rounded border border-neutral-300 px-3 text-[14px] outline-none focus:border-neutral-400"
                    />
                  </Field>

                  <Field label="Disclosed Qty" compact>
                    <input
                      type="number"
                      value={disclosedQty}
                      onChange={(e) =>
                        setDisclosedQty(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      placeholder="Enter disclosed qty"
                      className="h-[40px] w-full rounded border border-neutral-300 px-3 text-[14px] outline-none focus:border-neutral-400"
                    />
                  </Field>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Instrument Key" compact>
                    <input
                      type="text"
                      readOnly
                      value={instrumentKey || ""}
                      className="h-[40px] w-full rounded border border-neutral-300 bg-neutral-100 px-3 text-[13px] outline-none"
                    />
                  </Field>

                  <Field label="Series" compact>
                    <input
                      type="text"
                      readOnly
                      value={series || ""}
                      className="h-[40px] w-full rounded border border-neutral-300 bg-neutral-100 px-3 text-[13px] outline-none"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 bg-[#F3F3F3] px-4 py-4">
            <button
              className={`min-w-[88px] rounded px-5 py-2.5 text-[14px] font-semibold text-white transition ${
                isBuy
                  ? "bg-[#4181E0] hover:bg-[#2f6fd0]"
                  : "bg-[#F26A4B] hover:bg-[#e55b3d]"
              }`}
            >
              {isBuy ? "Buy" : "Sell"}
            </button>

            <button
              onClick={onClose}
              className="min-w-[106px] rounded border border-neutral-400 bg-white px-5 py-2.5 text-[14px] font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  children,
  compact = false,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div>
      <label
        className={`mb-1 block text-neutral-700 ${
          compact ? "text-[12px]" : "text-[14px]"
        }`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function RadioOption({
  label,
  checked,
  onChange,
  active = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  active?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-[14px] ${
        checked || active ? "text-neutral-700" : "text-neutral-400"
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-blue-600"
      />
      <span>{label}</span>
    </label>
  );
}
