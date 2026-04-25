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
    id: "custom",
    name: "Custom Payment",
    price: 0, // Placeholder
    description: "Pay any amount of your choice",
    tag: "Flexible",
    icon: "🎨",
  },
  {
    id: "starter",
    name: "Starter Pack",
    price: 100,
    description: "Perfect for testing the integration",
    tag: "Test",
    icon: "🧪",
  },
  // Generate 28 more cards scaling from 50k to 20 Lac
  ...Array.from({ length: 28 }).map((_, i) => {
    const minPrice = 50_000;
    const maxPrice = 2_000_000; // 20 Lac
    // Exponential or linear scaling for the price
    const price = Math.round(minPrice + ( (maxPrice - minPrice) / 27 ) * i);
    
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
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProduct = PRODUCTS.find((p) => p.id === selected)!;
  const isCustom = selected === "custom";
  const displayPrice = isCustom ? (Number(customAmount) || 0) : activeProduct.price;

  /**
   * handlePay — initiates payment for the selected product
   */
  const handlePay = async () => {
    try {
      setLoading(true);
      setError(null);

      const finalAmount = isCustom ? Number(customAmount) : activeProduct.price;
      const finalName = isCustom ? "Custom Payment" : activeProduct.name;

      if (!finalAmount || finalAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      console.log("🚀 Initiating payment for:", finalName, "Amount:", finalAmount);

      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          productName: finalName,
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
      if (displayPrice > 100_000) {
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

      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 w-full max-w-7xl mx-auto">
        {/* ---- Header ---- */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <div
              className="pulse-ring flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full"
              style={{ background: "var(--easypaisa-green)" }}
            >
              <span className="text-white text-xl md:text-2xl font-bold select-none">
                EP
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">Select Payment Plan</h1>
          <p className="text-sm md:text-base font-medium opacity-70" style={{ color: "var(--muted)" }}>
            Choose a preset plan or enter a custom amount
          </p>
        </div>

        {/* ---- Layout Wrapper ---- */}
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
          
          {/* ---- Left: Product Cards Grid ---- */}
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 max-h-[500px] lg:max-h-[700px] overflow-y-auto p-2 custom-scrollbar">
              {PRODUCTS.map((product) => {
                const isActive = selected === product.id;
                return (
                  <button
                    key={product.id}
                    id={`card-${product.id}`}
                    onClick={() => setSelected(product.id)}
                    className="relative rounded-3xl p-5 md:p-6 text-left transition-all duration-300 cursor-pointer border-2 group"
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
                      className="absolute top-4 right-4 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
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
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4">{product.icon}</div>

                    {/* Name */}
                    <h2 className="text-base md:text-lg font-bold mb-1">{product.name}</h2>

                    {/* Description */}
                    <p
                      className="text-[11px] md:text-xs mb-4 md:mb-5 leading-relaxed"
                      style={{ color: "var(--muted)" }}
                    >
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="text-2xl md:text-3xl font-extrabold"
                        style={{
                          color: isActive
                            ? "var(--easypaisa-green)"
                            : "var(--foreground)",
                        }}
                      >
                        {product.id === "custom" ? "Any" : formatPKR(product.price)}
                      </span>
                      <span
                        className="text-[10px] md:text-xs font-medium"
                        style={{ color: "var(--muted)" }}
                      >
                        PKR
                      </span>
                    </div>

                    {/* Selection indicator */}
                    <div
                      className="mt-4 md:mt-5 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{
                        background: isActive
                          ? "rgba(0,200,83,0.1)"
                          : "rgba(0,0,0,0.03)",
                        color: isActive
                          ? "var(--easypaisa-green)"
                          : "var(--muted)",
                      }}
                    >
                      {isActive ? "Selected" : "Select Plan"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- Right: Checkout Card ---- */}
          <div className="w-full lg:w-[400px] xl:w-[450px] order-1 lg:order-2 sticky top-8">
            <div
              className="w-full rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl border-t border-l"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
              }}
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Payment Summary
              </h3>

              {/* Order summary info */}
              <div
                className="rounded-2xl p-4 md:p-5 mb-6 border"
                style={{
                  background: "rgba(0,200,83,0.03)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">PLAN DETAILS</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{ background: "rgba(0,200,83,0.12)", color: "var(--easypaisa-green)" }}>
                    SANDBOX
                  </span>
                </div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-base md:text-lg mb-1">{isCustom ? "Custom Amount" : activeProduct.name}</p>
                    <p className="text-xs opacity-70 leading-relaxed">{isCustom ? "Pay exactly what you want" : activeProduct.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black" style={{ color: "var(--easypaisa-green)" }}>
                      {formatPKR(displayPrice)}
                    </p>
                    <p className="text-[10px] font-bold opacity-50">PKR TOTAL</p>
                  </div>
                </div>
              </div>

              {/* Custom Amount Input (Only shows if "custom" selected) */}
              {isCustom && (
                <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wider opacity-60">Enter Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold opacity-40">PKR</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border-2 border-black/5 dark:border-white/5 rounded-2xl py-4 pl-14 pr-4 text-xl font-bold focus:border-[var(--easypaisa-green)] focus:outline-none transition-all"
                      style={{ color: "var(--foreground)" }}
                    />
                  </div>
                  <p className="text-[10px] mt-2 opacity-50 px-1">Min: 1.00 PKR | Max: 20,00,000 PKR</p>
                </div>
              )}

              {/* Pay button */}
              <button
                id="pay-button"
                onClick={handlePay}
                disabled={loading}
                className="w-full py-4 md:py-5 rounded-2xl text-white font-bold text-lg
                           flex items-center justify-center gap-3
                           transition-all duration-300 cursor-pointer
                           disabled:opacity-60 disabled:cursor-not-allowed
                           shadow-lg active:scale-[0.98]"
                style={{
                  background: loading
                    ? "var(--easypaisa-green-dark)"
                    : "linear-gradient(135deg, var(--easypaisa-green), var(--easypaisa-green-dark))",
                  boxShadow: loading
                    ? "none"
                    : "0 10px 30px var(--easypaisa-green-glow)",
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Pay Securely Now
                  </>
                )}
              </button>

              {/* Error */}
              {error && (
                <div
                  className="mt-5 p-4 rounded-2xl text-xs font-semibold text-center border animate-shake"
                  style={{
                    background: "rgba(239,68,68,0.05)",
                    borderColor: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                  }}
                >
                  <span className="block mb-1">⚠️ Payment Failed</span>
                  {error}
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-dashed border-black/5 dark:border-white/5 flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 opacity-40 grayscale">
                  <div className="text-[10px] font-bold flex flex-col items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    SSL
                  </div>
                  <div className="text-[10px] font-bold flex flex-col items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    SECURE
                  </div>
                  <div className="text-[10px] font-bold flex flex-col items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    VERIFIED
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-center">
                  Easypaisa Direct Gateway v2.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
