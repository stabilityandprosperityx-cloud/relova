// NOWPayments payment links — replace with your real NOWPayments URLs
export const PAYMENT_LINKS = {
  pro: "https://nowpayments.io/payment/?api_key=YOUR_KEY&price_amount=19&price_currency=usd&order_id=pro_monthly&order_description=Relova%20Pro%20Plan",
  full: "https://nowpayments.io/payment/?api_key=YOUR_KEY&price_amount=49&price_currency=usd&order_id=full_monthly&order_description=Relova%20Full%20Plan",
} as const;

export function openPayment(plan: "pro" | "full") {
  window.open(PAYMENT_LINKS[plan], "_blank", "noopener");
}
