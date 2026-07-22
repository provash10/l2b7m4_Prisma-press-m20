import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync";
import { premiumService } from "./premium.service";
import { sendResponse } from "../../utlis/sendResponse";
import httpStatus from "http-status";

const getPremiumPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await premiumService.getPremiumPosts();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Premium Posts Retrieved Successfully",
      data: result,
    });
  }
);

export const premiumController = {
  getPremiumPosts,
};
