import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: "Route not found",
    data: null,
  });

}