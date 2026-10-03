import { error } from 'console';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { redisClient } from '../redis/client';


const notification_channel = "notifications";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export interface notificationPayload {
    id: string;
    title: string;
    message: string;
    createdAt: string
}

export async function publishNotification(notification: notificationPayload): Promise<void> {

    await redisClient.publish(notification_channel, JSON.stringify(notification))

    console.log("notification published:", notification);

}

const subsciberClient = createClient({ url: redisUrl });

subsciberClient.on("error", (err) => {
    console.error("subscriber client error:", err)
})

async function startNotificationSubscriber() {
    await subsciberClient.connect();
    await subsciberClient.subscribe(notification_channel, (message) => {
        try {
            const notification = JSON.parse(message) as notificationPayload;
            console.log("notification received:");
            console.log("title: ", notification.title)
            console.log("message: ", notification.message)
            console.log("--------------------------------")

        } catch (error) {
            console.log("error parsing notification:", error)
        }
    })
}

startNotificationSubscriber().catch((err) => {
    console.log("notification subscriber failed:", err);
    process.exit(1);
})