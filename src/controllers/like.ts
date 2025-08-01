import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function likeThread(req: Request, res: Response) {
  try {
    const { tweet_id, user_id } = req.body;
    const threadId = Number(tweet_id);
    const userId = Number(user_id);

    // Check if thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return res.status(404).json({
        error: "Tweet not found or user already liked this tweet"
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_thread_id: {
          user_id: userId,
          thread_id: threadId
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({
        error: "Tweet not found or user already liked this tweet"
      });
    }

    await prisma.like.create({
      data: {
        user_id: userId,
        thread_id: threadId,
        created_by: userId,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    const io = req.app.get('io');
    io.emit("newLike", {
      tweet_id: threadId,
      user_id: userId
    });

    res.status(200).json({
      message: "Tweet liked successfully",
      tweet_id: tweet_id,
      user_id: user_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Tweet not found or user already liked this tweet"
    });
  }
}

export async function unlikeThread(req: Request, res: Response) {
  try {
    const threadId = Number(req.params.thread_id);
    const userId = (req as any).user?.id;

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_thread_id: {
          user_id: userId,
          thread_id: threadId
        }
      }
    });

    if (!existingLike) {
      return res.status(404).json({
        error: "Like not found"
      });
    }

    // Delete the like
    await prisma.like.delete({
      where: {
        user_id_thread_id: {
          user_id: userId,
          thread_id: threadId
        }
      }
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit("unlikeThread", {
      tweet_id: threadId,
      user_id: userId
    });

    res.status(200).json({
      message: "Tweet unliked successfully",
      tweet_id: threadId.toString(),
      user_id: userId.toString()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error unliking tweet"
    });
  }
}

export async function getLikes(req: Request, res: Response) {
  try {
    const threadId = Number(req.query.thread_id);
    if (isNaN(threadId)) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Invalid thread_id"
      });
    }

    const likes = await prisma.like.findMany({
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

    const formattedLikes = likes.map(like => ({
      user: {
        id: like.user.id,
        username: like.user.username,
        name: like.user.full_name,
        profile_picture: like.user.photo_profile || "https://example.com/user2.jpg"
      },
      created_at: like.created_at
    }));

    res.status(200).json({
      code: 200,
      status: "success", 
      message: "Get Data Thread Successfully",
      data: {
        like: formattedLikes
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Error fetching likes"
    });
  }
}