"use client";

import { useState } from "react";

/**
 * =============================================
 * Easypaisa Payment Page — Multi-Product
 * =============================================
 * Displays multiple product cards at different
 * price points. User selects one and clicks
 * "Pay with Easypaisa" to initiate payment.
 * =============================================
 */

/* ---------- Product Catalog ---------- */
// We generate 30 products to show a "multi-card" range as requested
const PRODUCTS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 100,
    description: "Perfect for testing the integration",
    tag: "Test",
    icon: "🧪",
  },
  // Generate 29 more cards scaling from 50k to 20 Lac
  ...Array.from({ length: 29 }).map((_, i) => {
    const minPrice = 50_000;
    const maxPrice = 2_000_000; // 20 Lac
    // Exponential or linear scaling for the price
    const price = Math.round(minPrice + ( (maxPrice - minPrice) / 28 ) * i);
    
    let tag = "Scale";
    let icon = "📈";
    if (price >= 1_500_000) { tag = "20 Lac"; icon = "👑"; }
    else if (price >= 1_000_000) { tag = "Corporate"; icon = "💎"; }
    else if (price >= 500_000) { tag = "Business"; icon = "🏢"; }
    else if (price >= 100_000) { tag = "Pro"; icon = "🚀"; }

    return {
      id: `plan-${i}`,
      name: `Tier ${i + 1} Plan`,
      price: price,
      description: `High-value plan for advanced needs`,
      tag: tag,
      icon: icon,
    };
  }),
];

/** Format number as PKR with commas — e.g. 1,00,000 */
function formatPKR(amount: number): string {
  return amount.toLocaleString("en-PK");
}

export default function PaymentPage() {
  const [selected, setSelected] = useState<string>("starter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProduct = PRODUCTS.find((p) => p.id === selected)!;

  /**
   * handlePay — initiates payment for the selected product
   */
  const handlePay = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🚀 Initiating payment for:", activeProduct.name);

      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: activeProduct.price,
          productName: activeProduct.name,
        }),
      });

      const data = await response.json();
      console.log("📦 API Response:", data);

      if (!response.ok) throw new Error(data.error || "Payment request failed");

      console.log("🔗 Redirecting to Easypaisa:", data.paymentUrl);
      window.location.href = data.paymentUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      console.error("❌ Payment error:", message);
      
      // Fallback logic for high-value failures
      if (activeProduct.price > 100_000) {
        setError(`${message}. (Note: Merchant accounts often have limits. Try the PKR 100 Starter Pack if this fails.)`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <>
      {/* Animated gradient background */}
      <div className="gradient-bg" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* ---- Header ---- */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div
              className="pulse-ring flex items-center justify-center w-16 h-16 rounded-full"
              style={{ background: "var(--easypaisa-green)" }}
            >
              <span className="text-white text-2xl font-bold select-none">
                EP
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1">Choose Your Plan</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Secure &amp; instant payments via Easypaisa
          </p>
        </div>

        {/* ---- Product Cards Grid (Scrollable) ---- */}
        <div className="w-full max-w-6xl mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
            {PRODUCTS.map((product) => {
            const isActive = selected === product.id;
            return (
              <button
                key={product.id}
                id={`card-${product.id}`}
                onClick={() => setSelected(product.id)}
                className="relative rounded-3xl p-6 text-left transition-all duration-300 cursor-pointer border-2 group"
                style={{
                  background: "var(--card-bg)",
                  borderColor: isActive
                    ? "var(--easypaisa-green)"
                    : "var(--card-border)",
                  boxShadow: isActive
                    ? "0 0 0 3px var(--easypaisa-green-glow), 0 8px 30px rgba(0,0,0,0.08)"
                    : "0 2px 12px rgba(0,0,0,0.04)",
                  transform: isActive ? "translateY(-4px)" : "translateY(0)",
                }}
              >
                {/* Tag badge */}
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    background: isActive
                      ? "var(--easypaisa-green)"
                      : "rgba(0,200,83,0.1)",
                    color: isActive ? "#fff" : "var(--easypaisa-green)",
                  }}
                >
                  {product.tag}
                </span>

                {/* Icon */}
                <div className="text-4xl mb-4">{product.icon}</div>

                {/* Name */}
                <h2 className="text-lg font-bold mb-1">{product.name}</h2>

                {/* Description */}
                <p
                  className="text-xs mb-5 leading-relaxed"
                  style={{ color: "var(--muted)" }}
                >
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-3xl font-extrabold"
                    style={{
                      color: isActive
                        ? "var(--easypaisa-green)"
                        : "var(--foreground)",
                    }}
                  >
                    {formatPKR(product.price)}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    PKR
                  </span>
                </div>

                {/* Selection indicator */}
                <div
                  className="mt-5 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{
                    background: isActive
                      ? "rgba(0,200,83,0.1)"
                      : "rgba(0,0,0,0.03)",
                    color: isActive
                      ? "var(--easypaisa-green)"
                      : "var(--muted)",
                  }}
                >
                  {isActive ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Selected
                    </>
                  ) : (
                    "Select Plan"
                  )}
                </div>
              </button>
            );
          })}
          </div>
        </div>

        {/* ---- Checkout Card ---- */}
        <div
          className="w-full max-w-md rounded-3xl p-6 shadow-2xl backdrop-blur-md border"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          {/* Order summary */}
          <div
            className="rounded-2xl p-4 mb-5 border"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,200,83,0.04), rgba(0,200,83,0.01))",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted)" }}
              >
                Order Summary
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(0,200,83,0.12)",
                  color: "var(--easypaisa-green)",
                }}
              >
                Sandbox
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{activeProduct.name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {activeProduct.description}
                </p>
              </div>
              <p
                className="text-xl font-bold whitespace-nowrap"
                style={{ color: "var(--easypaisa-green)" }}
              >
                PKR {formatPKR(activeProduct.price)}
              </p>
            </div>
          </div>

          {/* Pay button */}
          <button
            id="pay-button"
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base
                       flex items-center justify-center gap-3
                       transition-all duration-200 cursor-pointer
                       disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? "var(--easypaisa-green-dark)"
                : "linear-gradient(135deg, var(--easypaisa-green), var(--easypaisa-green-dark))",
              boxShadow: loading
                ? "none"
                : "0 4px 20px var(--easypaisa-green-glow)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px var(--easypaisa-green-glow)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px var(--easypaisa-green-glow)";
            }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Processing…
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pay PKR {formatPKR(activeProduct.price)} with Easypaisa
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div
              className="mt-4 p-3 rounded-xl text-sm text-center border"
              style={{
                background: "rgba(239,68,68,0.08)",
                borderColor: "rgba(239,68,68,0.2)",
                color: "#ef4444",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-5 flex items-center justify-center gap-2 text-xs"
            style={{ color: "var(--muted)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>256-bit SSL Encrypted · Easypaisa Verified</span>
          </div>
        </div>
      </main>
    </>
  );
}
