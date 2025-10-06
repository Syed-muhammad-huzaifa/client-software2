// src/lib/products.ts
import fs from "fs";
import path from "path";

export type Product = {
  id: string;
  companyName: string;
  productName: string;
  available: boolean;
  createdAt: string;

  // NEW FIELDS
  price: number;       // required total/unit price
  offerPct?: number;   // optional discount percentage (0..100)
};

const filePath = path.join(process.cwd(), "data", "products.json");

function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
}

// Use Record<string, unknown> for flexible unknown JSON
function normalizeRow(p: Record<string, unknown>): Product {
  return {
    id: typeof p.id === "string" ? p.id : Math.random().toString(36).slice(2),
    companyName: typeof p.companyName === "string" ? p.companyName : "",
    productName: typeof p.productName === "string" ? p.productName : "",
    available: typeof p.available === "boolean" ? p.available : true,
    createdAt:
      typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),

    price:
      typeof p.price === "number"
        ? p.price
        : Number.isFinite(Number(p.price))
        ? Number(p.price)
        : 0,

    offerPct:
      typeof p.offerPct === "number"
        ? p.offerPct
        : Number.isFinite(Number(p.offerPct))
        ? Number(p.offerPct)
        : undefined,
  };
}

export function listProducts(): Product[] {
  ensureFile();
  const raw = fs.readFileSync(filePath, "utf-8") || "[]";
  let arr: unknown = [];
  try {
    arr = JSON.parse(raw);
  } catch {
    arr = [];
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => normalizeRow(item as Record<string, unknown>));
}

export function saveProducts(items: Product[]) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
}

// Overloads
export function addProduct(
  companyName: string,
  productName: string,
  price: number,
  offerPct?: number
): Product;
export function addProduct(input: {
  companyName: string;
  productName: string;
  price: number;
  offerPct?: number;
}): Product;

export function addProduct(
  a: string | { companyName: string; productName: string; price: number; offerPct?: number },
  b?: string,
  c?: number,
  d?: number
): Product {
  const items = listProducts();

  let companyName: string;
  let productName: string;
  let price: number;
  let offerPct: number | undefined;

  if (typeof a === "string") {
    companyName = a.trim();
    productName = String(b ?? "").trim();
    price = Number(c);
    offerPct = d !== undefined ? Number(d) : undefined;
  } else {
    companyName = String(a.companyName ?? "").trim();
    productName = String(a.productName ?? "").trim();
    price = Number(a.price);
    offerPct = a.offerPct !== undefined ? Number(a.offerPct) : undefined;
  }

  if (!companyName || !productName) {
    throw new Error("companyName and productName are required");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("price is required and must be a non-negative number");
  }
  if (
    offerPct !== undefined &&
    (!Number.isFinite(offerPct) || offerPct < 0 || offerPct > 100)
  ) {
    throw new Error("offerPct must be a number between 0 and 100");
  }

  const p: Product = {
    id: Math.random().toString(36).slice(2),
    companyName,
    productName,
    available: true,
    createdAt: new Date().toISOString(),
    price,
    offerPct,
  };

  items.push(p);
  saveProducts(items);
  return p;
}

export function setAvailability(id: string, available: boolean) {
  const items = listProducts();
  const i = items.findIndex((x) => x.id === id);
  if (i === -1) return null;
  items[i].available = available;
  saveProducts(items);
  return items[i];
}

export function deleteProduct(id: string) {
  const items = listProducts();
  const filtered = items.filter((x) => x.id !== id);
  if (filtered.length === items.length) return false;
  saveProducts(filtered);
  return true;
}
