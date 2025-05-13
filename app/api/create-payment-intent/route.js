import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req) {
  try {
    const { secretKey, overrides = {}, currency = "usd" } = await req.json();

    if (!secretKey || !secretKey.startsWith("sk_test_")) {
      return NextResponse.json(
        { error: "Invalid test secret key" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);

    // Payment intent template
    const template = {
      amount: 2000,
      currency: currency,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    };

    const paymentIntentArgs = {
      ...template,
      ...overrides,
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentArgs);

    return NextResponse.json({ paymentIntent });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error creating payment intent" },
      { status: error.statusCode || 500 }
    );
  }
}
