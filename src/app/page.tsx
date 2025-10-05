// "use client";
// import React, { useMemo, useState, useEffect, useRef } from "react";
// import {
//   Search,
//   ShoppingCart,
//   Percent,
//   Package,
//   Filter,
//   X,
//   Phone,
//   Mail,
//   MessageCircle,
//   Globe,
//   MapPin,
//   FileDown,
// } from "lucide-react";

// /***** =========================================
//  * COMPANY CONFIG (edit these)
//  * ========================================= */
// const COMPANY = {
//   name: "QURESHI SOFT SYSTEM",
//   tagline: "Fast, reliable pharmaceutical distribution",
//   whatsappNumber: "0321-8004275",
//   phone: "0321-8004275",
//   email: "amjadqureshi@yahoo.com",
//   addressShort: "Quetta, Pakistan",
//   addressFull: "Resani center zarghoon road quetta, pakistan",
//   website: "www.winexports.com",
// };

// /***** =========================================
//  * TYPES & HELPERS
//  * ========================================= */
// type Item = {
//   code: string;
//   name: string;
//   offerPct: number;
//   bonus?: string;
//   tp: number;
//   section: string;
// };

// function currency(n: number) {
//   return new Intl.NumberFormat(undefined, {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(n);
// }
// function sanitizePhoneForWa(num: string) {
//   return Array.from(num)
//     .filter((c) => c >= "0" && c <= "9")
//     .join("");
// }
// function safeFileNameFromCompany(name: string) {
//   return name.trim().split(" ").filter(Boolean).join("_");
// }
// function buildOrderText(
//   lines: { item: Item; qty: number; subtotal: number }[],
//   total: number
// ) {
//   const head = `*${COMPANY.name}*\n${COMPANY.tagline}\n\n*Order Summary*`;
//   const rows = lines
//     .map(
//       ({ item, qty, subtotal }) =>
//         `• ${item.code} – ${item.name} x${qty} @ ${currency(item.tp)} (-${item.offerPct}%) = ${currency(subtotal)}`
//     )
//     .join("\n");
//   const foot = `\nTotal: *${currency(total)}*\nThanks!`;
//   return `${head}\n${rows}${foot}`;
// }

// /***** =========================================
//  * DEMO DATA (replace with API/DB)
//  * ========================================= */
// const SEED: Item[] = [
//   { code: "170", name: "ACENAC SR CAP", offerPct: 2, bonus: ".", tp: 399.5, section: "A" },
//   { code: "121", name: "AGNAR TAB", offerPct: 2, bonus: ".", tp: 765.0, section: "A" },
//   { code: "168", name: "ALL D DROPS", offerPct: 8, bonus: ".", tp: 300.9, section: "A" },
//   { code: "138", name: "ANAFORTAN PLUS INJ", offerPct: 3, bonus: ".", tp: 626.19, section: "A" },
//   { code: "59", name: "AZOMAX 250MG CAP", offerPct: 3, bonus: ".", tp: 590.34, section: "A" },
//   { code: "129", name: "CARDIOLITE 25MG TAB", offerPct: 3, bonus: ".", tp: 514.25, section: "C" },
//   { code: "130", name: "CARDIOLITE 50MG TAB", offerPct: 4, bonus: ".", tp: 839.83, section: "C" },
//   { code: "275", name: "CATAFEN 50MG TAB", offerPct: 10, bonus: ".", tp: 163.2, section: "C" },
//   { code: "107", name: "CECLOR 125MG SYP", offerPct: 2, bonus: ".", tp: 340.0, section: "C" },
//   { code: "104", name: "CECLOR 250MG CAP", offerPct: 2, bonus: ".", tp: 531.25, section: "C" },
//   { code: "105", name: "CECLOR 500MG CAP", offerPct: 2, bonus: ".", tp: 952.0, section: "C" },
//   { code: "205", name: "CEFEXOL SYP", offerPct: 16, bonus: ".", tp: 242.49, section: "C" },
//   { code: "16", name: "CEFIGET DS SYP", offerPct: 2, bonus: ".", tp: 280.5, section: "C" },
//   { code: "117", name: "CEFXONE 1G INJ", offerPct: 25, bonus: ".", tp: 365.5, section: "C" },
//   { code: "111", name: "CEFXONE 500IV INJ", offerPct: 28, bonus: ".", tp: 233.75, section: "C" },
//   { code: "22", name: "FEXET 60MG TAB", offerPct: 2, bonus: ".", tp: 293.25, section: "F" },
//   { code: "203", name: "FLUCON 150MG CAP", offerPct: 2, bonus: ".", tp: 136.0, section: "F" },
//   { code: "119", name: "GABIX 300MG CAP", offerPct: 3, bonus: ".", tp: 271.48, section: "G" },
//   { code: "278", name: "GABLIN 75MG CAP", offerPct: 12, bonus: ".", tp: 412.34, section: "G" },
//   { code: "98", name: "OMEZOL 20MG CAP", offerPct: 16, bonus: ".", tp: 273.7, section: "O" },
//   { code: "279", name: "ORTHROFENAC INJ", offerPct: 22, bonus: ".", tp: 197.2, section: "O" },
//   { code: "110", name: "OSNATE D SYP", offerPct: 2, bonus: ".", tp: 481.41, section: "O" },
//   { code: "252", name: "OSNATE D TAB", offerPct: 1, bonus: ".", tp: 407.2, section: "O" },
// ];
// const sections = Array.from(new Set(SEED.map((i) => i.section))).sort();

