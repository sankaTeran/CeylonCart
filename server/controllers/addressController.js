import Address from "../models/Address.js";

// ==========================================
// 1. Add Address : /api/address/add
// ==========================================
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.userId; // ID extracted from the authUser middleware

    if (!userId) {
      return res.json({
        success: false,
        message: "User identity missing from token.",
      });
    }

    // Map fields individually to match the Schema structure
    await Address.create({
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      street: address.street,
      city: address.city,
      state: address.state,
      zipcode: Number(address.zipcode), // Converted to Number since Schema expects a Number type
      country: address.country,
      phone: address.phone,
      userId: userId, // The ID from middleware is directly saved to the database
    });

    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.log("Database Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. Get Address : /api/address/get
// ==========================================
export const getAddress = async (req, res) => {
  try {
    // Since GET requests do not contain a body, use req.userId provided by the authUser middleware
    const userId = req.userId;

    if (!userId) {
      return res.json({
        success: false,
        message: "User identity missing from token.",
      });
    }

    // Retrieve only the addresses belonging to the currently logged-in user
    const addresses = await Address.find({ userId: userId });

    res.json({ success: true, addresses });
  } catch (error) {
    console.log("Database Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
