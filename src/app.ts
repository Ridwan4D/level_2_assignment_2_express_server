import express, { Request, Response } from "express";
import initDB from "./config/db";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouters } from "./modules/user/user.routes";
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";
import { bookingRouter } from "./modules/booking/booking.routes";

const app = express();

//? parser
app.use(express.json());

//? DB
initDB();

//? app route
app.get("/", (req: Request, res: Response) => {
  res.send("Express server is running");
});

//? auth route
app.use("/api/v1/auth", authRouter);

//? user route
app.use("/api/v1/users", userRouters);

//? vehicle route
app.use("/api/v1/vehicles", vehicleRouter);

//? booking route
app.use("/api/v1/bookings", bookingRouter);

export default app;
