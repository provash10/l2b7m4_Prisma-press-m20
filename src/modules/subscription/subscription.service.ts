import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";
import {
  handleCheckoutCompleted,
  handleChangeSubscription,
} from "./subscription.utils";

const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    //old subscriber
    let stripeCustomerId = user.subscription?.stripeCustomerId;

    //new subscriber
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_product_price_id,
          // price : 'price_1TpnsmAJ90wLdwKg3tkcgbCH',
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id },
    });

    console.log("Created Checkout Session Details:", {
      id: session.id,
      customer: session.customer,
      payment_status: session.payment_status,
      url: session.url,
      amount_total: session.amount_total,
      currency: session.currency,
    });

    return session.url;
  });

  return {
    paymentUrl: transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret
  );

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      await handleCheckoutCompleted(event.data.object);

      // if (userId && stripeCustomerId && subscriptionId) {
      //   const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);
      //   const currentPeriodEnd = new Date((subscriptionDetails as any).current_period_end * 1000);

      //   await prisma.subscription.upsert({
      //     where: { userId },
      //     update: {
      //       stripeCustomerId: stripeCustomerId as string,
      //       currentPeriodEnd,
      //       status: "ACTIVE",
      //     },
      //     create: {
      //       userId,
      //       stripeCustomerId: stripeCustomerId as string,
      //       currentPeriodEnd,
      //       status: "ACTIVE",
      //     },
      //   });

      //   console.log(`[Stripe Webhook] Subscription successfully created/updated in DB for user: ${userId}`);
      // }
      break;
    }
    case "customer.subscription.updated":
      await handleChangeSubscription(event.data.object)
      // const paymentObject = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;

      /*
To test this run this command in terminal
stripe subscriptions cancel sub_1PsYourSubIdHere (paste existinmg subscribed sub id)
*/

    case "customer.subscription.deleted":
      // const paymentObject = event.data.object;
      await handleChangeSubscription(event.data.object)

      break;
    default:
      // Unexpected event type
      console.log(`No event matched. Unhandled event type ${event.type}.`);
      break;
  }
};

const testRetrieve = async (subscriptionId: string) => {
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscriptionId
  );
  console.log("sub info from test route:", stripeSubscription);
  return stripeSubscription;
};



export const subscriptionService = {
  createCheckoutSession,
  handleWebhook,
  testRetrieve,
};
