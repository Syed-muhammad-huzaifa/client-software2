"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Share2,
  ShoppingCart,
  FileDown,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";
import { Poppins } from "next/font/google";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ========= COMPANY CONFIG ========= */
const COMPANY = {
  name: "QURESHI SOFT SYSTEM",
  tagline: "Fast, reliable pharmaceutical distribution",
  whatsappNumber: "0321-8004275",
  phone: "0321-8004275",
  email: "amjadqureshi@yahoo.com",
  addressShort: "Quetta, Pakistan",
  addressFull: "Resani center zarghoon road quetta, pakistan",
  whatsappCountryCode: "92",
};

/* ========= CONSTANTS ========= */
// Render Bismillah using Unicode escapes so builds never choke on file encodings
const BISMILLAH =
  "\u0628\u0633\u0645\u0020\u0627\u0644\u0644\u0647\u0020\u0627\u0644\u0631\u062D\u0645\u0646\u0020\u0627\u0644\u0631\u062D\u064A\u0645";

/* ========= TYPES ========= */
type Product = {
  id: string;
  itemCode: string;
  companyName: string;
  productName: string;
  available: boolean;
  price: number;
  offerPct?: number;
  createdAt: string;
};

type CartLine = {
  id: string;
  companyName: string; // kept for app state, but not shown in PDF table anymore
  itemCode: string;
  productName: string;
  qty: number;
  price: number;
  offerPct?: number;
};

/* ========= HELPERS ========= */
function pkr(n: number) {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rs ${Math.round(n).toLocaleString()}`;
  }
}
function net(price: number, offer?: number) {
  return typeof offer === "number" && offer > 0
    ? Math.max(0, Math.round(price * (1 - offer / 100)))
    : price;
}
function digitsOnly(s: string) {
  return Array.from(s).filter((c) => c >= "0" && c <= "9").join("");
}
function formatPhoneForWa(raw: string, cc: string) {
  const d = digitsOnly(raw);
  const dcc = digitsOnly(cc || "");
  if (!dcc) return d;
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return dcc + d.slice(1);
  if (d.startsWith(dcc)) return d;
  if (d.length >= 9 && d.length <= 11) return dcc + d;
  return d;
}
function safeFileNameFromCompany(name: string) {
  return name.trim().split(" ").filter(Boolean).join("_");
}
function orderNo() {
  const d = new Date();
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `OL-${d.getFullYear().toString().slice(2)}${pad(d.getMonth() + 1)}${pad(
    d.getDate()
  )}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
function buildWhatsAppMinimal(lines: CartLine[]) {
  const id = orderNo();
  const d = new Date();
  let grand = 0;
  const itemLines = lines
    .filter((l) => l.qty > 0)
    .map((l) => {
      const unit = net(l.price, l.offerPct);
      const sub = unit * l.qty;
      grand += sub;
      return `${l.itemCode} - ${l.productName}\n  Qty: ${l.qty}  TP: ${pkr(unit)}  Sub: ${pkr(sub)}`;
    });

  const header = `${COMPANY.name}\nINVOICE: ${id}\nDATE: ${d.toLocaleDateString()}\n\n`;
  const body = itemLines.length ? itemLines.join("\n\n") : "-";
  const footer = `\n\n--------------------------------\nGRAND TOTAL: ${pkr(grand)}\n${
    COMPANY.phone ? `Phone: ${COMPANY.phone}\n` : ""
  }`;

  return header + body + footer;
}

/* ========= SMALL UI PARTS ========= */
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-700 ring-1 ring-inset ring-sky-200">
    {children}
  </span>
);

function QtyInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(9999, Math.floor(n || 0)));
  const inc = () => {
    const next = clamp((value || 0) + 1);
    onChange(next);
  };
  const dec = () => {
    const next = clamp((value || 0) - 1);
    onChange(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.currentTarget.value);
    const next = clamp(v);
    onChange(next);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={dec}
        aria-label={`Decrease ${label}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-400 to-sky-500 text-white shadow-sm transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        min={0}
        max={9999}
        step={1}
        aria-label={label}
        value={Number.isFinite(value) ? value : 0}
        onChange={handleChange}
        className="w-16 rounded-xl border border-sky-200 bg-white px-2 py-2 text-center text-sm font-semibold text-slate-700 shadow-inner outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        placeholder="0"
      />
      <button
        type="button"
        onClick={inc}
        aria-label={`Increase ${label}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-400 to-sky-500 text-white shadow-sm transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
      >
        <Plus className="h-4 w-4" />
      </button>

      <style jsx global>{`
        input[type="number"] {
          appearance: textfield;
          -moz-appearance: textfield;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

/* ========= HEADER ========= */
function CompanyHeader({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  const [typedName, setTypedName] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const hasTyped = useRef(false);

  useEffect(() => {
    if (hasTyped.current) return;
    hasTyped.current = true;
    const full = COMPANY.name;
    let index = 0;
    setTypedName("");
    const interval = window.setInterval(() => {
      index += 1;
      setTypedName(full.slice(0, index));
      if (index >= full.length) {
        window.clearInterval(interval);
      }
    }, 120);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-sky-50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                {BISMILLAH}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <h1 className="bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500 bg-clip-text text-3xl font-black tracking-[0.2em] text-transparent drop-shadow-[0_0_20px_rgba(14,165,233,0.35)] sm:text-4xl">
                  {typedName}
                </h1>
                {cursorVisible && (
                  <span className="inline-block h-6 w-[3px] animate-pulse bg-sky-400" aria-hidden />
                )}
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
                <MapPin className="h-3.5 w-3.5 text-sky-500" />
                {COMPANY.addressShort}
              </div>
            </div>
            <div className="w-full max-w-sm sm:max-w-md">
              <label className="sr-only" htmlFor="catalog-search">
                Search catalogue
              </label>
              <div className="relative rounded-2xl border border-slate-200 bg-white px-4 py-2 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
                <input
                  id="catalog-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search product, code or company"
                  className="w-full rounded-lg bg-transparent pl-10 pr-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ========= FOOTER ========= */
function CompanyFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 gap-6 text-sm text-slate-600 md:grid-cols-3">
        <div className="space-y-1">
          <div className="font-semibold tracking-wide text-slate-800">{COMPANY.name}</div>
          <div className="text-slate-500">{COMPANY.tagline}</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 break-words">
            <MessageCircle className="h-4 w-4 mt-0.5 text-slate-400" />
            <span>WhatsApp: {COMPANY.whatsappNumber}</span>
          </div>
          <div className="flex items-start gap-2 break-words">
            <Phone className="h-4 w-4 mt-0.5 text-slate-400" />
            <span>{COMPANY.phone}</span>
          </div>
          <div className="flex items-start gap-2 break-words">
            <Mail className="h-4 w-4 mt-0.5 text-slate-400" />
            <span className="break-words">{COMPANY.email}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 break-words">
            <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
            <span className="break-words text-slate-500">{COMPANY.addressFull}</span>
          </div>
        </div>
        <div className="md:col-span-3 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


/* ========= CART SUMMARY ========= */
function CartSummary({
  count,
  onWhatsApp,
  onDownloadPDF,
  onClearCart,
  customerName,
  setCustomerName,
  delta,
}: {
  count: number;
  onWhatsApp: () => void;
  onDownloadPDF: () => void;
  onClearCart: () => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  delta: number;
}) {
  return (
    <section className="mx-auto mt-12 max-w-7xl px-4 pb-2">
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white/90 px-5 py-6 shadow-lg shadow-sky-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-100 via-indigo-100 to-cyan-100 shadow-inner">
              <ShoppingCart className="h-5 w-5 text-sky-500" />
              {delta !== 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
            </div>
            <div className="text-sm">
              <div className="text-base font-semibold text-slate-800">
                {count} item{count === 1 ? "" : "s"} in invoice
              </div>
              <div className="text-xs text-slate-500">Add a customer name to personalise the PDF.</div>
            </div>
          </div>
          <div className="w-full sm:ml-auto sm:w-72">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-inner outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={onDownloadPDF}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            title="Download invoice PDF"
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
          <button
            onClick={onWhatsApp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            title="Share invoice"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            onClick={onClearCart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-slate-600"
            title="Clear all quantities"
          >
            <Trash2 className="h-4 w-4" /> Clear cart
          </button>
        </div>
      </div>
    </section>
  );
}

/* ========= MAIN PAGE ========= */
export default function OfferList() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [cartDelta, setCartDelta] = useState(0);

  // off-screen invoice node (pure inline CSS; black & white)
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  /* Load API data from dashboard */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = (await res.json()) as Product[];
        setProducts(
          Array.isArray(data)
            ? data
                .filter((p) => p.available)
                .sort(
                  (a, b) =>
                    a.companyName.localeCompare(b.companyName) ||
                    a.itemCode.localeCompare(b.itemCode) ||
                    a.productName.localeCompare(b.productName)
                )
            : []
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Restore/save cart + customer name */
  useEffect(() => {
    const prev = window.localStorage.getItem("offer-quantities");
    if (prev) setQuantities(JSON.parse(prev));
    const prevName = window.localStorage.getItem("offer-customer-name");
    if (prevName) setCustomerName(prevName);
  }, []);
  useEffect(() => {
    window.localStorage.setItem("offer-quantities", JSON.stringify(quantities));
  }, [quantities]);
  useEffect(() => {
    window.localStorage.setItem("offer-customer-name", customerName);
  }, [customerName]);

  /* Grouped list + search */
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? products
      : products.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.itemCode.toLowerCase().includes(q)
      );
    const g: Record<string, Product[]> = {};
    for (const p of list) (g[p.companyName] ||= []).push(p);
    return g;
  }, [products, query]);

  /* Cart-only lines */
  const cartLines: CartLine[] = useMemo(() => {
    const ls: CartLine[] = [];
    for (const p of products) {
      const qty = quantities[p.id] || 0;
      if (qty > 0)
        ls.push({
          id: p.id,
          companyName: p.companyName,
          itemCode: p.itemCode,
          productName: p.productName,
          qty,
          price: p.price,
          offerPct: p.offerPct,
        });
    }
    return ls;
  }, [products, quantities]);

  // total qty for cart + delta animation
  const totalQty = useMemo(
    () => cartLines.reduce((s, l) => s + l.qty, 0),
    [cartLines]
  );

  // delta anim (no missing-deps warning pattern)
  const prevTotalRef = useRef(totalQty);
  useEffect(() => {
    const prev = prevTotalRef.current;
    const d = totalQty - prev;
    prevTotalRef.current = totalQty;
    if (d !== 0) {
      setCartDelta(d);
      const t = window.setTimeout(() => setCartDelta(0), 700);
      return () => window.clearTimeout(t);
    }
  }, [totalQty]);

  function setQty(id: string, qty: number) {
    const clean = Math.max(0, Math.min(9999, Math.floor(qty || 0)));
    setQuantities((q) => ({ ...q, [id]: clean }));
  }

  function clearCart() {
    setQuantities({});
  }

  /* ===== PDF (B/W, off-screen invoice ONLY) ===== */
  async function generatePDFBlob(): Promise<Blob | null> {
    const node = invoiceRef.current;
    if (!node) return null;

    // ensure visible off-screen for html2canvas; keep pure B/W
    const prevVis = node.style.visibility;
    const prevPos = node.style.position;
    const prevLeft = node.style.left;
    node.style.visibility = "visible";
    node.style.position = "fixed";
    node.style.left = "-10000px";

    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      let y = 0;
      pdf.addImage(img, "PNG", 0, y, imgW, imgH);
      let left = imgH - pageH;
      while (left > 0) {
        pdf.addPage();
        y -= pageH;
        pdf.addImage(img, "PNG", 0, y, imgW, imgH);
        left -= pageH;
      }
      return pdf.output("blob");
    } catch {
      return null;
    } finally {
      node.style.visibility = prevVis;
      node.style.position = prevPos;
      node.style.left = prevLeft;
    }
  }

  // Download button
  async function handleDownloadPDF() {
    if (cartLines.length === 0) return;
    const blob = await generatePDFBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFileNameFromCompany(COMPANY.name)}_Invoice_${orderNo()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Try to share PDF; fallback to WhatsApp text */
  async function handleWhatsApp() {
    const number = formatPhoneForWa(COMPANY.whatsappNumber, COMPANY.whatsappCountryCode);

    if (cartLines.length > 0) {
      const blob = await generatePDFBlob();
      if (blob) {
        try {
          const file = new File(
            [blob],
            `${safeFileNameFromCompany(COMPANY.name)}_Invoice_${orderNo()}.pdf`,
            { type: "application/pdf" }
          );

          type NavigatorWithShare = Navigator & {
            canShare?: (data?: ShareData) => boolean;
            share?: (data: ShareData) => Promise<void>;
          };
          const nav: NavigatorWithShare = navigator;

          const shareData: ShareData = {
            title: "Invoice",
            text: `${COMPANY.name} - Order Invoice`,
            files: [file] as File[],
          };

          if (nav.canShare && nav.share && nav.canShare(shareData)) {
            await nav.share(shareData);
            return;
          }
        } catch {
          // fall back to text
        }
      }
    }

    const text = buildWhatsAppMinimal(cartLines);
    const waMe = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    const waScheme = `whatsapp://send?phone=${number}&text=${encodeURIComponent(text)}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = waScheme;
      setTimeout(() => window.open(waMe, "_blank"), 700);
    } else {
      window.open(waMe, "_blank");
    }
  }

  // tiny dev self-checks
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    (function test_buildWhatsAppMinimal() {
      const lines: CartLine[] = [
        {
          id: "1",
          companyName: "X",
          itemCode: "X-A",
          productName: "Item A",
          qty: 2,
          price: 100,
          offerPct: 10,
        },
        {
          id: "2",
          companyName: "X",
          itemCode: "X-B",
          productName: "Item B",
          qty: 1,
          price: 50,
        },
      ];
      const t = buildWhatsAppMinimal(lines);
      console.assert(t.includes("INVOICE:"), "Invoice header missing");
      console.assert(t.includes("GRAND TOTAL"), "Grand total missing");
    })();
  }

  return (
    <div className={`${poppins.className} min-h-screen bg-slate-50 text-slate-700`}>
      <CompanyHeader query={query} setQuery={setQuery} />

      <main id="catalog" className="mx-auto max-w-7xl px-4 pb-12 pt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">Live Catalogue</h2>
            <p className="text-sm text-slate-500">
              Set precise quantities per SKU and generate instant invoices.
            </p>
          </div>
          <Pill>REAL-TIME SYNCED</Pill>
        </div>
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-5 w-40 rounded-full bg-slate-100" />
                <div className="mt-4 h-40 rounded-2xl bg-slate-50" />
              </div>
            ))}
          </div>
        ) : Object.keys(groups).length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            No products available right now.
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groups).map(([company, list]) => (
              <section key={company} className="space-y-4">
                <div className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                  {company}
                </div>
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-sky-50">
                  <div className="overflow-x-auto">
                    <table className="min-w-[720px] w-full border-collapse text-left text-sm text-slate-600">
                      <thead className="sticky top-0 bg-gradient-to-r from-sky-100 via-indigo-100 to-cyan-100 text-slate-600">
                        <tr>
                          {["Item Code", "Product Name", "Price", "Quantity", "Offer"].map((label) => (
                            <th
                              key={label}
                              className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em]"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((p, idx) => {
                          const qty = quantities[p.id] || 0;
                          const zebra = idx % 2 === 0 ? "bg-white" : "bg-slate-50/60";
                          return (
                            <tr
                              key={p.id}
                              className={`${zebra} transition hover:bg-sky-50`}
                            >
                              <td className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                                {p.itemCode}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                {p.productName}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                {pkr(p.price)}
                              </td>
                              <td className="px-6 py-4">
                                <QtyInput
                                  value={qty}
                                  onChange={(n) => setQty(p.id, n)}
                                  label={`Quantity for ${p.productName}`}
                                />
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                {p.offerPct ? `${p.offerPct}%` : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        <CartSummary
          count={totalQty}
          onWhatsApp={handleWhatsApp}
          onDownloadPDF={handleDownloadPDF}
          onClearCart={clearCart}
          customerName={customerName}
          setCustomerName={setCustomerName}
          delta={cartDelta}
        />
      </main>

      <CompanyFooter />

      {/* ====== OFF-SCREEN INVOICE (B/W, inline styles only) ====== */}
      <div
        ref={invoiceRef}
        aria-hidden
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "794px", // ~A4 width at 96dpi
          background: "#ffffff",
          padding: "32px",
          color: "#000000",
          fontFamily:
            "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,Ubuntu,Segoe UI Emoji,Segoe UI Symbol",
        }}
      >
        {/* Top heading (keep as is) */}
        <h1
          style={{
            textAlign: "center",
            fontSize: 22,
            fontWeight: 800,
            color: "#000000",
            margin: 0,
            marginBottom: 10,
          }}
        >
          {COMPANY.name}
        </h1>

        {/* Bigger, clearer meta row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 14,            // larger & clearer
            fontWeight: 700,         // bold
            marginBottom: 14,
          }}
        >
          <div>INVOICE # {orderNo()}</div>
          <div>DATE {new Date().toLocaleDateString()}</div>
          <div>CUSTOMER {customerName || "-"}</div>
        </div>

        {/* Flat table: ITEM NAME | QTY | TOTAL PRICE */}
        {cartLines.length === 0 ? (
          <div style={{ textAlign: "center", color: "#000000" }}>No items.</div>
        ) : (
          (() => {
            let grand = 0;
            return (
              <div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  <thead>
                    <tr>
                      {["ITEM NAME", "QTY", "TOTAL PRICE"].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            border: "1px solid #000000",
                            textAlign: i === 0 ? "left" : i === 1 ? "center" : "right",
                            padding: "8px 10px",
                            fontWeight: 800,
                            background: "#ffffff",
                            color: "#000000",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cartLines.map((l) => {
                      const total = net(l.price, l.offerPct) * l.qty;
                      grand += total;
                      return (
                        <tr key={l.id}>
                          <td style={{ border: "1px solid #000000", padding: "8px 10px" }}>
                            {l.itemCode} - {l.productName}
                          </td>
                          <td style={{ border: "1px solid #000000", textAlign: "center", padding: "8px 10px" }}>
                            {l.qty}
                          </td>
                          <td style={{ border: "1px solid #000000", textAlign: "right", padding: "8px 10px" }}>
                            {pkr(total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Grand total (bold & clear) */}
                <div
                  style={{
                    textAlign: "right",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#000000",
                  }}
                >
                  Grand Total: {pkr(grand)}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

