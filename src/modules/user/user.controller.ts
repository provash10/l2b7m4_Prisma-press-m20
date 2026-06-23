import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import httpStatus  from "http-status";
import config from "../../config";
import { userService } from "./user.service";

const registerUser = async(req:Request, res:Response)=>{
    // const payload =req.body;
    // console.log(payload);
    try {
    //   const {name,email,password,profilePhoto,bio} =req.body;
    const payload =req.body;
    // console.log(req.body);

    const user = await userService.registerUserIntoDB(payload)
    
    res.status(httpStatus.CREATED).json({
        success : true,
        statusCode : httpStatus.CREATED,
        message:"User registered successfully",
        data : {
            user
        }
    })
    } catch (error) {
        console.log(error)
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed To Register User",
           error: (error as Error).message || "Something went wrong!"
        });
    }
}


export const userController ={
    registerUser,
}