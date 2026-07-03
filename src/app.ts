import cookieParser from "cookie-parser";
import express, {
  Application,
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import config from "./config";
import { prisma } from "./lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.routes";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comment/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Prisma Press 4-20!!");
});

//Testing ok
// app.get("/",async(req: Request,res: Response)=>{
//     const user = await prisma.user.findMany()
//     console.log(user)
//     res.send("Hello World !!");
// })

// app.post()
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// app.use((req: Request, res: Response) => {
//   res.status(httpStatus.NOT_FOUND).json({
//     success: false,
//     statusCode: httpStatus.NOT_FOUND,
//     message: "Route not found",
//     data: null,
//   });
// });
app.use(notFound);

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   // const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
//   // const message = err.message || "Something went wrong";

//   console.log(err)
//   res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//                 success : false,
//                 statusCode:httpStatus.INTERNAL_SERVER_ERROR,
//                 message:err.message,
//                 error: err
// });

// })

app.use(globalErrorHandler)

export default app;
