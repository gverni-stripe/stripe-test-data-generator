import { NextResponse } from "next/server";
import Stripe from "stripe";

// Helper function to wait for a dispute to be created
const waitForDispute = async (
  stripeClient,
  paymentIntentId,
  maxAttempts = 10
) => {
  for (let i = 0; i < maxAttempts; i++) {
    const disputes = await stripeClient.disputes.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    if (disputes.data.length > 0) {
      return disputes.data[0];
    }

    // Wait 2 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    `No dispute was created for payment intent: ${paymentIntentId} after ${maxAttempts} attempts`
  );
};

export async function POST(req) {
  try {
    const { secretKey, paymentIntentId, evidence } = await req.json();

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

    // Wait for dispute to be created
    const dispute = await waitForDispute(stripe, paymentIntentId);

    // If evidence is provided, update the dispute
    if (evidence) {
      const updatedDispute = await stripe.disputes.update(dispute.id, {
        evidence: {
          uncategorized_text: evidence,
        },
      });

      return NextResponse.json({ dispute: updatedDispute });
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error handling dispute" },
      { status: error.statusCode || 500 }
    );
  }
}
