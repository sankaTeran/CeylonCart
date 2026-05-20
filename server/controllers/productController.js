import Product from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    // Parse the stringified product data received from the request body into a JavaScript object
    let productData = JSON.parse(req.body.productData);

    // Retrieve uploaded image files from the request, defaulting to an empty array if none are found
    const images = req.files || [];

    // Upload all received images to Cloudinary concurrently using Promise.all
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        // Upload each individual image file path to Cloudinary
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        // Return the secure cloud URL of the uploaded image
        return result.secure_url;
      })
    );

    // Create and save the new product document in the database with the parsed data and Cloudinary image URLs
    await Product.create({ ...productData, image: imagesUrl });

   
    return res.json({
      success: true,
      message: "Product Added",
    });
  } catch (error) {
    //
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add Product : /api/product/add
// export const addProduct = async (req, res) => {
//   try {
//     let productData;

//     // Check if productData is sent as a JSON string (e.g., from React Frontend)
//     if (typeof req.body.productData === "string") {
//       productData = JSON.parse(req.body.productData);
//     } else if (req.body.productData) {
//       productData = req.body.productData;
//     } else {
//       // If fields are sent individually (e.g., from Postman Plan B), use req.body directly
//       productData = req.body;
//     }

//     // Extract fields from the parsed or direct productData
//     const { name, description, category, price, offerPrice } = productData;

//     // Ensure description is formatted correctly as an array (splits by lines or commas if it's a string)
//     let finalDescription = description;
//     if (typeof description === "string") {
//       finalDescription = description.includes("\n")
//         ? description.split("\n")
//         : description.split(",");
//     }

//     const images = req.files || [];

//     // Upload images to Cloudinary
//     let imagesUrl = await Promise.all(
//       images.map(async (item) => {
//         let result = await cloudinary.uploader.upload(item.path, {
//           resource_type: "image",
//         });
//         return result.secure_url;
//       })
//     );

//     // Save product to MongoDB with updated data structure
//     await Product.create({
//       name,
//       description: finalDescription,
//       category,
//       price,
//       offerPrice,
//       image: imagesUrl,
//     });

//     return res.json({
//       success: true,
//       message: "Product Added",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// Get Product : /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change Single Product : /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.params; //(e.g., /api/product/64f1a...)
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
