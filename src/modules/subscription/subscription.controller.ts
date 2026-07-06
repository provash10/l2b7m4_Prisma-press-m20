import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync";
import { subscriptionService } from "./subscription.service";
import httpStatus from "http-status";
import { sendResponse } from "../../utlis/sendResponse";

const createCheckoutSession = catchAsync(
    async(req: Request, res: Response, next:NextFunction)=>{
        const userId = req.user?.id;

        const result = await subscriptionService.createCheckoutSession(userId as string);

        sendResponse(res, {
            success : true,
            statusCode : httpStatus.OK,
            message : "Checkout Compeleted Successfully",
            data: result
        })
    }
)

const handleWebBook = catchAsync(
    async(req: Request, res: Response, next: NextFunction) =>{
        const event =req.body as Buffer;
        const signature = req.headers['stripe-signature']!;

        await subscriptionService.handleWebhook(event, signature as string);

        sendResponse(res, {
            success : true,
            statusCode: 200,
            message : "Webhook Triggered Successfully",
            data: null
    })
    
    }
)

const testRetrieveSubscription = catchAsync(
    async(req: Request, res: Response, next: NextFunction) =>{
        const subscriptionId = req.params.id as string;
        const result = await subscriptionService.testRetrieve(subscriptionId);

        sendResponse(res, {
            success : true,
            statusCode: httpStatus.OK,
            message : "Subscription Retrieved Successfully",
            data: result
        })
    }
)

export const subscriptionController = {
    createCheckoutSession,
    handleWebBook,
    testRetrieveSubscription
}