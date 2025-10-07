// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Tag,
  Plus,
  Power,
  Trash2,
  Loader2,
  Search,
  Hash,
} from "lucide-react";
import { Poppins } from "next/font/google";

type Product = {
  id: string;
  itemCode: string;
  companyName: string;
  productName: string;
  available: boolean;
  createdAt: string; // unused display-wise
  price: number;
  offerPct?: number;
};

function currency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rs ${Math.round(n).toLocaleString()}`;
  }
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function DashboardPage() {
  const [companyName, setCompanyName] = useState("");
  const [productName, setProductName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [price, setPrice] = useState<string>("");
  const [offerPct, setOfferPct] = useState<string>("");
  const [items, setItems] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      const parsed: Product[] = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            itemCode: String(item?.itemCode ?? ""),
          }))
        : [];
      setItems(parsed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const cn = companyName.trim();
    const pn = productName.trim();
    const ic = itemCode.trim();
    const pr = Number(price);
    const off = offerPct === "" ? undefined : Number(offerPct);

    if (!cn || !pn || !ic) {
      alert("Company, product and item code are required.");
      return;
    }
    if (!Number.isFinite(pr) || pr < 0) {
      alert("Please enter a valid non-negative price.");
      return;
    }
    if (off !== undefined && (!Number.isFinite(off) || off < 0 || off > 100)) {
      alert("Offer % must be between 0 and 100.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: cn,
          productName: pn,
          itemCode: ic,
          price: pr,
          ...(off !== undefined ? { offerPct: off } : {}),
        }),
      });
      if (!res.ok) {
        let message = "Unable to add product.";
        try {
          const payload = await res.json();
          if (payload && typeof payload.error === "string") {
            message = payload.error;
          }
        } catch {
          // ignore JSON parse errors
        }
        alert(message);
        return;
      }
      setCompanyName("");
      setProductName("");
      setItemCode("");
      setPrice("");
      setOfferPct("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, available: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ available }),
    });
    await load();
  }

  async function remove(id: string) {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.itemCode.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className={`${poppins.className} min-h-screen bg-slate-50 text-slate-700 flex flex-col`}>
      {/* top container (header + form) */}
      <div className="w-full px-3 sm:px-6 py-4 shrink-0">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 sm:gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-sky-50">
          <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-cyan-500 text-white shadow">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h1 className="text-base sm:text-xl font-extrabold tracking-[0.2em] text-slate-800 uppercase">
            Admin Dashboard
          </h1>

          {/* Search */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-none sm:w-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or companies"
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 sm:w-72"
            />
          </div>
        </div>

        {/* Add Form (with Price + Offer %) */}
        <form
          onSubmit={add}
          className="rounded-3xl border border-slate-200 bg-white px-3 py-3 shadow-lg shadow-sky-50 sm:px-4 sm:py-4"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {/* company */}
            <div className="sm:col-span-2 relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Building2 className="h-4 w-4" />
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-slate-700 placeholder:text-slate-400"
                placeholder="Company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            {/* product */}
            <div className="sm:col-span-2 relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Tag className="h-4 w-4" />
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-slate-700 placeholder:text-slate-400"
                placeholder="Product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>

            {/* item code */}
            <div className="sm:col-span-1 relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Hash className="h-4 w-4" />
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm uppercase outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-slate-700 placeholder:text-slate-400"
                placeholder="Item code"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            {/* price (required) */}
            <div className="sm:col-span-1">
              <input
                type="number"
                min={0}
                step="1"
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-slate-700 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Price (PKR)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* offer (optional) */}
            <div className="sm:col-span-1">
              <input
                type="number"
                min={0}
                max={100}
                step="1"
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-slate-700 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Offer % (optional)"
                value={offerPct}
                onChange={(e) => setOfferPct(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-cyan-500 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:opacity-70 sm:col-span-1"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {busy ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* list fills remaining height & scrolls itself */}
      <div className="w-full px-0 sm:px-2 pb-4 grow overflow-y-auto">
        <div className="mx-3 sm:mx-6 rounded-3xl border border-slate-200 bg-white shadow-lg shadow-sky-50">
          {loading ? (
            <div className="space-y-2 px-4 py-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-slate-100/80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="m-4 rounded-2xl border border-slate-200 bg-white/80 p-10 text-center text-slate-500">
              No products found.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const hasOffer =
                  typeof p.offerPct === "number" && p.offerPct > 0;
                const net = hasOffer
                  ? Math.max(
                      0,
                      Math.round(p.price * (1 - (p.offerPct || 0) / 100))
                    )
                  : p.price;

                return (
                  <li key={p.id} className="px-3 py-3">
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 shadow-sm transition hover:border-sky-300 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-sky-500">
                          <span>{p.itemCode || "UNKNOWN"}</span>
                          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-400 sm:inline">
                            {p.id.slice(0, 6)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                          <span className="font-semibold text-slate-800">{p.productName}</span>
                          <span className="text-slate-500">/ {p.companyName}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-500">
                            Price {currency(p.price)}
                          </span>
                          {hasOffer ? (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                              Offer {p.offerPct}% → {currency(net)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => toggle(p.id, !p.available)}
                          className={`rounded-xl p-2 transition ${
                            p.available
                              ? "bg-gradient-to-br from-sky-500 via-indigo-500 to-cyan-500 text-white shadow-sm hover:brightness-110"
                              : "border border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                          title={p.available ? "Set unavailable" : "Set available"}
                          aria-label="toggle availability"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-500 transition hover:border-red-300 hover:bg-red-100"
                          title="Delete"
                          aria-label="delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

