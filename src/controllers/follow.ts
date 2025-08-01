import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { Following } from '../types';

export async function getFollows(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const type = req.query.type as string;

    if (type !== 'followers' && type !== 'following') {
      return res.status(400).json({
        status: "error",
        message: "Invalid type parameter"
      });
    }

    if (type === 'following') {
      const following = await prisma.following.findMany({
        where: {
          follower_id: userId
        },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              full_name: true,
              photo_profile: true
            }
          }
        }
      });

      const formattedFollowing = following.map(follow => ({
        id: follow.following.id.toString(),
        username: follow.following.username,
        name: follow.following.full_name,
        avatar: follow.following.photo_profile || "https://example.com/avatar/default.jpg"
      }));

      return res.status(200).json({
        status: "success",
        data: {
          followers: formattedFollowing // Using 'followers' key as per API spec
        }
      });
    }


    const followers = await prisma.following.findMany({
      where: {
        following_id: userId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true
          }
        }
      }
    });

    const formattedFollowers = await Promise.all(
      followers.map(async (follow) => {
        const isFollowing = await prisma.following.findFirst({
          where: {
            follower_id: userId,
            following_id: follow.follower_id
          }
        });

        return {
          id: follow.follower.id.toString(),
          username: follow.follower.username,
          name: follow.follower.full_name,
          avatar: follow.follower.photo_profile || "https://example.com/avatar/default.jpg",
          is_following: !!isFollowing
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        followers: formattedFollowers
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch follower data. Please try again later."
    });
  }
}

export async function followUser(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { followed_user_id } = req.body;

    const existingFollow = await prisma.following.findFirst({
      where: {
        follower_id: userId,
        following_id: followed_user_id
      }
    });

    if (existingFollow) {
      await prisma.following.delete({
        where: {
          id: existingFollow.id
        }
      });

      const io = req.app.get('io');
      io.emit("unfollowUser", {
        user_id: followed_user_id,
        follower_id: userId
      });

      return res.status(200).json({
        status: "success",
        message: "You have successfully unfollowed the user.",
        data: {
          user_id: followed_user_id.toString(),
          is_following: false
        }
      });
    }

    await prisma.following.create({
      data: {
        follower_id: userId,
        following_id: followed_user_id,
        updated_at: new Date()
      }
    });

    const io = req.app.get('io');
    io.emit("followUser", {
      user_id: followed_user_id,
      follower_id: userId
    });

    res.status(200).json({
      status: "success",
      message: "You have successfully followed the user.",
      data: {
        user_id: followed_user_id.toString(),
        is_following: true
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to follow the user. Please try again later."
    });
  }
}

export async function unfollowUser(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { followed_id } = req.body;

    const existingFollow = await prisma.following.findFirst({
      where: {
        follower_id: userId,
        following_id: followed_id
      }
    });

    if (!existingFollow) {
      return res.status(404).json({
        status: "error",
        message: "Follow relationship not found"
      });
    }

    await prisma.following.delete({
      where: {
        id: existingFollow.id
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit("unfollowUser", {
      user_id: followed_id,
      follower_id: userId
    });

    res.status(200).json({
      status: "success",
      message: "You have successfully unfollowed the user.",
      data: {
        user_id: followed_id.toString(),
        is_following: false
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to unfollow the user. Please try again later."
    });
  }
}
