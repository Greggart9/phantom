import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const isStripeConfigured = Boolean(
  stripeSecretKey && !stripeSecretKey.includes('placeholder')
);

export const stripe = isStripeConfigured
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any
    })
  : null;
