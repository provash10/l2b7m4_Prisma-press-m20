import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/checkout",
    auth(Role.USER,Role.AUTHOR,Role.ADMIN),
     subscriptionController.createCheckoutSession)

router.get("/test-retrieve/:id", subscriptionController.testRetrieveSubscription);

router.post("/webhook",subscriptionController.handleWebBook);


export const subscriptionRoutes = router