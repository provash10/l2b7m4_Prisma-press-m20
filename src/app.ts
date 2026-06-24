import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors"
import config from "./config";
import { prisma } from "./lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.routes";


const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials :true,
}))

app.use(express.json());
app.use(express.urlencoded({extended :true}));
app.use(cookieParser());

app.get("/",(req: Request,res: Response)=>{
    res.send("Prisma Press 4-20!!");
})


//Testing ok
// app.get("/",async(req: Request,res: Response)=>{
//     const user = await prisma.user.findMany()
//     console.log(user)
//     res.send("Hello World !!");
// })

// app.post()
app.use("/api/users",userRoutes)
app.use("/api/auth",authRoutes)

export default app;