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
} from "lucide-react";
  import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
      return `${l.productName}\n  Qty: ${l.qty}  TP: ${pkr(unit)}  Sub: ${pkr(sub)}`;
    });

  const header = `${COMPANY.name}\nINVOICE: ${id}\nDATE: ${d.toLocaleDateString()}\n\n`;
  const body = itemLines.length ? itemLines.join("\n\n") : "—";
  const footer = `\n\n--------------------------------\nGRAND TOTAL: ${pkr(grand)}\n${
    COMPANY.phone ? `Phone: ${COMPANY.phone}\n` : ""
  }`;

  return header + body + footer;
}

/* ========= SMALL UI PARTS ========= */
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-inset ring-orange-200">
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
  const [delta, setDelta] = React.useState<number | null>(null);
  const [animKey, setAnimKey] = React.useState(0);
  const showDelta = (d: number) => {
    if (!d) return;
    setDelta(d);
    setAnimKey((k) => k + 1);
    window.setTimeout(() => setDelta(null), 650);
  };

  const inc = () => {
    const next = clamp((value || 0) + 1);
    showDelta(next - (value || 0));
    onChange(next);
  };
  const dec = () => {
    const next = clamp((value || 0) - 1);
    showDelta(next - (value || 0));
    onChange(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.currentTarget.value);
    const next = clamp(v);
    const d = next - (value || 0);
    if (d) showDelta(d);
    onChange(next);
  };

  return (
    <div className="relative w-20">
      {/* Inline +/− bubble */}
      <div
        key={animKey}
        className={`pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold ${
          delta ? "opacity-100" : "opacity-0"
        } transition-all duration-500`}
        style={{ transform: `translate(-50%, ${delta ? "-8px" : "0px"})` }}
      >
        {delta && (
          <span
            className={`rounded-full px-1.5 py-0.5 ring-1 ring-orange-300 ${
              delta > 0 ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700"
            }`}
          >
            {delta > 0 ? `+${delta}` : `${delta}`}
          </span>
        )}
      </div>

      <input
        type="number"
        min={0}
        max={9999}
        step={1}
        aria-label={label}
        value={Number.isFinite(value) ? value : 0}
        onChange={handleChange}
        className="w-full rounded-md border border-orange-300 bg-white pr-7 pl-2 py-1 text-center text-[13px] font-semibold text-orange-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
        placeholder="Qty"
      />

      {/* custom spinner */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 flex flex-col">
        <button
          type="button"
          onClick={inc}
          className="pointer-events-auto h-1/2 flex items-center justify-center rounded-tr-md border-l border-b border-orange-300 bg-orange-50 hover:bg-orange-100 active:bg-orange-200"
          aria-label="Increase quantity"
          tabIndex={-1}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className="fill-orange-700"><path d="M7 14l5-5 5 5z"/></svg>
        </button>
        <button
          type="button"
          onClick={dec}
          className="pointer-events-auto h-1/2 flex items-center justify-center rounded-br-md border-l border-orange-300 bg-orange-50 hover:bg-orange-100 active:bg-orange-200"
          aria-label="Decrease quantity"
          tabIndex={-1}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className="fill-orange-700"><path d="M7 10l5 5 5-5z"/></svg>
        </button>
      </div>

      <style jsx global>{`
        input[type="number"] { appearance: textfield; -moz-appearance: textfield; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
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
  return (
    <header className="sticky top-0 z-40 border-b border-orange-200 bg-white/90 backdrop-blur">
      <div className="bg-orange-50 text-orange-900">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-base sm:text-lg font-extrabold tracking-wide">
          <span>{BISMILLAH}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="text-lg sm:text-xl font-extrabold tracking-tight text-orange-900">
            {COMPANY.name}
          </div>
          <div className="sm:ml-6 text-[12px] text-orange-700">{COMPANY.tagline}</div>
          <div className="sm:ml-auto relative w-full sm:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company or item"
              className="w-full rounded-lg bg-white border border-orange-300 pl-9 pr-3 py-2 text-sm text-orange-900 placeholder-orange-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ========= FOOTER ========= */
function CompanyFooter() {
  return (
    <footer className="mt-8 border-t border-orange-200 bg-orange-50/60">
      <div className="mx-auto max-w-7xl px-4 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-orange-900">
        <div className="space-y-1">
          <div className="font-semibold break-words">{COMPANY.name}</div>
          <div className="text-orange-700 break-words">{COMPANY.tagline}</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 break-words">
            <MessageCircle className="h-4 w-4 mt-0.5 text-orange-700" />
            <span>WhatsApp: {COMPANY.whatsappNumber}</span>
          </div>
          <div className="flex items-start gap-2 break-words">
            <Phone className="h-4 w-4 mt-0.5 text-orange-700" />
            <span>{COMPANY.phone}</span>
          </div>
          <div className="flex items-start gap-2 break-words">
            <Mail className="h-4 w-4 mt-0.5 text-orange-700" />
            <span className="break-words">{COMPANY.email}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 break-words">
            <MapPin className="h-4 w-4 mt-0.5 text-orange-700" />
            <span className="break-words">{COMPANY.addressFull}</span>
          </div>
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
    <section className="mx-auto max-w-7xl px-4 pb-2 mt-5">
      <div className="rounded-2xl border border-orange-200 bg-white shadow-sm px-3 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0 grid place-items-center h-9 w-9 rounded-xl bg-orange-50 ring-1 ring-orange-200 relative">
            <ShoppingCart className="h-4 w-4 text-orange-700" />
            {delta !== 0 && (
              <span className={`absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ring-1 ring-orange-300 ${delta > 0 ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700'}`}>{delta > 0 ? `+${delta}` : delta}</span>
            )}
          </div>
          <div className="text-sm">
            <div className="font-bold leading-tight text-orange-900">
              {count} item{count === 1 ? "" : "s"} in cart
            </div>
            <div className="text-[12px] text-orange-700">Customer name is required for the PDF.</div>
          </div>
          <div className="ml-auto w-full sm:w-80 relative">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-orange-900 placeholder-orange-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={onWhatsApp}
            className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition px-3 py-2 text-sm font-semibold inline-flex items-center justify-center gap-2 text-white"
            title="Share invoice via WhatsApp (PDF when possible)"
          >
            <Share2 className="h-4 w-4" /> WhatsApp Invoice
          </button>
          <button
            onClick={onDownloadPDF}
            className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition px-3 py-2 text-sm font-semibold inline-flex items-center justify-center gap-2 text-white"
            title="Download invoice PDF"
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
          <button
            onClick={onClearCart}
            className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm font-semibold inline-flex items-center justify-center gap-2 text-orange-800 hover:bg-orange-50 active:bg-orange-100"
            title="Clear all quantities"
          >
            <Trash2 className="h-4 w-4" /> Clear Cart
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
            p.companyName.toLowerCase().includes(q)
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
            text: `${COMPANY.name} — Order Invoice`,
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
        { id: "1", companyName: "X", productName: "Item A", qty: 2, price: 100, offerPct: 10 },
        { id: "2", companyName: "X", productName: "Item B", qty: 1, price: 50 },
      ];
      const t = buildWhatsAppMinimal(lines);
      console.assert(t.includes("INVOICE:"), "Invoice header missing");
      console.assert(t.includes("GRAND TOTAL"), "Grand total missing");
    })();
  }

  return (
    <div className="min-h-screen bg-white text-orange-900">
      <CompanyHeader query={query} setQuery={setQuery} />

      <main className="mx-auto max-w-7xl px-4 py-4">
        {/* GROUPED TABLE (compact rows) */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, gi) => (
              <div key={gi} className="rounded-2xl border border-orange-200 bg-white shadow-sm">
                <div className="px-3 py-2 font-semibold text-orange-900 border-b border-orange-200">Loading…</div>
                <ul className="divide-y divide-orange-100">
                  {[...Array(4)].map((_, i) => (
                    <li key={i} className="h-10 px-3 animate-pulse" />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : Object.keys(groups).length === 0 ? (
          <div className="rounded-2xl border border-orange-200 bg-white p-6 text-center text-orange-700">No products available.</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groups).map(([company, list]) => (
              <section key={company} className="rounded-2xl border border-orange-200 bg-white shadow-sm">
                {/* Company heading */}
                <div className="px-3 py-2 flex items-center gap-2 border-b border-orange-200">
                  <span className="font-bold text-orange-900">{company}</span>
                  <Pill>Items: {list.length}</Pill>
                </div>

                {/* Column headings */}
                <div className="px-3 py-1 text-[11px] font-bold text-orange-900 grid grid-cols-12">
                  <div className="col-span-7">ITEM NAME</div>
                  <div className="col-span-2 text-center">QTY</div>
                  <div className="col-span-1 text-right">OFFER</div>
                  <div className="col-span-2 text-right">T.P</div>
                </div>

                {/* Rows */}
                <ul className="divide-y divide-orange-100">
                  {list.map((p) => {
                    const qty = quantities[p.id] || 0;
                    return (
                      <li key={p.id} className="h-10 px-3">
                        <div className="h-full grid grid-cols-12 items-center gap-2">
                          <div className="col-span-7 min-w-0 truncate text-[13px]">{p.productName}</div>
                          <div className="col-span-2 flex justify-center">
                            <QtyInput value={qty} onChange={(n) => setQty(p.id, n)} label={`Qty for ${p.productName}`} />
                          </div>
                          <div className="col-span-1 text-right text-[12px] text-orange-700">{p.offerPct ? `${p.offerPct}%` : "—"}</div>
                          <div className="col-span-2 text-right text-[12px]">{pkr(p.price)}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* ACTIONS: WhatsApp + Download + Clear */}
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
          <div>CUSTOMER {customerName || "—"}</div>
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
                            {l.productName}
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
