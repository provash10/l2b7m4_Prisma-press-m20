import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
  });
};