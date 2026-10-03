import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware";

const router = Router();

router.use(rateLimitMiddleware);

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.patch("/:id", productController.updateProduct);

export default router;
