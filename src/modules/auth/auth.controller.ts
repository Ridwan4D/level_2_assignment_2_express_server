import { Request, Response } from "express";
import { authServices } from "./auth.service";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.signupUser(req.body);
    console.log(result);
    if (typeof result == "string") {
      res.status(400).json({
        success: false,
        message: result,
      });
    } else {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const signinUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.signinUser(req.body);
    console.log(result);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  signupUser,
  signinUser,
};
