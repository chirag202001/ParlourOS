// Pluggable payment provider interface

export interface CreateOrderPayload {
  amount: number; // in smallest unit (paise for INR)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  providerOrderId?: string;
  error?: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface CreateSubscriptionPayload {
  planId: string;
  customerId?: string;
  totalCount: number;
  notes?: Record<string, string>;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  shortUrl?: string;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  createOrder(payload: CreateOrderPayload): Promise<OrderResult>;
  verifyPayment(payload: VerifyPaymentPayload): Promise<boolean>;
  createSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}

// ─── Razorpay Provider (stub implementation) ─────────────────

export class RazorpayProvider implements PaymentProvider {
  name = 'razorpay';

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    console.log(`[Razorpay STUB] Creating order:`, payload);
    // In production:
    // const Razorpay = require('razorpay');
    // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create(payload);
    return {
      success: true,
      orderId: `order_${Date.now()}`,
      providerOrderId: `rzp_order_${Date.now()}`,
    };
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<boolean> {
    console.log(`[Razorpay STUB] Verifying payment:`, payload);
    // In production: verify signature using crypto
    return true;
  }

  async createSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResult> {
    console.log(`[Razorpay STUB] Creating subscription:`, payload);
    return {
      success: true,
      subscriptionId: `sub_${Date.now()}`,
      shortUrl: 'https://rzp.io/stub',
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    console.log(`[Razorpay STUB] Cancelling subscription:`, subscriptionId);
    return true;
  }
}

// ─── Stripe Provider (fallback stub) ─────────────────────────

export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    console.log(`[Stripe STUB] Creating payment intent:`, payload);
    return {
      success: true,
      orderId: `pi_${Date.now()}`,
      providerOrderId: `stripe_pi_${Date.now()}`,
    };
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<boolean> {
    return true;
  }

  async createSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResult> {
    return {
      success: true,
      subscriptionId: `sub_stripe_${Date.now()}`,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }
}

// Factory
export function getPaymentProvider(provider = 'razorpay'): PaymentProvider {
  switch (provider) {
    case 'razorpay':
      return new RazorpayProvider();
    case 'stripe':
      return new StripeProvider();
    default:
      return new RazorpayProvider();
  }
}
