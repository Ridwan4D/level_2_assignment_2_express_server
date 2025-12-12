import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const getUser = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users`
  );
  return result;
};
type UpdateUserCredential = {
  name: string;
  email: string;
  phone: string;
  role: string;
};
const updateUser = async (
  payload: UpdateUserCredential,
  id: string,
  loggedInUser: JwtPayload
) => {
  const { name, email, phone, role } = payload;

  if (loggedInUser.role !== "admin" && loggedInUser.id != id) {
    throw new Error("You are not allowed to update other's profile");
  }
  const result = await pool.query(
    `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING id, name, email, phone, role`,
    [name, email, phone, role, id]
  );
  return result;
};

const deleteUser = async (id: string) => {
  const hasBooking = await pool.query(
    `
      SELECT EXISTS (SELECT 1 FROM bookings WHERE customer_id = $1)  AS has_booking
    `,
    [id]
  );

  if (hasBooking.rows[0].has_booking) {
    throw new Error("This user has booking");
  }

  const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
  return result;
};

export const userService = {
  getUser,
  updateUser,
  deleteUser,
};