// /***** =========================================
//  * REUSABLE COMPONENTS
//  * ========================================= */

// // Typing effect for the company name (works with any name)
// function Typewriter({
//   text,
//   speed = 70,
//   startDelay = 300,
//   replayKey,
// }: {
//   text: string;
//   speed?: number;
//   startDelay?: number;
//   /** change this value to force a replay */
//   replayKey?: number | string;
// }) {
//   const [i, setI] = React.useState(0);
//   const [showCursor, setShowCursor] = React.useState(true);

//   React.useEffect(() => {
//     // reset index whenever replayKey or the inputs change
//     setI(0);

//     let typeTimer: any = null;
//     let startTimer: any = null;
//     const blinkTimer = setInterval(() => setShowCursor((s) => !s), 530);

//     startTimer = setTimeout(() => {
//       typeTimer = setInterval(() => {
//         setI((prev) => {
//           if (prev >= text.length) {
//             clearInterval(typeTimer);
//             return prev;
//           }
//           return prev + 1;
//         });
//       }, speed);
//     }, startDelay);

//     return () => {
//       clearTimeout(startTimer);
//       clearInterval(typeTimer);
//       clearInterval(blinkTimer);
//     };
//   }, [text, speed, startDelay, replayKey]);

//   return (
//     <span aria-label={text} className="align-baseline">
//       {text.slice(0, i)}
//       <span className="inline-block w-2 select-none">{showCursor ? "|" : " "}</span>
//     </span>
//   );
// }

// // 1) HEADER — tuned for <500px and up
// function CompanyHeader({
//   query,
//   setQuery,
//   activeSection,
//   setActiveSection,
// }: {
//   query: string;
//   setQuery: (v: string) => void;
//   activeSection: string | null;
//   setActiveSection: (s: string | null) => void;
// }) {
//   // replay the typewriter when the tab regains focus (or component mounts)
//   const [replayKey, setReplayKey] = React.useState<number>(() => Date.now());
//   React.useEffect(() => {
//     const onVis = () => {
//       if (document.visibilityState === "visible") {
//         setReplayKey(Date.now());
//       }
//     };
//     document.addEventListener("visibilitychange", onVis);
//     return () => document.removeEventListener("visibilitychange", onVis);
//   }, []);
//   return (
//     <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/95 backdrop-blur">
//       <div className="mx-auto max-w-7xl px-4 py-4">
//         {/* Brand + Name (mobile-first) */}
//         <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
//           <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 grid place-items-center shadow-xl">
//             <Package className="h-6 w-6 text-white" aria-hidden />
//           </div>
//           <div className="text-center sm:text-left w-full">
//             <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
//               <Typewriter text={COMPANY.name} speed={60} startDelay={250} replayKey={replayKey} />
//             </h1>
//             <p className="mt-1 text-[12px] sm:text-sm text-slate-300/90">
//               {COMPANY.tagline}
//             </p>
//           </div>
//         </div>

//         {/* Meta chips + Search — wrap nicely under 500px */}
//         <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center">
//           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
//             <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
//               <MapPin className="h-4 w-4" /> {COMPANY.addressShort}
//             </span>
            
//           </div>

//           <div className="sm:ml-auto w-full sm:w-[360px] relative">
//             <label htmlFor="hdr-search" className="sr-only">
//               Search products
//             </label>
//             <input
//               id="hdr-search"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by code, name, or %"
//               className="w-full rounded-2xl bg-slate-800/70 border border-white/10 px-4 py-2.5 pl-11 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             <Search
//               className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
//               aria-hidden
//             />
//           </div>
//         </div>

//         {/* Section chips */}
//         <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
//           <button
//             onClick={() => setActiveSection(null)}
//             className={`px-3 py-1 rounded-xl border text-xs whitespace-nowrap ${
//               activeSection === null
//                 ? "bg-indigo-600 border-indigo-500"
//                 : "bg-white/5 border-white/10"
//             }`}
//           >
//             All
//           </button>
//           {sections.map((s) => (
//             <button
//               key={s}
//               onClick={() => setActiveSection(s)}
//               className={`px-3 py-1 rounded-xl border text-xs whitespace-nowrap ${
//                 activeSection === s
//                   ? "bg-indigo-600 border-indigo-500"
//                   : "bg-white/5 border-white/10"
//               }`}
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//       </div>
//     </header>
//   );
// }

