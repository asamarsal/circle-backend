import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { User } from '../types';

export async function searchUsers(req: Request, res: Response) {
  try {
    const keyword = req.query.keyword as string;

    if (!keyword) {
      return res.status(400).json({
        status: "error",
        message: "Keyword is required"
      });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: keyword, mode: 'insensitive' } },
          { full_name: { contains: keyword, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        _count: {
          select: {
            followedBy: true // Count followers
          }
        }
      }
    });

    const formattedUsers = users.map((user: User & { _count: { followedBy: number } }) => ({
      id: user.id.toString(),
      username: user.username,
      name: user.full_name,
      followers: user._count.followedBy
    }));

    res.status(200).json({
      status: "success",
      data: {
        users: formattedUsers
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user data. Please try again later."
    });
  }
}