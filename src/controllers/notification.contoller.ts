import { Request, Response, NextFunction } from "express";
import { publishNotification } from "../subscribers/notification.subscriber"

export async function publishNotificationController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { title, message } = req.body;
        const notification = {
            id: Date.now().toString(),
            title,
            message,
            createdAt: new Date().toISOString()
        }
        await publishNotification(notification);
        return res.status(200).json({ success: true, message: "notification published successfully" })
    } catch (error) {
        console.log("error publishing notification:", error);
        next(error)
    }

}
