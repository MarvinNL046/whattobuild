import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits);

    if (!userId || !credits) {
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    // Find user in Convex by Clerk ID
    const user = await convex.query(api.users.getByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add credits
    await convex.mutation(api.credits.add, {
      userId: user._id,
      amount: credits,
      description: `Purchased ${credits} credits`,
      stripeSessionId: session.id,
    });
  }

  return NextResponse.json({ received: true });
}
