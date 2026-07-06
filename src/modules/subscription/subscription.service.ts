import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include:{
        subscription: true,
      },
    });
    
    //old subscriber
    let stripeCustomerId = user.subscription?.stripeCustomerId

    //new subscriber
    if(!stripeCustomerId){
      const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id 
    }

    const session = await stripe.checkout.sessions.create({
        line_items : [
            {
                price: config.stripe_product_price_id,
                // price : 'price_1TpnsmAJ90wLdwKg3tkcgbCH',
                quantity : 1
            }
        ],
        mode : "subscription",
        customer : stripeCustomerId,
        payment_method_types : ["card"],
        success_url:`${config.app_url}/premium?success=true`,
        cancel_url: `${config.app_url}/payment?success=false`,
        metadata: {userId : user.id}
    })

    console.log("Created Checkout Session Details:", {
      id: session.id,
      customer: session.customer,
      payment_status: session.payment_status,
      url: session.url,
      amount_total: session.amount_total,
      currency: session.currency
    });

    return session.url

  });

  return {
    paymentUrl :transactionResult
  }
};

const handleWebhook =async(payload : Buffer, signature : string)=>{
 
  const endpointSecret= config.stripe_webhook_secret
  const event = stripe.webhooks.constructEvent(
   payload,
    signature,
    endpointSecret
  )

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
     
      await handleCheckoutCompleted(event.data.object)

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
    case 'customer.subscription.updated':
      // const paymentObject = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;

      case 'customer.subscription.deleted':
        // const paymentObject = event.data.object;

        break;
    default:
      // Unexpected event type
      console.log(`No event matched. Unhandled event type ${event.type}.`);
      break;
  }


}

const testRetrieve = async (subscriptionId: string) => {
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("sub info from test route:", stripeSubscription);
  return stripeSubscription;
};

const getPeriodEnd = (payload : Stripe.Subscription) =>{
     const currentPeriodEndInMiliseconds = payload.items.data[0]?.current_period_end!

      const currentPeriodEnd = new Date(currentPeriodEndInMiliseconds * 1000) 
      console.log(currentPeriodEnd, "End")
      return currentPeriodEnd;
}

const handleCheckoutCompleted = async (session : Stripe.Checkout.Session)=>{
  //  console.log(event.data.object);
      // const session : Stripe.Checkout.Session = event.data.object
      const userId = session.metadata?.userId;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription as string;
      
      if(!userId || !stripeSubscriptionId || !stripeCustomerId){
        throw new Error("Webhook Failed")
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      console.log("sub info", stripeSubscription.items.data[0]);
      // const currentPeriodStart = stripeSubscription.items.data[0]?.current_period_start

      // const currentPeriodEndInMiliseconds = stripeSubscription.items.data[0]?.current_period_end!

      // const currentPeriodEnd = new Date(currentPeriodEndInMiliseconds * 1000) 
      // console.log(currentPeriodEnd, "End")

      const currentPeriodEnd = getPeriodEnd(stripeSubscription)
      
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
}

export const subscriptionService = {
  createCheckoutSession,
  handleWebhook,
  testRetrieve
};


