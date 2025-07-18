import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../prisma/client";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded as any;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}


export function authenticateSuppliers(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as any).supplier = decoded as any;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}

export const authorizeSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supplier = (req as any).user;
    const productId = parseInt(req.params.id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.supplierId !== supplier.id) {
      res.status(403).json({ message: "You are not the supplier of this product" });
      return;
    }

    next();
  } catch (err) {
    res.status(403).json({ message: "Not authorized" });
  }
};