// // 2) PRODUCT TABLE (desktop ≥768px)
// function ProductTable({
//   items,
//   quantities,
//   setQty,
// }: {
//   items: Item[];
//   quantities: Record<string, number>;
//   setQty: (code: string, qty: number) => void;
// }) {
//   return (
//     <div className="hidden md:block">
//       <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
//         <table className="w-full text-sm">
//           <thead className="bg-slate-800/70">
//             <tr className="text-left">
//               <th className="px-4 py-3">Code</th>
//               <th className="px-4 py-3">Item Name</th>
//               <th className="px-4 py-3">Order</th>
//               <th className="px-4 py-3">
//                 <div className="flex items-center gap-1">
//                   <Percent className="h-4 w-4" /> Offer
//                 </div>
//               </th>
//               <th className="px-4 py-3">Bonus</th>
//               <th className="px-4 py-3">T.P</th>
//               <th className="px-4 py-3">Subtotal</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((i) => {
//               const qty = quantities[i.code] || 0;
//               const subtotal = qty * i.tp * (1 - i.offerPct / 100);
//               return (
//                 <tr
//                   key={i.code}
//                   className="border-t border-white/10 hover:bg-slate-800/40"
//                 >
//                   <td className="px-4 py-3 font-medium text-slate-200">
//                     {i.code}
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <span className="inline-flex items-center rounded-lg bg-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
//                         {i.section}
//                       </span>
//                       <span>{i.name}</span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 w-44">
//                     <div className="flex items-center gap-2">
//                       <button
//                         aria-label="Decrease"
//                         className="px-2 py-1 rounded-lg bg-slate-800/70 border border-white/10"
//                         onClick={() => setQty(i.code, qty - 1)}
//                       >
//                         -
//                       </button>
//                       <input
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         value={qty}
//                         onChange={(e) =>
//                           setQty(i.code, Number(e.currentTarget.value || 0))
//                         }
//                         className="w-20 text-center rounded-lg bg-slate-900/70 border border-white/10 py-1"
//                         aria-label={`Quantity for ${i.name}`}
//                       />
//                       <button
//                         aria-label="Increase"
//                         className="px-2 py-1 rounded-lg bg-slate-800/70 border border-white/10"
//                         onClick={() => setQty(i.code, qty + 1)}
//                       >
//                         +
//                       </button>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 font-semibold">{i.offerPct}%</td>
//                   <td className="px-4 py-3 text-slate-300">{i.bonus || "-"}</td>
//                   <td className="px-4 py-3 font-medium">{currency(i.tp)}</td>
//                   <td className="px-4 py-3 font-semibold">
//                     {qty ? currency(subtotal) : "—"}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // 3) PRODUCT CARDS (mobile <768px)
// function ProductCards({
//   items,
//   quantities,
//   setQty,
// }: {
//   items: Item[];
//   quantities: Record<string, number>;
//   setQty: (code: string, qty: number) => void;
// }) {
//   return (
//     <div className="md:hidden space-y-3">
//       {items.map((i) => {
//         const qty = quantities[i.code] || 0;
//         const subtotal = qty * i.tp * (1 - i.offerPct / 100);
//         return (
//           <div
//             key={i.code}
//             className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-xl"
//           >
//             <div className="flex items-start justify-between gap-3">
//               <div>
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className="inline-flex items-center rounded-lg bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
//                     {i.section}
//                   </span>
//                   <span className="text-xs text-slate-400">#{i.code}</span>
//                 </div>
//                 <h3 className="text-base font-semibold leading-tight">
//                   {i.name}
//                 </h3>
//                 <div className="mt-2 flex items-center gap-2 text-sm">
//                   <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-600/20 px-2 py-0.5 border border-indigo-500/40">
//                     <Percent className="h-4 w-4" />
//                     {i.offerPct}%
//                   </span>
//                   <span className="text-slate-300">TP: {currency(i.tp)}</span>
//                   <span className="text-slate-400">Bonus: {i.bonus || "-"}</span>
//                 </div>
//               </div>
//             </div>
//             <div className="mt-4 flex items-center gap-3">
//               <button
//                 aria-label="Decrease"
//                 className="px-3 py-2 rounded-xl bg-slate-800/70 border border-white/10"
//                 onClick={() => setQty(i.code, qty - 1)}
//               >
//                 -
//               </button>
//               <input
//                 inputMode="numeric"
//                 pattern="[0-9]*"
//                 value={qty}
//                 onChange={(e) => setQty(i.code, Number(e.currentTarget.value || 0))}
//                 className="w-20 text-center rounded-xl bg-slate-950/70 border border-white/10 py-2"
//                 aria-label={`Quantity for ${i.name}`}
//               />
//               <button
//                 aria-label="Increase"
//                 className="px-3 py-2 rounded-xl bg-slate-800/70 border border-white/10"
//                 onClick={() => setQty(i.code, qty + 1)}
//               >
//                 +
//               </button>
//               <div className="ml-auto text-right">
//                 <div className="text-xs text-slate-400">Subtotal</div>
//                 <div className="text-base font-semibold">
//                   {qty ? currency(subtotal) : "—"}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // 4) CART SUMMARY
// function CartSummary({
//   count,
//   total,
//   onWA,
//   onPDF,
// }: {
//   count: number;
//   total: number;
//   onWA: () => void;
//   onPDF: () => void;
// }) {
//   return (
//     <section className="mx-auto max-w-7xl px-4 pb-2">
//       <div className="rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl px-4 py-4 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
//         {/* Left: icon + cart meta */}
//         <div className="flex items-start sm:items-center gap-3">
//           <div className="shrink-0 grid place-items-center h-9 w-9 rounded-lg bg-white/5 border border-white/10">
//             <ShoppingCart className="h-5 w-5" aria-hidden />
//           </div>
//           <div className="text-sm">
//             <div className="font-semibold leading-tight">
//               {count} item{count === 1 ? "" : "s"} in cart
//             </div>
//             <div className="text-slate-300">Estimated total after discount</div>
//           </div>
//         </div>

//         {/* Total (stacks under 500px) */}
//         <div className="sm:ml-auto text-left sm:text-right">
//           <div className="text-xs text-slate-400">Total</div>
//           <div className="text-xl sm:text-lg font-bold">{currency(total)}</div>
//         </div>

