import { Router } from "express";
import { createPayment, deletePayment, getPayments } from "../controllers/paymentController";

const router = Router();

router.get("/", getPayments);
router.post("/", createPayment);
router.delete("/:id", deletePayment);

export default router;
