import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace";

// export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
//   const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
//   const message = err.message || "Something went wrong";

//   res.status(statusCode).json({
//     success: false,
//     statusCode,
//     message,
//     error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
//   });
// };

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Error : ", err);

  let statusCode;
  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Internal Server Error";
  // let errorDetails = err.stack

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST; //["400_NAME"]
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Duplicate Key Error";
    }
  }else if(err.code === "2025"){
    statusCode =httpStatus.BAD_REQUEST,
    errorMessage= "An operation failed because it depends on one or more records that were required but not found"
  }else if (err instanceof Prisma.PrismaClientInitializationError){
    if(err.errorCode==="P1000"){
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Authentication Failed against database server.Please Check Your Credentials"
    }else if(err.errorCode="P1001"){
        statusCode=httpStatus.BAD_REQUEST;
        errorMessage = "Can't reach databae server";
    }
  }else if(err instanceof Prisma.PrismaClientKnownRequestError){
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error Occurred during query execution";
  }

  res.status(statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    // errorCode : err.code || null,  //no need
    name: errorName,
    message: errorMessage,
    error: err.stack,
  });
};
