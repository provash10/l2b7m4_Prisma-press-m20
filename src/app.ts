import cookieParser from "cookie-parser";
import express, {
  Application,
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import config from "./config";
import { prisma } from "./lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.routes";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comment/comment.route";
import { premiumRoutes } from "./modules/premium/premium.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";
import prismaConfig from "../prisma.config";
import { stripe } from "./lib/stripe";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toLocaleTimeString()}] [${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

const endpointSecret = config.stripe_webhook_secret;

// app.use(
//   "/api/subscription/webhook",
//   express.raw({ type: "application/json" }),
//   async (request, response) => {
//     try {
//       let event = request.body;
//       console.log("[STRIPE] Webhook received");
//       console.log("[STRIPE] Request body:", event);
//       console.log("[STRIPE] Headers:", request.headers);

//       // Only verify the event if you have an endpoint secret defined.
//       // Otherwise use the basic event deserialized with JSON.parse
//       if (endpointSecret) {
//         // Get the signature sent by Stripe
//         const signature = request.headers["stripe-signature"];
//         if (!signature) {
//           console.error("[STRIPE ERROR] Missing stripe-signature header");
//           return response.status(400).json({
//             message: "Missing stripe-signature header",
//           });
//         }

//         try {
//           event = stripe.webhooks.constructEvent(
//             request.body,
//             signature,
//             endpointSecret
//           );
//           console.log("[STRIPE] Signature verified successfully");
//         } catch (err: any) {
//           console.error(
//             "[STRIPE ERROR] Webhook signature verification failed:",
//             err.message
//           );
//           console.error("[STRIPE ERROR] Stack:", err.stack);
//           return response.status(400).json({
//             message: err.message,
//           });
//         }
//       }

//       console.log("[STRIPE] Event type:", event.type);

//       // Handle the event
//       switch (event.type) {
//         case "payment_intent.succeeded":
//           const paymentIntent = event.data.object;
//           console.log(
//             `[STRIPE] PaymentIntent for ${paymentIntent.amount} was successful!`
//           );
//           console.log("[STRIPE] Payment Intent data:", paymentIntent);
//           // Then define and call a method to handle the successful payment intent.
//           // handlePaymentIntentSucceeded(paymentIntent);
//           break;
//         case "payment_method.attached":
//           const paymentMethod = event.data.object;
//           console.log("[STRIPE] Payment method attached:", paymentMethod);
//           // Then define and call a method to handle the successful attachment of a PaymentMethod.
//           // handlePaymentMethodAttached(paymentMethod);
//           break;
//         default:
//           // Unexpected event type
//           console.log(`[STRIPE] Unhandled event type: ${event.type}`);
//       }

//       // Return a 200 response to acknowledge receipt of the event
//       response.status(200).send({ success: true });
//     } catch (error: any) {
//       console.error(
//         "[STRIPE ERROR] Unexpected error in webhook handler:",
//         error.message
//       );
//       console.error("[STRIPE ERROR] Stack:", error.stack);
//       response.status(500).json({
//         message: "Internal server error",
//         error: error.message,
//       });
//     }
//   }
// );

//
app.use("/api/subscription/webhook", express.raw({type: 'application/json'}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug endpoint to verify logging works
app.get("/api/test-log", (req: Request, res: Response) => {
  console.log("[TEST] This is a test log message");
  console.error("[TEST ERROR] This is a test error message");
  res.json({ message: "Check terminal for [TEST] logs" });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Prisma Press 4-20!!");
});

//Testing ok
// app.get("/",async(req: Request,res: Response)=>{
//     const user = await prisma.user.findMany()
//     console.log(user)
//     res.send("Hello World !!");
// })

// app.post()
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/premium", premiumRoutes);

// app.use((req: Request, res: Response) => {
//   res.status(httpStatus.NOT_FOUND).json({
//     success: false,
//     statusCode: httpStatus.NOT_FOUND,
//     message: "Route not found",
//     data: null,
//   });
// });
app.use(notFound);

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   // const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
//   // const message = err.message || "Something went wrong";

//   console.log(err)
//   res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//                 success : false,
//                 statusCode:httpStatus.INTERNAL_SERVER_ERROR,
//                 message:err.message,
//                 error: err
// });

// })

app.use(globalErrorHandler);

export default app;
