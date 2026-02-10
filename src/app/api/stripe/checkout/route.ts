import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe/client";
import { CREDIT_PACKAGES } from "@/lib/stripe/config";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packageId } = await req.json();

  const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!creditPackage) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "ideal"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${creditPackage.name} - ${creditPackage.credits} credits`,
            description: `${creditPackage.credits} research credits for WhatToBuild`,
          },
          unit_amount: creditPackage.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      packageId: creditPackage.id,
      credits: String(creditPackage.credits),
    },
    success_url: `${req.nextUrl.origin}/dashboard?payment=success`,
    cancel_url: `${req.nextUrl.origin}/dashboard?payment=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
