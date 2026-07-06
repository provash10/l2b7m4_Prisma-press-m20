import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utlis/catchAsync";
import { jwtUtils } from "../utlis/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

//auth(Role.ADMIN, Role.USER, Role.Author)
//auth()=>...requiredRoles=>[Role.ADMIN, Role.USER, Role.Author]
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const getTokenFromRequest = (): string | undefined => {
      const cookieToken =
        req.cookies?.accessToken || req.cookies?.token || req.cookies?.jwt;
      if (typeof cookieToken === "string" && cookieToken.trim()) {
        return cookieToken.trim();
      }

      const cookieHeader = req.get("cookie");
      if (typeof cookieHeader === "string" && cookieHeader.trim()) {
        const cookies = cookieHeader
          .split(";")
          .map((entry) => entry.trim())
          .filter(Boolean)
          .reduce<Record<string, string>>((acc, entry) => {
            const [key, ...rest] = entry.split("=");
            if (key) {
              acc[key] = decodeURIComponent(rest.join("=")).trim();
            }
            return acc;
          }, {});

        for (const key of ["accessToken", "token", "jwt"]) {
          const value = cookies[key];
          if (typeof value === "string" && value.trim()) {
            return value.trim();
          }
        }
      }

      const authHeader = req.get("authorization");
      if (typeof authHeader === "string" && authHeader.trim()) {
        const [scheme, ...rest] = authHeader.trim().split(" ");
        if (scheme?.toLowerCase() === "bearer" && rest.join(" ").trim()) {
          return rest.join(" ").trim();
        }

        return authHeader.trim();
      }

      const headerCandidates = [
        req.headers.authorization,
        req.headers["x-access-token"],
        req.headers["x-auth-token"],
        req.headers.token,
        req.headers["access-token"],
        req.headers.jwt,
        req.headers["x-jwt-token"],
      ];

      for (const candidate of headerCandidates) {
        if (Array.isArray(candidate)) {
          const value = candidate.find(
            (item): item is string =>
              typeof item === "string" && item.trim().length > 0
          );
          if (value) {
            return value.trim();
          }
        }

        if (typeof candidate === "string" && candidate.trim()) {
          return candidate.trim();
        }
      }

      const queryToken = req.query?.token;
      if (typeof queryToken === "string" && queryToken.trim()) {
        return queryToken.trim();
      }

      const bodyToken = req.body?.accessToken || req.body?.token;
      if (typeof bodyToken === "string" && bodyToken.trim()) {
        return bodyToken.trim();
      }

      return undefined;
    };

    const token = getTokenFromRequest();

    if (!token) {
      throw new Error(
        "You are not logged in. Please log in to access this resource"
      );
    }

    // const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret)
    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
    console.log(verifiedToken);

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }
    // if (typeof verifiedToken === "string") {
    //   throw new Error(verifiedToken);
    // }

    // const { email, name, id, role } = verifiedToken;
    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden. You don't have permission to access this resource"
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });

    if (!user) {
      throw new Error("User not found. Please log in again");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked.Please contact support");
    }

    req.user = {
      email,
      name,
      id,
      role,
    };

    next();
  });
};
