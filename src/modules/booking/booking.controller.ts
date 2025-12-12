import { Request, Response } from "express";
import { bookingService } from "./booking.service";
import { JwtPayload } from "jsonwebtoken";

const createBooking = async (req: Request, res: Response) => {
  const loggedInUser = req.user;
  try {
    const result = await bookingService.createBooking(
      req.body,
      loggedInUser as JwtPayload
    );
    // console.log(result.rows);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "You are not allowed to book other's booking") {
      res.status(403).json({
        success: false,
        message: error?.message,
      });
    }
    if (
      error.message ===
        "Invalid Starting date, it can't be earlier than today" ||
      error.message ===
        "Invalid ending date, it can't be earlier than start date"
    ) {
      res.status(400).json({
        success: false,
        message: error?.message,
      });
    }
    if (error.message === "Invalid Vehicle information") {
      res.status(404).json({
        success: false,
        message: error?.message,
      });
    }
    if (error.message === "Vehicle is already booked") {
      res.status(409).json({
        success: false,
        message: error?.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

const getBooking = async (req: Request, res: Response) => {
  const loggedInUser = req.user;
  try {
    const result = await bookingService.getBooking(loggedInUser as JwtPayload);
    res.status(result.code).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: error,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const loggedInUser = req.user;
  const bookingId = req.params.bookingId;
  const { status } = req.body;
  try {
    const result = await bookingService.updateBooking(
      bookingId as string,
      loggedInUser as JwtPayload,
      req.body
    );
    if (result.type == "cancelled") {
      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: result.booking,
      });
    }
    if (result.type == "returned") {
      return res.status(200).json({
        success: true,
        message: "Booking marked as returned. Vehicle is now available",
        data: result.booking,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

export const bookingController = {
  createBooking,
  getBooking,
  updateBooking,
};
