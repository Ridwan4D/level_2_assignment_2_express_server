import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: `${config.connection_str}`,
});

const initDB = async () => {
  await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password TEXT NOT NULL CHECK (char_length(password) >= 6),
                phone VARCHAR(15) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer'))
            )
        `);

  await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles(
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(100) NOT NULL,
                type VARCHAR(50) CHECK (type IN ('car', 'bike', 'van', 'suv')),
                registration_number VARCHAR(100) UNIQUE NOT NULL,
                daily_rent_price INT NOT NULL CHECK (daily_rent_price > 0),
                availability_status VARCHAR(100) CHECK (availability_status IN ('available', 'booked'))
            )
        `);

  await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings(
                id SERIAL PRIMARY KEY,
                customer_id INT REFERENCES users(id) ON DELETE RESTRICT,
                vehicle_id INT REFERENCES vehicles(id) ON DELETE RESTRICT,
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL,
                total_price INT NOT NULL CHECK (total_price > 0),
                status VARCHAR(100) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'returned'))
            )
        `);
};

export default initDB;
