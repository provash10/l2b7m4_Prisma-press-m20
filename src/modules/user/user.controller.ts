import { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import httpStatus  from "http-status";
import config from "../../config";
import { userService } from "./user.service";
import { catchAsync } from "../../utlis/catchAsync";
import { sendResponse } from "../../utlis/sendResponse";
import jwt from "jsonwebtoken";
import { jwtUtils } from "../../utlis/jwt";



// const registerUser = async(req:Request, res:Response)=>{
//     // const payload =req.body;
//     // console.log(payload);
//     try {
//     //   const {name,email,password,profilePhoto,bio} =req.body;
//     const payload =req.body;
//     // console.log(req.body);

//     const user = await userService.registerUserIntoDB(payload)
    
//     res.status(httpStatus.CREATED).json({
//         success : true,
//         statusCode : httpStatus.CREATED,
//         message:"User registered successfully",
//         data : {
//             user
//         }
//     })
//     } catch (error) {
//         console.log(error)
//       res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//             success: false,
//             statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//             message: "Failed To Register User",
//            error: (error as Error).message || "Something went wrong!"
//         });
//     }
// }



const registerUser = catchAsync(async(req:Request, res:Response,next:NextFunction)=>{
    const payload =req.body;
 // console.log(req.body);
    const user = await userService.registerUserIntoDB(payload);

    // res.status(httpStatus.CREATED).json({
    //     success : true,
    //     statusCode : httpStatus.CREATED,
    //     message:"User registered successfully",
    //     data : {
    //         user
    //     }
    // })

    sendResponse(res,{
        success : true,
        statusCode: httpStatus.CREATED,
        message: " User registered successfully",
        data: {user}
    })
})

const getMyProfile = catchAsync(async(req:Request, res:Response,next:NextFunction)=>{

    // const cookies = req.cookies;
    // console.log(cookies);

    //  const {accessToken} = req.cookies;
    //   console.log(accessToken);
    // console.log(req.user, "user request");

    //   const verifiedToken = jwt.verify(accessToken, config.jwt_access_secret);
    //   console.log(verifiedToken);

    //  const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)
    //  console.log(verifiedToken);

    //  if(typeof verifiedToken === "string"){
    //     throw new Error(verifiedToken);
    //  }

    //  const profile = await userService.getMyProfileFromDB(verifiedToken.id)
    const profile = await userService.getMyProfileFromDB(req.user?.id as string)
    
     // res.send("Get My Profile")

     sendResponse(res,{
        success :true,
        statusCode: httpStatus.OK,
        message : "User Profile fetched Successfully",
        data: {profile}
     })
})


const updateMyProfile = catchAsync(async(req:Request, res:Response,next:NextFunction)=>{
    const userId = req.user?.id as string;

    const payload = req.body;

    const updatedProfile = await userService.updateMyProfileFromDB(userId,payload);

    sendResponse(res,{
        success : true,
        statusCode: httpStatus.OK,
        message: "User Profile Updated Successfully.",
        data: {updatedProfile}
    })
})


export const userController ={
    registerUser,
    getMyProfile,
    updateMyProfile,
}