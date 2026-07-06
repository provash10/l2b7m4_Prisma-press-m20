import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

export const getPeriodEnd = (payload: Stripe.Subscription) => {
  const currentPeriodEndInMiliseconds =
    payload.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndInMiliseconds * 1000);
  console.log(currentPeriodEnd, "End");
  return currentPeriodEnd;
};

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  //  console.log(event.data.object);
  // const session : Stripe.Checkout.Session = event.data.object
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription as string;

  if (!userId || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error("Webhook Failed");
    console.log("Webhook : Missing values for creating checkout session");

    return
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  );
  console.log("sub info", stripeSubscription.items.data[0]);
  // const currentPeriodStart = stripeSubscription.items.data[0]?.current_period_start

  // const currentPeriodEndInMiliseconds = stripeSubscription.items.data[0]?.current_period_end!

  // const currentPeriodEnd = new Date(currentPeriodEndInMiliseconds * 1000)
  // console.log(currentPeriodEnd, "End")

  const currentPeriodEnd = getPeriodEnd(stripeSubscription);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: stripeCustomerId as string,
      stripeSubscriptionId,
      currentPeriodEnd,
      status: "ACTIVE",
    },
    create: {
      userId,
      stripeCustomerId: stripeCustomerId as string,
      stripeSubscriptionId,
      currentPeriodEnd,
      status: "ACTIVE",
    },
  });
};

export const handleChangeSubscription = async (payload: Stripe.Subscription) => {
  const stripeSubscriptionId = payload.id;
  const status =
    payload.status === "active"
      ? SubscriptionStatus.ACTIVE
      : payload.status === "trialing"
      ? SubscriptionStatus.ACTIVE
      : payload.status === "canceled"
      ? SubscriptionStatus.CANCELED
      : SubscriptionStatus.EXPIRED;

  const currentPeriodEnd = getPeriodEnd(payload);

  const isSubscriptionExist = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId,
    },
  });

  if(!isSubscriptionExist){
    console.log(`Webhook : No Subscription found for subscription id : ${
      stripeSubscriptionId
    }`)

     return
  }

  await prisma.subscription.update({
    where : {
      stripeSubscriptionId
    },
    data : {
      status,
      currentPeriodEnd
    }
  })
 
};