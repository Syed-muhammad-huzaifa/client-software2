// app/api/products/route.ts
import { NextResponse } from "next/server";
import { addProduct, listProducts } from "@/lib/products";

export async function GET() {
  return NextResponse.json(listProducts());
}

export async function POST(req: Request) {
  const body = await req.json();
  const companyName = String(body?.companyName || "").trim();
  const productName = String(body?.productName || "").trim();
  const price = Number(body?.price);
  const offerPct =
    body?.offerPct === undefined || body?.offerPct === null || body?.offerPct === ""
      ? undefined
      : Number(body?.offerPct);

  if (!companyName || !productName) {
    return NextResponse.json(
      { error: "companyName and productName are required" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "price is required and must be a non-negative number" },
      { status: 400 }
    );
  }
  if (
    offerPct !== undefined &&
    (!Number.isFinite(offerPct) || offerPct < 0 || offerPct > 100)
  ) {
    return NextResponse.json(
      { error: "offerPct must be a number between 0 and 100" },
      { status: 400 }
    );
  }

  const created = addProduct({ companyName, productName, price, offerPct });
  return NextResponse.json(created, { status: 201 });
}
