import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  // To send cookies from frontend, axios must include { withCredentials: true }
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized, No Token" });
  }

  try {
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);

    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      return next(); // Adding return here terminates the execution and prevents falling through
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Not Authorized, Email Mismatch" });
    }
  } catch (error) {
    console.log("Auth Error:", error.message);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authSeller;
