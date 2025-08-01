import { Request, Response, NextFunction } from "express";
import { register, login} from "../services/auth";
import { prisma } from "../prisma/client";
import { loginSchema, registerSchema } from "../validation/auth";
import { productSchema } from "../validation/auth";

export async function handleRegister(req: Request, res: Response) {
  try {

    const { error } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { email, password, username, full_name} = req.body;
    const data = await register(email, password, username, full_name);

    res.status(200).json({ code: 200, message: "Registrasi berhasil. Akun berhasil dibuat.", data: {
        user_id: data.id,
        username: data.username,
        name: data.full_name,
        email: data.email,
        token: data.token
      },
    });
  } catch (err: any) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Invalid register",
    });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { identifier, password } = req.body;
    const userData = await login(identifier, password);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful.",
      data: {
        user_id: userData.id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        token: userData.token
      }
    });
  } catch (err: any) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Invalid Login"
    });
  }
}