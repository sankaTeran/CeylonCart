import User from "../models/User.js";

// Update User CartData : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems } = req.body;

    if (!cartItems) {
      return res.json({ success: false, message: "Cart items are required" });
    }

    await User.findByIdAndUpdate(userId, { cartData: cartItems });

    return res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
