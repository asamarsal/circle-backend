import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { createThreadSchema } from "../validation/thread";
import multer from "multer";
import { Thread, Like } from '../types';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function getThreads(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 25;
    const userId = (req as any).user?.id;

    const threads = await prisma.thread.findMany({
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true
          }
        },
        replies: {
          select: {
            id: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    });

    const threadsWithLikeStatus = threads.map((thread: Thread) => ({
      id: thread.id,
      content: thread.content,
      image: thread.image || null,
      user: {
        id: thread.user?.id,
        username: thread.user?.username,
        name: thread.user?.full_name,
        profile_picture: thread.user?.photo_profile
      },
      created_at: thread.created_at,
      likes: thread._count.likes,
      reply: thread._count.replies,
      isLiked: userId ? thread.likes.some((like: Like) => like.user_id === userId) : false
    }));

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Get Data Thread Successfully",
      data: {
        threads: threadsWithLikeStatus
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Error fetching threads"
    });
  }
}

export async function getThreadDetail(req: Request, res: Response) {
  try {
    const threadId = Number(req.params.id);
    if (isNaN(threadId)) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Invalid thread id"
      });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true
          }
        },
        likes: true,
        replies: true,
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    });

    if (!thread) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Thread not found"
      });
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Get Data Thread Successfully",
      data: {
        id: thread.id,
        content: thread.content,
        user: {
          id: thread.user?.id,
          username: thread.user?.username,
          name: thread.user?.full_name,
          profile_picture: thread.user?.photo_profile || "https://example.com/user1.jpg"
        },
        created_at: thread.created_at,
        likes: thread._count.likes,
        replies: thread._count.replies
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Error fetching thread detail"
    });
  }
}

export async function createThread(req: MulterRequest, res: Response) {
  try {
    const { error } = createThreadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        code: 400,
        status: "error",
        message: error.message 
      });
    }

    const userId = (req as any).user?.id;
    const { content } = req.body;
    const image = req.file?.filename;

    const thread = await prisma.thread.create({
      data: {
        content,
        image: image ? `/uploads/threads/${image}` : null,
        created_by: userId,
        updated_by: userId,
        updated_at: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true
          }
        }
      }
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Thread created successfully",
      data: {
        id: thread.id,
        content: thread.content,
        image: thread.image,
        user: {
          id: thread.user?.id,
          username: thread.user?.username,
          name: thread.user?.full_name,
          profile_picture: thread.user?.photo_profile
        },
        created_at: thread.created_at
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Error creating thread"
    });
  }
}