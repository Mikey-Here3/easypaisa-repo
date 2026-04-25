import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * =============================================
 * POST /api/pay — Easypaisa Payment Endpoint
 * =============================================
 * 1. Generates a unique Order ID
 * 2. Reads merchant credentials from env vars
 * 3. Builds the payment parameters
 * 4. Generates a SHA-256 HMAC hash for security
 * 5. Returns a redirect URL for the Easypaisa
 *    hosted checkout page (sandbox)
 * =============================================
 */

// Easypaisa sandbox URL for the hosted checkout page
const EASYPAISA_SANDBOX_URL =
  "https://easypay.easypaisa.com.pk/easypay/Index.jsf";

export async function POST(request: Request) {
  try {
    console.log("──────────────────────────────────");
    console.log("📥  /api/pay — New payment request");
    console.log("──────────────────────────────────");

    // ── Step 0: Parse request body ──────────────────────
    const body = await request.json();
    const requestedAmount = Number(body.amount);

    // Validate the amount
    if (!requestedAmount || requestedAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // ── Step 1: Read environment variables ──────────────
    const merchantId = process.env.EASYPAISA_MERCHANT_ID;
    const storeId = process.env.EASYPAISA_STORE_ID;
    const hashKey = process.env.EASYPAISA_HASH_KEY;

    // Make sure all credentials are present
    if (!merchantId || !storeId || !hashKey) {
      console.error("❌ Missing Easypaisa credentials in .env.local");
      return NextResponse.json(
        {
          error:
            "Server configuration error — Easypaisa credentials are missing. " +
            "Please set EASYPAISA_MERCHANT_ID, EASYPAISA_STORE_ID, and " +
            "EASYPAISA_HASH_KEY in your .env.local file.",
        },
        { status: 500 }
      );
    }

    // ── Step 2: Generate unique Order ID ────────────────
    // Format: ORDER-<timestamp>  (ensures uniqueness)
    const orderId = `ORDER-${Date.now()}`;

    // ── Step 3: Define payment parameters ───────────────
    // Easypaisa expects amount as a string with one decimal place
    const amount = `${requestedAmount.toFixed(1)}`;

    // Transaction date-time in yyyyMMdd HHmmss format
    const now = new Date();
    const transactionDateTime = formatDate(now);

    // Merchant-specific return URL (where Easypaisa redirects after payment)
    // In production, replace with your actual callback URL
    const merchantPaymentUrl = "http://localhost:3000/payment-complete";

    console.log("📋 Payment Parameters:");
    console.log("   Order ID       :", orderId);
    console.log("   Amount         : PKR", amount);
    console.log("   Date/Time      :", transactionDateTime);
    console.log("   Merchant ID    :", merchantId);
    console.log("   Store ID       :", storeId);

    // ── Step 4: Generate SHA-256 HMAC Hash ──────────────
    // Easypaisa requires a hash of the following string:
    //   amount + orderId + merchantId + storeId + transactionDateTime
    const hashString = `${amount}${orderId}${merchantId}${storeId}${transactionDateTime}`;

    console.log("🔐 Hash Input     :", hashString);

    const hash = crypto
      .createHmac("sha256", hashKey)
      .update(hashString)
      .digest("hex");

    console.log("🔑 Generated Hash :", hash);

    // ── Step 5: Build the redirect URL ──────────────────
    // Easypaisa hosted checkout accepts GET params
    const params = new URLSearchParams({
      storeId: storeId,
      orderId: orderId,
      transactionAmount: amount,
      transactionType: "MA", // Mobile Account
      merchantId: merchantId,
      tokenExpiry: transactionDateTime,
      merchantPaymentMethod: "",
      emailAddress: "",
      mobileNum: "",
      postBackURL: merchantPaymentUrl,
      signature: hash,
    });

    const paymentUrl = `${EASYPAISA_SANDBOX_URL}?${params.toString()}`;
    console.log("🔗 Payment URL    :", paymentUrl);
    console.log("──────────────────────────────────");

    // ── Step 6: Return response ─────────────────────────
    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
      amount,
      transactionDateTime,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ Payment API Error:", message);

    return NextResponse.json(
      { error: `Payment processing failed: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * formatDate — Converts a Date to "yyyyMMdd HHmmss" format
 * Required by the Easypaisa API for transaction datetime
 */
function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}${MM}${dd} ${HH}${mm}${ss}`;
}
