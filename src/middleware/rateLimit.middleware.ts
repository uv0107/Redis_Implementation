import { Request, Response, NextFunction } from "express";
import { redisClient } from "../redis/client";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;



export async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // so each ip will gets it own counter in redis.
        // rate limit products:uv:123:request-count: 1 (it will increment the counter)
        // lets say if one user is crossing their limit ---it will not block the others.
        // it will only block the user who is crossing their limit.
        // REeal prod pattern will be build behind a proxy or cdn or load balancer.
        // so it is important to forward the x-forwarded-for header to get the original ip address.
        // but since this project is just for educational purpose so i am not going to do that.

        const ip = req.ip || "unknown";
        const rateLimitKey = `rate_limit:product:s${ip}`;

        const requestCount = await redisClient.incr(rateLimitKey);

        console.log("requestCount", requestCount);
        if (requestCount === 1) {
            await redisClient.expire(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS);

        }
        res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS);
        res.setHeader("X-RateLimit-Remaining",
            Math.max(0, RATE_LIMIT_MAX_REQUESTS - requestCount));

        if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
            res.status(429).json({
                success: "false",
                message: "TOO many requests.please try again after some seconds"
            })
            return; // <--- IMPORTANT: stops further execution
        }
        next();


    } catch (error) {
        console.log("rate limit middleware", error);
        next(error);
    }

}


