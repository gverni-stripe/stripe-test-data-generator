import { generateOrderNumber } from './stripe-helpers';

export async function runScenarios(
  secretKey,
  currency,
  updateProgress,
  addLog
) {

  try {
    // Initialize progress
    updateProgress(0);

    // 1. Create 10 successful transactions (20% of progress)
    addLog("--- Creating 10 successful transactions ---");

    for (let i = 1; i <= 10; i++) {
      const orderNumber = generateOrderNumber();

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          overrides: {
            amount: 2000 + i * 100,
            currency,
            payment_method: "pm_card_visa",
            description: `Order #${orderNumber}`,
            metadata: {
              orderid: orderNumber.toString(),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create payment intent: ${(await response.json()).error}`
        );
      }

      const { paymentIntent } = await response.json();
      addLog(
        `✅ Transaction ${i}/10 created: ${paymentIntent.id} for Order #${orderNumber}`
      );
      updateProgress(i * 2); // 0-20%
    }

    // 2. Create bypass pending balance transactions (5% of progress)
    addLog("--- Creating bypass pending balance transactions ---", "info");

    // US bypass pending
    const usBypassOrderNumber = generateOrderNumber();
    const usBypassResponse = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey,
        overrides: {
          amount: 5000,
          currency,
          payment_method: "pm_card_bypassPending",
          description: `Order #${usBypassOrderNumber} (US Bypass Pending)`,
          metadata: {
            orderid: usBypassOrderNumber.toString(),
          },
        },
      }),
    });

    if (!usBypassResponse.ok) {
      throw new Error(
        `Failed to create US bypass payment: ${
          (await usBypassResponse.json()).error
        }`
      );
    }

    const { paymentIntent: usBypassPaymentIntent } =
      await usBypassResponse.json();
    addLog(
      `✅ US Bypass Pending transaction created: ${usBypassPaymentIntent.id} for Order #${usBypassOrderNumber}`
    );
    addLog(
      "   Funds added directly to available balance, bypassing pending balance."
    );
    updateProgress(22);

    // International bypass pending
    const intlBypassOrderNumber = generateOrderNumber();
    const intlBypassResponse = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey,
        overrides: {
          amount: 5500,
          currency,
          payment_method: "pm_card_bypassPendingInternational",
          description: `Order #${intlBypassOrderNumber} (International Bypass Pending)`,
          metadata: {
            orderid: intlBypassOrderNumber.toString(),
          },
        },
      }),
    });

    if (!intlBypassResponse.ok) {
      throw new Error(
        `Failed to create international bypass payment: ${
          (await intlBypassResponse.json()).error
        }`
      );
    }

    const { paymentIntent: intlBypassPaymentIntent } =
      await intlBypassResponse.json();
    addLog(
      `✅ International Bypass Pending transaction created: ${intlBypassPaymentIntent.id} for Order #${intlBypassOrderNumber}`
    );
    addLog(
      "   International funds added directly to available balance, bypassing pending balance."
    );
    updateProgress(25);

    // 3. Create declined payments (25% of progress)
    addLog("--- Creating declined payments ---", "info");

    // Generic decline
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_visa_chargeDeclined",
        "Test generic decline",
        currency
      );
      addLog(`❌ Generic decline created: The card was declined`);
    } catch (error) {
      addLog(`✅ Generic decline created: ${error.message}`);
    }
    updateProgress(28);

    // Insufficient funds
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_visa_chargeDeclinedInsufficientFunds",
        "Test insufficient funds",
        currency
      );
      addLog(`❌ Insufficient funds decline created: The card was declined`);
    } catch (error) {
      addLog(`✅ Insufficient funds decline created: ${error.message}`);
    }
    updateProgress(31);

    // Lost card
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_visa_chargeDeclinedLostCard",
        "Test lost card",
        currency
      );
      addLog(`❌ Lost card decline created: The card was declined`);
    } catch (error) {
      addLog(`✅ Lost card decline created: ${error.message}`);
    }
    updateProgress(34);

    // Stolen card
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_visa_chargeDeclinedStolenCard",
        "Test stolen card",
        currency
      );
      addLog(`❌ Stolen card decline created: The card was declined`);
    } catch (error) {
      addLog(`✅ Stolen card decline created: ${error.message}`);
    }
    updateProgress(37);

    // Expired card
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_chargeDeclinedExpiredCard",
        "Test expired card",
        currency
      );
      addLog(`❌ Expired card decline created: The card was declined`);
    } catch (error) {
      addLog(`✅ Expired card decline created: ${error.message}`);
    }
    updateProgress(40);

    // Incorrect CVC
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_chargeDeclinedIncorrectCvc",
        "Test incorrect CVC",
        currency
      );
      addLog(`❌ Incorrect CVC decline created: The card was declined`);
    } catch (error) {
      addLog(`✅ Incorrect CVC decline created: ${error.message}`);
    }
    updateProgress(43);

    // Processing error
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_chargeDeclinedProcessingError",
        "Test processing error",
        currency
      );
      addLog(`❌ Processing error decline created: The card was declined`);
    } catch (error) {
      addLog(`✅ Processing error decline created: ${error.message}`);
    }
    updateProgress(46);

    // Exceeding velocity limit
    try {
      await createDeclinedPayment(
        secretKey,
        "pm_card_visa_chargeDeclinedVelocityLimitExceeded",
        "Test velocity limit exceeded",
        currency
      );
      addLog(
        `❌ Velocity limit exceeded decline created: The card was declined`
      );
    } catch (error) {
      addLog(`✅ Velocity limit exceeded decline created: ${error.message}`);
    }
    updateProgress(50);

    // 4. Create successful refund (10% of progress)
    addLog("--- Creating successful refund ---", "info");
    const successfulChargeResponse = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey,
        overrides: {
          amount: 3000,
          currency,
          payment_method: "pm_card_visa",
          description: "Charge for successful refund test",
        },
      }),
    });

    if (!successfulChargeResponse.ok) {
      throw new Error(
        `Failed to create charge for refund: ${
          (await successfulChargeResponse.json()).error
        }`
      );
    }

    const { paymentIntent: successfulCharge } =
      await successfulChargeResponse.json();

    const successfulRefundResponse = await fetch("/api/create-refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey,
        paymentIntentId: successfulCharge.id,
        reason: "requested_by_customer",
      }),
    });

    if (!successfulRefundResponse.ok) {
      throw new Error(
        `Failed to create successful refund: ${
          (await successfulRefundResponse.json()).error
        }`
      );
    }

    const { refund: successfulRefund } = await successfulRefundResponse.json();
    addLog(`✅ Successful refund created: ${successfulRefund.id}`);
    updateProgress(60);

    // 5. Create failed refund (10% of progress)
    addLog("--- Creating failed refund ---", "info");
    const failedRefundChargeResponse = await fetch(
      "/api/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          overrides: {
            amount: 4000,
            currency,
            payment_method: "pm_card_refundFail",
            description: "Charge for failed refund test",
          },
        }),
      }
    );

    if (!failedRefundChargeResponse.ok) {
      throw new Error(
        `Failed to create charge for failed refund: ${
          (await failedRefundChargeResponse.json()).error
        }`
      );
    }

    const { paymentIntent: failedRefundCharge } =
      await failedRefundChargeResponse.json();

    const pendingFailedRefundResponse = await fetch("/api/create-refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey,
        paymentIntentId: failedRefundCharge.id,
        reason: "requested_by_customer",
      }),
    });

    if (!pendingFailedRefundResponse.ok) {
      throw new Error(
        `Failed to create pending failed refund: ${
          (await pendingFailedRefundResponse.json()).error
        }`
      );
    }

    const { refund: pendingFailedRefund } =
      await pendingFailedRefundResponse.json();
    addLog(
      `✅ Failed refund initiated: ${pendingFailedRefund.id} (will transition to failed state automatically)`
    );
    updateProgress(70);

    // 6. Create dispute won (10% of progress)
    addLog("--- Creating dispute (won) ---", "info");
    const disputeWonChargeResponse = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey,
        overrides: {
          amount: 5000,
          currency,
          payment_method: "pm_card_createDispute",
          description: "Charge for dispute won test",
        },
      }),
    });

    if (!disputeWonChargeResponse.ok) {
      throw new Error(
        `Failed to create charge for won dispute: ${
          (await disputeWonChargeResponse.json()).error
        }`
      );
    }

    const { paymentIntent: disputeWonCharge } =
      await disputeWonChargeResponse.json();
    addLog(`✅ Dispute won charge created: ${disputeWonCharge.id}`);
    addLog(
      `Waiting for dispute to be created (this may take a few seconds)...`
    );

    try {
      const wonDisputeResponse = await fetch("/api/handle-dispute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          paymentIntentId: disputeWonCharge.id,
          evidence: "winning_evidence",
        }),
      });

      if (!wonDisputeResponse.ok) {
        throw new Error(
          `Failed to handle won dispute: ${
            (await wonDisputeResponse.json()).error
          }`
        );
      }

      addLog(
        `✅ Dispute updated with winning evidence. The dispute should be marked as won.`,
        "success"
      );
    } catch (error) {
      addLog(`❌ Error handling won dispute: ${error.message}`, "error");
    }

    updateProgress(80);

    // 7. Create dispute lost (10% of progress)
    addLog("--- Creating dispute (lost) ---", "info");
    const disputeLostChargeResponse = await fetch(
      "/api/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          overrides: {
            amount: 6000,
            currency,
            payment_method: "pm_card_createDispute",
            description: "Charge for dispute lost test",
          },
        }),
      }
    );

    if (!disputeLostChargeResponse.ok) {
      throw new Error(
        `Failed to create charge for lost dispute: ${
          (await disputeLostChargeResponse.json()).error
        }`
      );
    }

    const { paymentIntent: disputeLostCharge } =
      await disputeLostChargeResponse.json();
    addLog(`✅ Dispute lost charge created: ${disputeLostCharge.id}`);
    addLog(
      `Waiting for dispute to be created (this may take a few seconds)...`
    );

    try {
      const lostDisputeResponse = await fetch("/api/handle-dispute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          paymentIntentId: disputeLostCharge.id,
          evidence: "losing_evidence",
        }),
      });

      if (!lostDisputeResponse.ok) {
        throw new Error(
          `Failed to handle lost dispute: ${
            (await lostDisputeResponse.json()).error
          }`
        );
      }

      addLog(
        `✅ Dispute updated with losing evidence. The dispute should be marked as lost.`,
        "warning"
      );
    } catch (error) {
      addLog(`❌ Error handling lost dispute: ${error.message}`, "error");
    }

    updateProgress(90);
    // 8. Create dispute not responded (10% of progress)
    addLog("--- Creating dispute (not responded) ---", "info");
    const disputeNotRespondedChargeResponse = await fetch(
      "/api/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          overrides: {
            amount: 7000,
            currency,
            payment_method: "pm_card_createDispute",
            description: "Charge for dispute not responded test",
          },
        }),
      }
    );

    if (!disputeNotRespondedChargeResponse.ok) {
      throw new Error(
        `Failed to create charge for not responded dispute: ${
          (await disputeNotRespondedChargeResponse.json()).error
        }`
      );
    }

    const { paymentIntent: disputeNotRespondedCharge } =
      await disputeNotRespondedChargeResponse.json();
    addLog(
      `✅ Dispute not responded charge created: ${disputeNotRespondedCharge.id}`
    );
    addLog(
      `✅ Not submitting evidence for this dispute. It will be marked as not responded.`
    );

    updateProgress(100);
    addLog("All test scenarios created successfully!", "success");

    return { success: true };
  } catch (error) {
    updateProgress(100);
    addLog(`Error: ${error.message}`, "error");
    return { success: false, error: error.message };
  }
}

// Helper function for creating declined payments
async function createDeclinedPayment(secretKey, paymentMethod, description, currency) {
  const response = await fetch("/api/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secretKey,
      overrides: {
        payment_method: paymentMethod,
        description,
        currency
      },
    }),
  });

  // This should throw an error because the payment should be declined
  if (response.ok) {
    throw new Error("Expected payment to be declined but it was successful");
  }

  const errorData = await response.json();
  return errorData.error;
}

