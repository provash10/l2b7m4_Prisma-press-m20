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

export const subscriptionController = {
    createCheckoutSession
}