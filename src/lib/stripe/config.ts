export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    price: 9, // EUR
    priceId: process.env.STRIPE_PRICE_STARTER,
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    credits: 50,
    price: 29, // EUR
    priceId: process.env.STRIPE_PRICE_GROWTH,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 150,
    price: 59, // EUR
    priceId: process.env.STRIPE_PRICE_PRO,
    popular: false,
  },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];
