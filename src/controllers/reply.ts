import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { Reply } from '../types';

export async function getReplies(req: Request, res: Response) {
  try {
    const threadId = Number(req.query.thread_id);
    if (isNaN(threadId)) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Invalid thread_id"
      });
    }

    const replies = await prisma.reply.findMany({
      where: { thread_id: threadId },
      orderBy: { created_at: "desc" },
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

    const formattedReplies = replies.map((reply: Reply) => ({
      id: reply.id,
      content: reply.content,
      user: {
        id: reply.user.id,
        username: reply.user.username,
        name: reply.user.full_name,
        profile_picture: reply.user.photo_profile || "https://example.com/user2.jpg"
      },
      created_at: reply.created_at
    }));

    const io = req.app.get('io');
    io.emit("newReply", {
      replies: formattedReplies
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Get Data Thread Successfully",
      data: {
        replies: formattedReplies
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Error fetching replies"
    });
  }
}

export async function createReply(req: Request, res: Response) {
  try {
    const threadId = Number(req.query.thread_id);
    const { user_id, content } = req.body;

    const image_url = req.file?.filename
      ? `/uploads/threads/${req.file.filename}`
      : null;

    if (isNaN(threadId) || !user_id || !content) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Invalid thread content"
      });
    }

    const reply = await prisma.reply.create({
      data: {
        thread_id: threadId,
        user_id: Number(user_id),
        content,
        image: image_url
      }
    });

    // Ambil info user
    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true
      }
    });

    const count = await prisma.reply.count({ where: { thread_id: threadId } });

    await prisma.thread.update({
      where: { id: threadId },
      data: {
        number_of_replies: count
      }
    });

    // Websocket update reply
    const io = req.app.get('io');
    io.emit("newReply", {
      id: reply.id,
      thread_id: threadId,
      content: reply.content,
      user: {
        id: user?.id,
        username: user?.username,
        name: user?.full_name,
        profile_picture: user?.photo_profile || "https://example.com/user2.jpg"
      },
      created_at: reply.created_at
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "reply berhasil diposting.",
      data: {
        tweet: {
          id: reply.id.toString(),
          user_id: reply.user_id.toString(),
          content: reply.content,
          image_url: reply.image,
          timestamp: reply.created_at
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Invalid thread content"
    });
  }
}