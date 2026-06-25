import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { userController } from "./user.controller";
import { jwtUtils } from "../../utlis/jwt";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

declare global {
    namespace Express {
        interface Request {
            user?:{
                email: string;
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}

router.post("/register", userController.registerUser);
router.get(
  "/me",
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.cookies);
   
    const { accessToken } = req.cookies;
    console.log(accessToken);

    //   const verifiedToken = jwt.verify(accessToken, config.jwt_access_secret);
    //   console.log(verifiedToken);

    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret
    );
    console.log(verifiedToken);

    if (typeof verifiedToken === "string") {
      throw new Error(verifiedToken);
    }

    const { email, name, id, role } = verifiedToken;
    //  const requiredRoles = ["ADMIN", "USER", "AUTHOR"];
    const requiredRoles = [Role.ADMIN, Role.USER, Role.AUTHOR];

    if(!requiredRoles.includes(role)){
        return res.status(403).json({
            success:false,
            statusCode: httpStatus.FORBIDDEN,
            message: "Forbidden. You don't have permisson to access this resource"
        })
    }
    // res.status(200).json({
    //     success: true,
    //     statusCode: 200,
    //     message: "User Profile Retrived Successfully."
    // })

    req.user ={
        email,
        name,
        id,
        role
    };
     next();
  },
  
  userController.getMyProfile
);
export const userRoutes = router;
