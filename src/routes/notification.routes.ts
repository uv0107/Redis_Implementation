import { Router } from "express";
import * as notificationController from "../controllers/notification.contoller";

const router = Router();

router.post("/", notificationController.publishNotificationController);

export default router;