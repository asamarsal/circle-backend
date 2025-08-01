// src/services/auth.service.ts
import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { signToken } from "../utils/jwt";
import { loginSchema } from "../validation/auth";

export async function register(email: string, password: string, full_name: string, username: string) {
  if (!email.match(/@/) || password.length < 6) {
    throw new Error("Invalid email or password");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { 
      email, 
      password: hashed,
      full_name,
      username,
    }
  });

  const token = signToken({ id: user.id });

  return { 
    id: user.id, 
    email: user.email,
    full_name,
    username,
    token
  };
}

export async function login(identifier: string, password: any) {
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Wrong password");

  const token = signToken({ id: user.id,});
  return {
    id: user.id,
    username: user.username,
    name: user.full_name,
    email: user.email,
    token
  };
}