//         {/* Actions: wrap on small, inline on larger */}
//         <div className="w-full sm:w-auto sm:ml-2 flex flex-col xs:flex-row sm:flex-row gap-2 sm:gap-2">
//           <button
//             onClick={onWA}
//             className="w-full sm:w-auto justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition px-3 py-2 text-sm font-semibold inline-flex items-center gap-2"
//           >
//             <MessageCircle className="h-4 w-4" /> Send WhatsApp
//           </button>
//           <button
//             onClick={onPDF}
//             className="w-full sm:w-auto justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition px-3 py-2 text-sm font-semibold inline-flex items-center gap-2"
//           >
//             <FileDown className="h-4 w-4" /> Generate PDF
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// // 5) FOOTER
// function CompanyFooter() {
//   return (
//     <footer className="mt-10 border-t border-white/10">
//       <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
//         <div className="space-y-1">
//           <div className="font-semibold text-slate-200 break-words">{COMPANY.name}</div>
//           <div className="text-slate-400 break-words">{COMPANY.tagline}</div>
//         </div>
//         <div className="space-y-2">
//           <div className="flex items-start gap-2 break-words">
//             <MessageCircle className="h-4 w-4 mt-0.5" /> <span>WhatsApp: {COMPANY.whatsappNumber}</span>
//           </div>
//           <div className="flex items-start gap-2 break-words">
//             <Phone className="h-4 w-4 mt-0.5" /> <span>{COMPANY.phone}</span>
//           </div>
//           <div className="flex items-start gap-2 break-words">
//             <Mail className="h-4 w-4 mt-0.5" /> <span className="break-words">{COMPANY.email}</span>
//           </div>
//         </div>
//         <div className="space-y-2">
//           <div className="flex items-start gap-2 break-words">
//             <MapPin className="h-4 w-4 mt-0.5" /> <span className="break-words">{COMPANY.addressFull}</span>
//           </div>
//           <a
//             href={`https://${COMPANY.website.replace(/^https?:\/\//, "")}`}
//             target="_blank"
//             rel="noreferrer"
//             className="inline-flex items-center gap-2 hover:underline break-words"
//           >
//             <Globe className="h-4 w-4" /> <span className="break-words">{COMPANY.website}</span>
//           </a>
//         </div>
//       </div>
//     </footer>
//   );
// }

// // 6) FILTERS DRAWER (stub)
// function FiltersDrawer({
//   activeSection,
//   onClear,
// }: {
//   activeSection: string | null;
//   onClear: () => void;
// }) {
//   return (
//     <div className="fixed right-4 bottom-24 md:bottom-8">
//       <div className="rounded-full shadow-2xl overflow-hidden border border-white/10">
//         <button className="bg-slate-900/90 backdrop-blur px-3 py-2 flex items-center gap-2 text-sm">
//           <Filter className="h-4 w-4" /> Filters{" "}
//           {activeSection ? (
//             <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-600/20 px-2 py-0.5 border border-indigo-500/40 text-xs">
//               {activeSection} <X className="h-3 w-3" onClick={onClear} />
//             </span>
//           ) : null}
//         </button>
//       </div>
//     </div>
//   );
// }

// /***** =========================================
//  * DEV CHECKS (lightweight tests run in dev only)
//  * ========================================= */
// function runDevChecks() {
//   try {
//     const sample = SEED[0];
//     const qty = 2;
//     const subtotal = qty * sample.tp * (1 - sample.offerPct / 100);
//     const txt = buildOrderText([{ item: sample, qty, subtotal }], subtotal);
//     console.assert(txt.includes("*Order Summary*"), "buildOrderText should contain section heading");
//     console.assert(txt.includes(sample.code) && txt.includes(sample.name), "buildOrderText should include code & name");
//     console.assert(txt.includes("x2"), "buildOrderText should include quantity");
//   } catch (e) {
//     console.warn("Dev checks failed:", e);
//   }
// }

// /***** =========================================
//  * MAIN PAGE (composed from components)
//  * ========================================= */
// export default function OfferList() {
//   const [query, setQuery] = useState("");
//   const [activeSection, setActiveSection] = useState<string | null>(null);
//   const [quantities, setQuantities] = useState<Record<string, number>>({});
//   const printableRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (process.env.NODE_ENV !== "production") runDevChecks();
//   }, []);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return SEED.filter((i) => {
//       const matchesQuery =
//         !q ||
//         i.name.toLowerCase().includes(q) ||
//         i.code.includes(q) ||
//         `${i.offerPct}%`.includes(q);
//       const matchesSection = !activeSection || i.section === activeSection;
//       return matchesQuery && matchesSection;
//     });
//   }, [query, activeSection]);

//   const cart = useMemo(() => {
//     const lines = Object.entries(quantities)
//       .filter(([, qty]) => qty > 0)
//       .map(([code, qty]) => {
//         const item = SEED.find((i) => i.code === code)!;
//         const subtotal = qty * item.tp * (1 - item.offerPct / 100);
//         return { item, qty, subtotal };
//       });
//     const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
//     const count = lines.reduce((sum, l) => sum + l.qty, 0);
//     return { lines, total, count };
//   }, [quantities]);

//   function setQty(code: string, qty: number) {
//     setQuantities((q) => ({
//       ...q,
//       [code]: Math.max(0, Math.min(9999, Math.floor(qty))),
//     }));
//   }

//   useEffect(() => {
//     const key = "offerlist-cart";
//     const prev = window.localStorage.getItem(key);
//     if (prev) setQuantities(JSON.parse(prev));
//     const onUnload = () =>
//       window.localStorage.setItem(key, JSON.stringify(quantities));
//     window.addEventListener("beforeunload", onUnload);
//     return () => window.removeEventListener("beforeunload", onUnload);
//   }, []);

//   useEffect(() => {
//     window.localStorage.setItem("offerlist-cart", JSON.stringify(quantities));
//   }, [quantities]);

