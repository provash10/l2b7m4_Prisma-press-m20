import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utlis/sendResponse";
import httpStatus from "http-status";

const loginUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const payload = req.body;

    const loginResult = await authService.loginUser(payload);

    sendResponse(res,{
        success : true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        data: loginResult,
    });
});

export const authController= {
    loginUser
}