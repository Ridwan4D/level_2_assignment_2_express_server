import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import config from "../../config";

const signupUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;
  const hashedPass = await bcrypt.hash(password as string, 10);
  console.log(role);
  if (role != "admin" && role != "customer") {
    return "Role must be admin or customer";
  }
  if (!password || password.toString().length < 6) {
    return "Minimum password length is 6 characters";
  }

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role
    `,
    [name, email, hashedPass, phone, role]
  );
  console.log(result);
  return result;
};

type SigninCredentials = {
  email: string;
  password: string;
};
const signinUser = async (payload: SigninCredentials) => {
  const { email, password } = payload;
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  if (result.rows.length === 0) {
    throw new Error("User Not found");
  }
  const userInfo = result.rows[0];
  const isMatched = await bcrypt.compare(password, userInfo.password);

  if (!isMatched) {
    throw new Error("Invalid credential");
  }

  const { password: _, ...user } = userInfo;
  const secret = config.auth_secret as string;
  // const secret = "12344565";
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: "7d" }
  );
  return { token: `Bearer ${token}`, user };
};

export const authServices = {
  signupUser,
  signinUser,
};