//   async function generatePDF() {
//     try {
//       const [{ jsPDF }, html2canvas] = await Promise.all([
//         import("jspdf"),
//         import("html2canvas").then((m) => (m as any).default || (m as any)),
//       ] as any);
//       const node = printableRef.current;
//       if (!node) return;
//       const canvas = await (html2canvas as any)(node, {
//         scale: 2,
//         backgroundColor: "#0b1220",
//       });
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new (jsPDF as any)({
//         orientation: "p",
//         unit: "pt",
//         format: "a4",
//       });
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = pageWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
//       let y = 0;
//       pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
//       let heightLeft = imgHeight - pageHeight;
//       while (heightLeft > 0) {
//         pdf.addPage();
//         y = y - pageHeight;
//         pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }
//       pdf.save(`${safeFileNameFromCompany(COMPANY.name)}_Offer_List.pdf`);
//     } catch (e) {
//       console.error(e);
//       window.print();
//     }
//   }

//   function sendWhatsApp() {
//     const text = buildOrderText(cart.lines, cart.total);
//     const num = sanitizePhoneForWa(COMPANY.whatsappNumber);
//     const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
//     window.open(url, "_blank");
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
//       <CompanyHeader
//         query={query}
//         setQuery={setQuery}
//         activeSection={activeSection}
//         setActiveSection={setActiveSection}
//       />

//       <div ref={printableRef}>
//         <main className="mx-auto max-w-7xl px-4 py-6">
//           <ProductTable
//             items={filtered}
//             quantities={quantities}
//             setQty={setQty}
//           />
//           <ProductCards
//             items={filtered}
//             quantities={quantities}
//             setQty={setQty}
//           />
//         </main>

//         <CartSummary
//           count={cart.count}
//           total={cart.total}
//           onWA={sendWhatsApp}
//           onPDF={generatePDF}
//         />

//         <CompanyFooter />
//       </div>

//       <FiltersDrawer
//         activeSection={activeSection}
//         onClear={() => setActiveSection(null)}
//       />
//     </div>
//   );
// }

"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Percent,
  Package,
  Filter,
  X,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  MapPin,
  FileDown,
} from "lucide-react";

/***** =========================================
 * COMPANY CONFIG (edit these)
 * ========================================= */
const COMPANY = {
  name: "QURESHI SOFT SYSTEM",
  tagline: "Fast, reliable pharmaceutical distribution",
  whatsappNumber: "0321-8004275",
  phone: "0321-8004275",
  email: "amjadqureshi@yahoo.com",
  addressShort: "Quetta, Pakistan",
  addressFull: "Resani center zarghoon road quetta, pakistan",
  website: "www.winexports.com",
};

/***** =========================================
 * TYPES & HELPERS
 * ========================================= */
type Item = {
  code: string;
  name: string;
  offerPct: number;
  bonus?: string;
  tp: number;
  section: string;
};

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
function sanitizePhoneForWa(num: string) {
  return Array.from(num)
    .filter((c) => c >= "0" && c <= "9")
    .join("");
}
function safeFileNameFromCompany(name: string) {
  return name.trim().split(" ").filter(Boolean).join("_");
}
function buildOrderText(
  lines: { item: Item; qty: number; subtotal: number }[],
  total: number
) {
  const head = `*${COMPANY.name}*\n${COMPANY.tagline}\n\n*Order Summary*`;
  const rows = lines
    .map(
      ({ item, qty, subtotal }) =>
        `• ${item.code} – ${item.name} x${qty} @ ${currency(item.tp)} (-${item.offerPct}%) = ${currency(subtotal)}`
    )
    .join("\n");
  const foot = `\nTotal: *${currency(total)}*\nThanks!`;
  return `${head}\n${rows}${foot}`;
}

/***** =========================================
 * DEMO DATA (replace with API/DB)
 * ========================================= */
const SEED: Item[] = [
  { code: "170", name: "ACENAC SR CAP", offerPct: 2, bonus: ".", tp: 399.5, section: "A" },
  { code: "121", name: "AGNAR TAB", offerPct: 2, bonus: ".", tp: 765.0, section: "A" },
  { code: "168", name: "ALL D DROPS", offerPct: 8, bonus: ".", tp: 300.9, section: "A" },
  { code: "138", name: "ANAFORTAN PLUS INJ", offerPct: 3, bonus: ".", tp: 626.19, section: "A" },
  { code: "59", name: "AZOMAX 250MG CAP", offerPct: 3, bonus: ".", tp: 590.34, section: "A" },
  { code: "129", name: "CARDIOLITE 25MG TAB", offerPct: 3, bonus: ".", tp: 514.25, section: "C" },
  { code: "130", name: "CARDIOLITE 50MG TAB", offerPct: 4, bonus: ".", tp: 839.83, section: "C" },
  { code: "275", name: "CATAFEN 50MG TAB", offerPct: 10, bonus: ".", tp: 163.2, section: "C" },
  { code: "107", name: "CECLOR 125MG SYP", offerPct: 2, bonus: ".", tp: 340.0, section: "C" },
  { code: "104", name: "CECLOR 250MG CAP", offerPct: 2, bonus: ".", tp: 531.25, section: "C" },
  { code: "105", name: "CECLOR 500MG CAP", offerPct: 2, bonus: ".", tp: 952.0, section: "C" },
  { code: "205", name: "CEFEXOL SYP", offerPct: 16, bonus: ".", tp: 242.49, section: "C" },
  { code: "16", name: "CEFIGET DS SYP", offerPct: 2, bonus: ".", tp: 280.5, section: "C" },
  { code: "117", name: "CEFXONE 1G INJ", offerPct: 25, bonus: ".", tp: 365.5, section: "C" },
  { code: "111", name: "CEFXONE 500IV INJ", offerPct: 28, bonus: ".", tp: 233.75, section: "C" },
  { code: "22", name: "FEXET 60MG TAB", offerPct: 2, bonus: ".", tp: 293.25, section: "F" },
  { code: "203", name: "FLUCON 150MG CAP", offerPct: 2, bonus: ".", tp: 136.0, section: "F" },
  { code: "119", name: "GABIX 300MG CAP", offerPct: 3, bonus: ".", tp: 271.48, section: "G" },
  { code: "278", name: "GABLIN 75MG CAP", offerPct: 12, bonus: ".", tp: 412.34, section: "G" },
  { code: "98", name: "OMEZOL 20MG CAP", offerPct: 16, bonus: ".", tp: 273.7, section: "O" },
  { code: "279", name: "ORTHROFENAC INJ", offerPct: 22, bonus: ".", tp: 197.2, section: "O" },
  { code: "110", name: "OSNATE D SYP", offerPct: 2, bonus: ".", tp: 481.41, section: "O" },
  { code: "252", name: "OSNATE D TAB", offerPct: 1, bonus: ".", tp: 407.2, section: "O" },
];
const sections = Array.from(new Set(SEED.map((i) => i.section))).sort();

/***** =========================================
 * REUSABLE COMPONENTS
 * ========================================= */

// Typing effect for the company name (works with any name)
function Typewriter({
  text,
  speed = 70,
  startDelay = 300,
  replayKey,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  /** change this value to force a replay */
  replayKey?: number | string;
}) {
  const [i, setI] = React.useState(0);
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    // reset index whenever replayKey or the inputs change
    setI(0);

    let typeTimer: number | null = null;
    let startTimer: number | null = null;
    const blinkTimer: number = window.setInterval(() => setShowCursor((s) => !s), 530);

    startTimer = window.setTimeout(() => {
      typeTimer = window.setInterval(() => {
        setI((prev) => {
          if (prev >= text.length) {
            if (typeTimer !== null) window.clearInterval(typeTimer);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }, startDelay);

    return () => {
      if (startTimer !== null) window.clearTimeout(startTimer);
      if (typeTimer !== null) window.clearInterval(typeTimer);
      window.clearInterval(blinkTimer);
    };
  }, [text, speed, startDelay, replayKey]);

  return (
    <span aria-label={text} className="align-baseline">
      {text.slice(0, i)}
      <span className="inline-block w-2 select-none">{showCursor ? "|" : "\u00A0"}</span>
    </span>
  );
}

// 1) HEADER — tuned for <500px and up
function CompanyHeader({
  query,
  setQuery,
  activeSection,
  setActiveSection,
}: {
  query: string;
  setQuery: (v: string) => void;
  activeSection: string | null;
  setActiveSection: (s: string | null) => void;
}) {
  // replay the typewriter when the tab regains focus (or component mounts)
  const [replayKey, setReplayKey] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        setReplayKey(Date.now());
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4">
        {/* Brand + Name (mobile-first) */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 grid place-items-center shadow-xl">
            <Package className="h-6 w-6 text-white" aria-hidden />
          </div>
          <div className="text-center sm:text-left w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              <Typewriter text={COMPANY.name} speed={60} startDelay={250} replayKey={replayKey} />
            </h1>
            <p className="mt-1 text-[12px] sm:text-sm text-slate-300/90">
              {COMPANY.tagline}
            </p>
          </div>
        </div>

        {/* Meta chips + Search — wrap nicely under 500px */}
        <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <MapPin className="h-4 w-4" /> {COMPANY.addressShort}
            </span>
            
          </div>

          <div className="sm:ml-auto w-full sm:w-[360px] relative">
            <label htmlFor="hdr-search" className="sr-only">
              Search products
            </label>
            <input
              id="hdr-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code, name, or %"
              className="w-full rounded-2xl bg-slate-800/70 border border-white/10 px-4 py-2.5 pl-11 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search
              className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
              aria-hidden
            />
          </div>
        </div>

        {/* Section chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-3 py-1 rounded-xl border text-xs whitespace-nowrap ${
              activeSection === null
                ? "bg-indigo-600 border-indigo-500"
                : "bg-white/5 border-white/10"
            }`}
          >
            All
          </button>
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-3 py-1 rounded-xl border text-xs whitespace-nowrap ${
                activeSection === s
                  ? "bg-indigo-600 border-indigo-500"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// 2) PRODUCT TABLE (desktop ≥768px)
function ProductTable({
  items,
  quantities,
  setQty,
}: {
  items: Item[];
  quantities: Record<string, number>;
  setQty: (code: string, qty: number) => void;
}) {
  return (
    <div className="hidden md:block">
      <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/70">
            <tr className="text-left">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Item Name</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Percent className="h-4 w-4" /> Offer
                </div>
              </th>
              <th className="px-4 py-3">Bonus</th>
              <th className="px-4 py-3">T.P</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const qty = quantities[i.code] || 0;
              const subtotal = qty * i.tp * (1 - i.offerPct / 100);
              return (
                <tr
                  key={i.code}
                  className="border-t border-white/10 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium text-slate-200">
                    {i.code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                        {i.section}
                      </span>
                      <span>{i.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 w-44">
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Decrease"
                        className="px-2 py-1 rounded-lg bg-slate-800/70 border border-white/10"
                        onClick={() => setQty(i.code, qty - 1)}
                      >
                        -
                      </button>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={qty}
                        onChange={(e) =>
                          setQty(i.code, Number(e.currentTarget.value || 0))
                        }
                        className="w-20 text-center rounded-lg bg-slate-900/70 border border-white/10 py-1"
                        aria-label={`Quantity for ${i.name}`}
                      />
                      <button
                        aria-label="Increase"
                        className="px-2 py-1 rounded-lg bg-slate-800/70 border border-white/10"
                        onClick={() => setQty(i.code, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{i.offerPct}%</td>
                  <td className="px-4 py-3 text-slate-300">{i.bonus || "-"}</td>
                  <td className="px-4 py-3 font-medium">{currency(i.tp)}</td>
                  <td className="px-4 py-3 font-semibold">
                    {qty ? currency(subtotal) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3) PRODUCT CARDS (mobile <768px)
function ProductCards({
  items,
  quantities,
  setQty,
}: {
  items: Item[];
  quantities: Record<string, number>;
  setQty: (code: string, qty: number) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {items.map((i) => {
        const qty = quantities[i.code] || 0;
        const subtotal = qty * i.tp * (1 - i.offerPct / 100);
        return (
          <div
            key={i.code}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center rounded-lg bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                    {i.section}
                  </span>
                  <span className="text-xs text-slate-400">#{i.code}</span>
                </div>
                <h3 className="text-base font-semibold leading-tight">
                  {i.name}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-600/20 px-2 py-0.5 border border-indigo-500/40">
                    <Percent className="h-4 w-4" />
                    {i.offerPct}%
                  </span>
                  <span className="text-slate-300">TP: {currency(i.tp)}</span>
                  <span className="text-slate-400">Bonus: {i.bonus || "-"}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                aria-label="Decrease"
                className="px-3 py-2 rounded-xl bg-slate-800/70 border border-white/10"
                onClick={() => setQty(i.code, qty - 1)}
              >
                -
              </button>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={(e) => setQty(i.code, Number(e.currentTarget.value || 0))}
                className="w-20 text-center rounded-xl bg-slate-950/70 border border-white/10 py-2"
                aria-label={`Quantity for ${i.name}`}
              />
              <button
                aria-label="Increase"
                className="px-3 py-2 rounded-xl bg-slate-800/70 border border-white/10"
                onClick={() => setQty(i.code, qty + 1)}
              >
                +
              </button>
              <div className="ml-auto text-right">
                <div className="text-xs text-slate-400">Subtotal</div>
                <div className="text-base font-semibold">
                  {qty ? currency(subtotal) : "—"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 4) CART SUMMARY
function CartSummary({
  count,
  total,
  onWA,
  onPDF,
}: {
  count: number;
  total: number;
  onWA: () => void;
  onPDF: () => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-2">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl px-4 py-4 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Left: icon + cart meta */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="shrink-0 grid place-items-center h-9 w-9 rounded-lg bg-white/5 border border-white/10">
            <ShoppingCart className="h-5 w-5" aria-hidden />
          </div>
          <div className="text-sm">
            <div className="font-semibold leading-tight">
              {count} item{count === 1 ? "" : "s"} in cart
            </div>
            <div className="text-slate-300">Estimated total after discount</div>
          </div>
        </div>

        {/* Total (stacks under 500px) */}
        <div className="sm:ml-auto text-left sm:text-right">
          <div className="text-xs text-slate-400">Total</div>
          <div className="text-xl sm:text-lg font-bold">{currency(total)}</div>
        </div>

        {/* Actions: wrap on small, inline on larger */}
        <div className="w-full sm:w-auto sm:ml-2 flex flex-col xs:flex-row sm:flex-row gap-2 sm:gap-2">
          <button
            onClick={onWA}
            className="w-full sm:w-auto justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition px-3 py-2 text-sm font-semibold inline-flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" /> Send WhatsApp
          </button>
          <button
            onClick={onPDF}
            className="w-full sm:w-auto justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition px-3 py-2 text-sm font-semibold inline-flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" /> Generate PDF
          </button>
        </div>
      </div>
    </section>
  );
}

// 5) FOOTER
function CompanyFooter() {
  return (
    <footer className="mt-10 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 break-words">{COMPANY.name}</div>
          <div className="text-slate-400 break-words">{COMPANY.tagline}</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 break-words">
            <MessageCircle className="h-4 w-4 mt-0.5" /> <span>WhatsApp: {COMPANY.whatsappNumber}</span>
          </div>
          <div className="flex items-start gap-2 break-words">
            <Phone className="h-4 w-4 mt-0.5" /> <span>{COMPANY.phone}</span>
          </div>
          <div className="flex items-start gap-2 break-words">
            <Mail className="h-4 w-4 mt-0.5" /> <span className="break-words">{COMPANY.email}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 break-words">
            <MapPin className="h-4 w-4 mt-0.5" /> <span className="break-words">{COMPANY.addressFull}</span>
          </div>
          <a
            href={`https://${COMPANY.website.replace(/^https?:\/\//, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:underline break-words"
          >
            <Globe className="h-4 w-4" /> <span className="break-words">{COMPANY.website}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

// 6) FILTERS DRAWER (stub)
function FiltersDrawer({
  activeSection,
  onClear,
}: {
  activeSection: string | null;
  onClear: () => void;
}) {
  return (
    <div className="fixed right-4 bottom-24 md:bottom-8">
      <div className="rounded-full shadow-2xl overflow-hidden border border-white/10">
        <button className="bg-slate-900/90 backdrop-blur px-3 py-2 flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" /> Filters{" "}
          {activeSection ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-600/20 px-2 py-0.5 border border-indigo-500/40 text-xs">
              {activeSection} <X className="h-3 w-3" onClick={onClear} />
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}

/***** =========================================
 * DEV CHECKS (lightweight tests run in dev only)
 * ========================================= */
function runDevChecks() {
  try {
    const sample = SEED[0];
    const qty = 2;
    const subtotal = qty * sample.tp * (1 - sample.offerPct / 100);
    const txt = buildOrderText([{ item: sample, qty, subtotal }], subtotal);
    console.assert(txt.includes("*Order Summary*"), "buildOrderText should contain section heading");
    console.assert(txt.includes(sample.code) && txt.includes(sample.name), "buildOrderText should include code & name");
    console.assert(txt.includes("x2"), "buildOrderText should include quantity");
  } catch (e) {
    console.warn("Dev checks failed:", e);
  }
}

/***** =========================================
 * MAIN PAGE (composed from components)
 * ========================================= */
export default function OfferList() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const printableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") runDevChecks();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEED.filter((i) => {
      const matchesQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.code.includes(q) ||
        `${i.offerPct}%`.includes(q);
      const matchesSection = !activeSection || i.section === activeSection;
      return matchesQuery && matchesSection;
    });
  }, [query, activeSection]);

  const cart = useMemo(() => {
    const lines = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([code, qty]) => {
        const item = SEED.find((i) => i.code === code)!;
        const subtotal = qty * item.tp * (1 - item.offerPct / 100);
        return { item, qty, subtotal };
      });
    const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    return { lines, total, count };
  }, [quantities]);

  function setQty(code: string, qty: number) {
    setQuantities((q) => ({
      ...q,
      [code]: Math.max(0, Math.min(9999, Math.floor(qty))),
    }));
  }

  // Load cart once on mount
  useEffect(() => {
    const key = "offerlist-cart";
    const prev = window.localStorage.getItem(key);
    if (prev) setQuantities(JSON.parse(prev));
  }, []);

  // Persist cart on change
  useEffect(() => {
    window.localStorage.setItem("offerlist-cart", JSON.stringify(quantities));
  }, [quantities]);

  // Types for dynamic modules
  type JsPDFConstructor = new (options?: {
    orientation?: string;
    unit?: string;
    format?: string;
  }) => {
    internal: { pageSize: { getWidth(): number; getHeight(): number } };
    addImage: (
      imgData: string,
      format: string,
      x: number,
      y: number,
      w: number,
      h: number
    ) => void;
    addPage: () => void;
    save: (filename: string) => void;
  };

  type Html2CanvasFn = (
    element: HTMLElement,
    options?: { scale?: number; backgroundColor?: string }
  ) => Promise<HTMLCanvasElement>;

  async function generatePDF() {
    try {
      const jsPdfMod: unknown = await import("jspdf");
      const html2canvasMod: unknown = await import("html2canvas");

      let JsPDF: JsPDFConstructor | undefined;
      const m1 = jsPdfMod as Record<string, unknown>;
      if (typeof m1 === "function") {
        JsPDF = m1 as unknown as JsPDFConstructor;
      } else if (m1 && typeof m1 === "object") {
        if ("jsPDF" in m1 && typeof m1.jsPDF === "function") {
          JsPDF = m1.jsPDF as JsPDFConstructor;
        } else if ("default" in m1 && m1.default && typeof (m1.default as Record<string, unknown>).jsPDF === "function") {
          JsPDF = (m1.default as Record<string, unknown>).jsPDF as JsPDFConstructor;
        } else if ("default" in m1 && typeof m1.default === "function") {
          JsPDF = m1.default as unknown as JsPDFConstructor;
        }
      }

      const h2cObj = html2canvasMod as Record<string, unknown>;
      const html2canvas: Html2CanvasFn = (
        (h2cObj && typeof h2cObj === "object" && (h2cObj.default as Html2CanvasFn)) ||
        (h2cObj as unknown as Html2CanvasFn)
      );

      const node = printableRef.current;
      if (!node || !JsPDF || !html2canvas) return;

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#0b1220",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new JsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 0;
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      let heightLeft = imgHeight - pageHeight;
      while (heightLeft > 0) {
        pdf.addPage();
        y -= pageHeight;
        pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${safeFileNameFromCompany(COMPANY.name)}_Offer_List.pdf`);
    } catch (e) {
      console.error("PDF generation failed; falling back to print()", e);
      window.print();
    }
  }

  function sendWhatsApp() {
    const text = buildOrderText(cart.lines, cart.total);
    const num = sanitizePhoneForWa(COMPANY.whatsappNumber);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      <CompanyHeader
        query={query}
        setQuery={setQuery}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div ref={printableRef}>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <ProductTable
            items={filtered}
            quantities={quantities}
            setQty={setQty}
          />
          <ProductCards
            items={filtered}
            quantities={quantities}
            setQty={setQty}
          />
        </main>

        <CartSummary
          count={cart.count}
          total={cart.total}
          onWA={sendWhatsApp}
          onPDF={generatePDF}
        />

        <CompanyFooter />
      </div>

      <FiltersDrawer
        activeSection={activeSection}
        onClear={() => setActiveSection(null)}
      />
    </div>
  );
}