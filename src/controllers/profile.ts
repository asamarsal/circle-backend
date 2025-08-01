import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count followers and following
    const follower_count = await prisma.following.count({
      where: { following_id: userId }
    });
    const following_count = await prisma.following.count({
      where: { follower_id: userId }
    });

    res.status(200).json({
      id: user.id.toString(),
      username: user.username,
      name: user.full_name,
      avatar: user.photo_profile || "https://example.com/avatar.jpg",
      cover_photo: "https://example.com/cover.jpg",
      bio: user.bio || "",
      follower_count,
      following_count
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { username, full_name, bio } = req.body;
    const photo_profile = req.file?.filename 
      ? `/uploads/profiles/${req.file.filename}`
      : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        full_name,
        bio,
        photo_profile,
        updated_at: new Date()
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true
      }
    });

    
    const follower_count = await prisma.following.count({
      where: { following_id: userId }
    });
    const following_count = await prisma.following.count({
      where: { follower_id: userId }
    });

   
    const io = req.app.get('io');
    io.emit("profileUpdated", {
      id: updatedUser.id.toString(),
      username: updatedUser.username,
      name: updatedUser.full_name,
      avatar: updatedUser.photo_profile || "https://example.com/avatar.jpg",
      bio: updatedUser.bio || "",
      follower_count,
      following_count
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id.toString(),
        username: updatedUser.username,
        name: updatedUser.full_name,
        avatar: updatedUser.photo_profile || "https://example.com/avatar.jpg",
        bio: updatedUser.bio || "",
        follower_count,
        following_count
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}