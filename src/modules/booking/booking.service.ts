import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

type Booking = {
  customer_id: string;
  vehicle_id: string;
  rent_start_date: string;
  rent_end_date: string;
};
const createBooking = async (payload: Booking, loggedInUser: JwtPayload) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    customer_id,
  ]);
  if (loggedInUser.id != user.rows[0].id) {
    throw new Error("You are not allowed to book other's booking");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(rent_start_date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(rent_end_date);
  endDate.setHours(0, 0, 0, 0);

  if (startDate < today) {
    throw new Error("Invalid Starting date, it can't be earlier than today");
  }
  if (endDate < startDate) {
    throw new Error("Invalid ending date, it can't be earlier than start date");
  }
  const rentDays =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  const theVehicle = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [
    vehicle_id,
  ]);
  if (theVehicle.rows.length === 0) {
    throw new Error("Invalid Vehicle information");
  } else if (theVehicle.rows[0].availability_status === "booked") {
    throw new Error("Vehicle is already booked");
  } else {
    const vehicleInfo = theVehicle.rows[0];

    const total_price = vehicleInfo.daily_rent_price * rentDays;
    const status = "active";
    const vehicle = {
      vehicle_name: vehicleInfo.vehicle_name,
      daily_rent_price: vehicleInfo.daily_rent_price,
    };

    const result = await pool.query(
      `
            INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
        `,
      [
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        total_price,
        status,
      ]
    );
    const vehicleStatus = "booked";
    const vehicleResult = await pool.query(
      `UPDATE vehicles SET availability_status=$1 WHERE id=$2`,
      [vehicleStatus, vehicle_id]
    );
    console.log({ vehicleResult });
    const booking = await result?.rows[0];
    console.log({ booking });
    return { ...booking, vehicle };
  }
};

const getBooking = async (loggedInUser: JwtPayload) => {
  // ADMIN SECTION
  if (loggedInUser.role === "admin") {
    const result = await pool.query(`SELECT * FROM bookings`);
    const bookings = result.rows;

    console.log(bookings);
    // Add vehicle + customer details inside loop
    for (let booking of bookings) {
      const vehicle = await pool.query(
        `SELECT vehicle_name, registration_number FROM vehicles WHERE id=$1`,
        [booking.vehicle_id]
      );

      const customer = await pool.query(
        `SELECT name, email FROM users WHERE id=$1`,
        [booking.customer_id]
      );

      booking.customer = customer.rows[0];
      booking.vehicle = vehicle.rows[0];
      console.log(vehicle, customer);
    }

    return {
      success: true,
      code: 200,
      message: "Bookings retrieved successfully",
      data: bookings,
    };
  }

  // CUSTOMER SECTION
  const result = await pool.query(
    `SELECT * FROM bookings WHERE customer_id=$1`,
    [loggedInUser.id]
  );

  const bookings = result.rows;

  for (let booking of bookings) {
    const vehicle = await pool.query(
      `SELECT vehicle_name, registration_number, type FROM vehicles WHERE id=$1`,
      [booking.vehicle_id]
    );
    booking.vehicle = vehicle.rows[0];
    delete booking.customer_id; // optional
  }

  return {
    success: true,
    code: 200,
    message: "Your bookings retrieved successfully",
    data: bookings,
  };
};

const updateBooking = async (
  bookingId: string,
  user: JwtPayload,
  payload: { status?: string }
) => {
  // 1. Fetch booking
  const bookingResult = await pool.query(
    `SELECT * FROM bookings WHERE id = $1`,
    [bookingId]
  );

  if (bookingResult.rowCount === 0) {
    throw new Error("Booking not found");
  }

  const booking = bookingResult.rows[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rentStart = new Date(booking.rent_start_date);
  rentStart.setHours(0, 0, 0, 0);
  if (user.role === "customer") {
    if (booking.customer_id !== user.id) {
      throw new Error("You are not allowed to modify this booking");
    }
    if (payload.status === "cancelled") {
      if (today >= rentStart) {
        console.log("loading");
        throw new Error("You cannot cancel a booking that has already started");
      }
      const updated = await pool.query(
        `UPDATE bookings SET status='cancelled' WHERE id=$1 RETURNING *`,
        [bookingId]
      );
      console.log(updated);
      return {
        type: "cancelled",
        booking: updated.rows[0],
      };
    }
  }

  if (user.role === "admin") {
    if (payload.status === "returned") {
      const updatedBooking = await pool.query(
        `UPDATE bookings SET status='returned' WHERE id=$1 RETURNING *`,
        [bookingId]
      );
      const updatedVehicle = await pool.query(
        `UPDATE vehicles SET availability_status='available' WHERE id=$1 RETURNING availability_status `,
        [booking.vehicle_id]
      );
      return {
        type: "returned",
        booking: {
          ...updatedBooking.rows[0],
          vehicle: updatedVehicle.rows[0],
        },
      };
    }
  }
  throw new Error("Unauthorized role");
};
// const

export const bookingService = {
  createBooking,
  getBooking,
  updateBooking,
};
