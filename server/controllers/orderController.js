import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

// ==========================================
// Place Order Using COD
// ==========================================

export const placeOrderCOD = async (req, res) => {
  try {
    // 💡 1. ටෝකන් එකෙන් එන userId එක (req.userId) සහ body එකෙන් එන දත්ත ගන්නවා
    // (Auth middleware එකෙන් req.userId එක සෙට් කරනවා නම් ඒක ගන්න එක තමයි ආරක්ෂිතම ක්‍රමය)
    const userId = req.userId || req.body.userId;
    const { items, address } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User identity missing." });
    }

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    // 💡 2. async/await reduce එකේ අවුල හැදීමට සාමාන්‍ය for-of loop එකක් පාවිච්චි කරමු (Easy & Safe)
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        amount += product.offerPrice * item.quantity;
      }
    }

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    // 💡 3. Order එක ක්‍රියේට් කරනවා
    await Order.create({
      userId: userId, // 👈 Schema එකට හරියටම string/objectID එක පාස් වෙනවා
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// ==========================================
// Place Order Using Stripe : /api/order/stripe
// ==========================================

export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const { origin } = req.headers;
    const { items, address } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User identity missing." });
    }

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];

    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      if (product) {
        amount += product.offerPrice * item.quantity;
      }
    }

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    // 💡 3. Order එක ක්‍රියේට් කරනවා
    const order = await Order.create({
      userId: userId, // 👈 Schema එකට හරියටම string/objectID එක පාස් වෙනවා
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe

    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ==========================================
// Stripe Webhooks to Verify Payments Action : /stripe
// ==========================================

export const stripeWebhooks = async (request, response) => {
  // Stripe Gateway Initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;
      // Mark Payment as Paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      // Clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};

// ==========================================
// Get Orders by User ID : /api/order/user
// ==========================================

export const getUserOrders = async (req, res) => {
  try {
    // 💡 මෙතනත් ටෝකන් එකෙන් එන userId එක ගන්න එක තමයි හොඳම ක්‍රමය
    const userId = req.userId || req.body.userId;

    if (!userId) {
      return res.json({ success: false, message: "User identity missing." });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// Get All Orders ( for seller / admin) : /api/order/seller
// ==========================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
