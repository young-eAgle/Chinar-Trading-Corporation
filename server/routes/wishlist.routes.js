import express from 'express';
import Wishlist from "../models/model.wishlist.js";
import User from '../models/model.user.js';
import { verifyToken } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Add product to wishlist
router.post("/add", verifyToken, asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();
    await wishlist.populate('products');

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Remove product from wishlist
router.delete("/remove/:productId", verifyToken, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();
    await wishlist.populate('products');

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Clear wishlist
router.delete("/clear", verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      message: "Wishlist cleared successfully",
      wishlist
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Get user's wishlist
router.get("/", verifyToken, asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate("products");
    
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Get wishlist count
router.get("/count", verifyToken, asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    const count = wishlist ? wishlist.products.length : 0;
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

export default router;