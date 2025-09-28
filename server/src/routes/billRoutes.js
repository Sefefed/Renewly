import { Router } from "express";
import {
  createBill,
  getUserBills,
  getBill,
  updateBill,
  markBillPaid,
  deleteBill,
} from "../controllers/billController.js";
import authorize from "../middleware/authMiddleware.js";

const billRouter = Router();

billRouter.use(authorize); // All bill routes require authentication

billRouter.post("/", createBill);
billRouter.get("/", getUserBills);
billRouter.get("/:id", getBill);
billRouter.put("/:id", updateBill);
billRouter.patch("/:id/paid", markBillPaid);
billRouter.delete("/:id", deleteBill);

export default billRouter;
