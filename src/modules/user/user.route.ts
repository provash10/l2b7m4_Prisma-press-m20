import { Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import httpStatus  from "http-status";
import { userController } from "./user.controller";


const router =Router();

router.post("/register",userController.registerUser )

export const userRoutes = router;