import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req) {
  try {
    const {
      secretKey,
      paymentIntentId,
      reason = "requested_by_customer",
    } = await req.json();

    if (!secretKey || !secretKey.startsWith("sk_test_")) {
      return NextResponse.json(
        { error: "Invalid test secret key" },
        { status: 400 }
      );
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason,
    });

    return NextResponse.json({ refund });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error creating refund" },
      { status: error.statusCode || 500 }
    );
  }
}
