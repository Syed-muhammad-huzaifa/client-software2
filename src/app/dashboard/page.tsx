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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 flex flex-col">
      {/* top container (header + form) */}
      <div className="w-full px-3 sm:px-6 py-3 sm:py-4 shrink-0">
        {/* Header */}
        <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
          <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>

          {/* Search */}
          <div className="ml-auto relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-40 sm:w-72 rounded-lg border border-orange-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-400/60 text-slate-900 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Add Form (with Price + Offer %) */}
        <form
          onSubmit={add}
          className="rounded-lg border border-orange-200 bg-white/90 p-2.5 sm:p-3 shadow backdrop-blur"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {/* company */}
            <div className="sm:col-span-2 relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Building2 className="h-4 w-4" />
              </span>
              <input
                className="w-full rounded-md border border-orange-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-400/60 text-slate-900 placeholder:text-slate-500"
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
                className="w-full rounded-md border border-orange-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-400/60 text-slate-900 placeholder:text-slate-500"
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
                className="w-full rounded-md border border-orange-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-400/60 text-slate-900 placeholder:text-slate-500 uppercase"
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
                className="w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-400/60 text-slate-900 placeholder:text-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-400/60 text-slate-900 placeholder:text-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Offer % (optional)"
                value={offerPct}
                onChange={(e) => setOfferPct(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-400 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-orange-500/90 hover:to-orange-400/90 active:scale-[0.99] disabled:opacity-70 sm:col-span-1"
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
        <div className="mx-3 sm:mx-6 rounded-lg border border-orange-200 bg-white">
          {loading ? (
            <div className="divide-y divide-orange-100">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse px-3" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No products found.
            </div>
          ) : (
            <ul className="divide-y divide-orange-100">
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
                  <li key={p.id} className="h-14 px-3">
                    <div className="h-full flex items-center justify-between gap-3">
                      {/* Title block */}
                      <div className="min-w-0 flex-1">
                        {/* mobile: company on top, product under it */}
                        <div className="block sm:hidden leading-tight">
                      <div className="truncate text-[13px] font-semibold text-slate-900">
                        {p.companyName}
                      </div>
                      <div className="truncate text-[12px] text-slate-700">
                        {p.productName}
                      </div>
                      <div className="truncate text-[11px] font-semibold uppercase tracking-[0.3em] text-orange-500">
                        {p.itemCode}
                      </div>

                          {/* price/offer (mobile) */}
                          <div className="mt-0.5 flex items-center gap-1">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[11px] border ${
                                hasOffer
                                  ? "border-amber-300 bg-amber-50 text-amber-800"
                                  : "border-orange-200 bg-orange-50 text-orange-700"
                              }`}
                            >
                              {hasOffer
                                ? `${currency(net)} (−${p.offerPct}%)`
                                : `${currency(p.price)}`}
                            </span>
                          </div>
                        </div>

                        {/* desktop: single line "Product — Company" with chip */}
                        <div className="hidden sm:flex items-center gap-2 truncate text-sm">
                          <span className="font-semibold text-slate-900 truncate">
                            {p.productName}
                          </span>
                          <span className="text-slate-600 truncate">
                            — {p.companyName}
                          </span>
                          <span className="text-orange-500 truncate uppercase tracking-[0.3em]">
                            {p.itemCode}
                          </span>
                          <span
                            className={`ml-1 shrink-0 rounded-full px-2 py-0.5 text-[11px] border ${
                              hasOffer
                                ? "border-amber-300 bg-amber-50 text-amber-800"
                                : "border-orange-200 bg-orange-50 text-orange-700"
                            }`}
                            title={
                              hasOffer
                                ? `Price: ${currency(
                                    p.price
                                  )} | Offer: ${p.offerPct}% | Net: ${currency(
                                    net
                                  )}`
                                : `Price: ${currency(p.price)}`
                            }
                          >
                            {hasOffer
                              ? `${currency(net)} (−${p.offerPct}%)`
                              : `${currency(p.price)}`}
                          </span>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggle(p.id, !p.available)}
                          className={`rounded-md p-1.5 text-white ${
                            p.available
                              ? "bg-emerald-600 hover:bg-emerald-500"
                              : "bg-neutral-300 text-slate-800 hover:bg-neutral-400"
                          }`}
                          title={p.available ? "Turn OFF" : "Turn ON"}
                          aria-label="toggle"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="rounded-md p-1.5 bg-red-500 text-white hover:bg-red-600"
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

