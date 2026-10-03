import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({ url: redisUrl })

// callbacks before proceeding

redisClient.on("error", (err) => console.log("Redis Client Error:", err));

redisClient.on("connect", () => {
    console.log("Redis Client Connected!");
})

redisClient.on("ready", () => {
    console.log("Redis Client Ready!")
})

redisClient.on("reconnecting", () => {
    console.log("Redis Client Reconnecting...");
})

redisClient.on("end", () => {
    console.log("Redis Client Disconnected!")
})

export async function connectToRedis(): Promise<void> {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    const pong = await redisClient.ping();
    console.log("redis ping responses as ", pong);

}

export async function disconnectRedis(): Promise<void> {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}
