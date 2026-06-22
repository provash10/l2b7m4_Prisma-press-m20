import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors"
import config from "./config";
import { prisma } from "./lib/prisma";


const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials :true,
}))

app.use(express.json());
app.use(express.urlencoded({extended :true}));
app.use(cookieParser())

app.get("/",(req: Request,res: Response)=>{
    res.send("Hello World !!");
})


//Testing ok
// app.get("/",async(req: Request,res: Response)=>{
//     const user = await prisma.user.findMany()
//     console.log(user)
//     res.send("Hello World !!");
// })

export default app;