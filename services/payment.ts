/**
 * DEFRAG — Payment Service
 * 
 * Uses Stripe Payment Links for a zero-backend checkout flow.
 * 
 * Products (create in Stripe Dashboard → Products):
 *  1. THE BLUEPRINT — $29.00 one-time
 *     "Comprehensive mechanical diagnostic and alchemical inversion protocol."
 *  2. THE ORBIT — $19.00/month subscription
 *     "Real-time relational physics and 3-body triangulation analysis."
 * 
 * After creating each product, generate a Payment Link and paste the URLs below.
 * 
 * Stripe Branding (dashboard.stripe.com/settings/branding):
 *  - Accent: #E2E2E8  |  Background: #050505  |  Buttons: Rounded  |  Font: Inter
 */

const PAYMENT_LINKS: Record<string, string> = {
  BLUEPRINT: 'https://buy.stripe.com/PLACEHOLDER_BLUEPRINT',  // $29 one-time
  ORBIT:     'https://buy.stripe.com/PLACEHOLDER_ORBIT',       // $19/mo
};

/**
 * Redirect the user to a Stripe Payment Link checkout page.
 * @param tier - The product tier to purchase
 */
export const initiateCheckout = (tier: 'BLUEPRINT' | 'ORBIT'): void => {
  const url = PAYMENT_LINKS[tier];

  if (!url || url.includes('PLACEHOLDER')) {
    console.warn(
      `[DEFRAG PAYMENT] No live Payment Link configured for tier "${tier}". ` +
      `Update PAYMENT_LINKS in services/payment.ts with your Stripe URLs.`
    );
    // In development, show a helpful alert instead of silently failing
    if (import.meta.env.DEV) {
      alert(
        `Payment link for "${tier}" is not configured yet.\n\n` +
        `To set up:\n` +
        `1. Create the product in your Stripe Dashboard\n` +
        `2. Generate a Payment Link\n` +
        `3. Paste the URL into services/payment.ts`
      );
    }
    return;
  }

  // Redirect to Stripe-hosted checkout
  window.location.href = url;
};
