import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utlis/sendResponse";
import httpStatus from "http-status";

const loginUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const payload = req.body;

    // const loginResult = await authService.loginUser(payload);
    const {accessToken, refreshToken} = await authService.loginUser(payload);

    res.cookie("accessToken",accessToken,{
        httpOnly: true,
        secure : false,
        sameSite: "none",
        maxAge : 1000 * 60 * 60 *24 // 24 hours or 1 day
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly: true,
        secure : false,
        sameSite: "none",
        maxAge : 1000 * 60 * 60 *24 * 7 // 7 days
    })

    sendResponse(res,{
        success : true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        // data: loginResult,
        data: {accessToken, refreshToken},
    });
});

export const authController= {
    loginUser
}