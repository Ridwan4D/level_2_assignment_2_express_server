import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middleware/auth";

const router = Router();
const { createBooking, getBooking, updateBooking } = bookingController;

router.post("/", auth("admin", "customer"), createBooking);
router.get("/", auth("admin", "customer"), getBooking);
router.put("/:bookingId", auth("admin", "customer"), updateBooking);

export const bookingRouter = router;
