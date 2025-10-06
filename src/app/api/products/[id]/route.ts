// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { setAvailability, deleteProduct } from "@/lib/products";

/** Extract the dynamic [id] from the URL, no context typing needed */
function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  // works for /api/products/:id (and with any basePath)
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

// PATCH /api/products/[id]
export async function PATCH(req: Request) {
  const id = getIdFromUrl(req);
  const { available } = await req.json();

  if (typeof available !== "boolean") {
    return NextResponse.json(
      { error: "available must be boolean" },
      { status: 400 }
    );
  }

  const updated = setAvailability(id, available);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/products/[id]
export async function DELETE(req: Request) {
  const id = getIdFromUrl(req);

  const ok = deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
