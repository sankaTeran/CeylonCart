import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link
import { AppContext } from "../context/AppContext"; // Import your actual Context object here
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  // 1. Pass your context object into the hook
  const { products, navigate, currency, addToCart } = useContext(AppContext);
  const { id } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);

  // Find the specific product
  const product = products.find((item) => item._id === id);

  useEffect(() => {
    if (products.length > 0 && product) {
      let productsCopy = products.slice();
      // 2. Added optional chaining for safety
      productsCopy = productsCopy.filter(
        (item) => product.category === item.category
      );
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [products, product]); // Added product as a dependency

  useEffect(() => {
    if (product) {
      setThumbnail(product.image[0] ? product.image[0] : null);
    }
  }, [product]);

  // Render nothing or a loader if product isn't found yet
  if (!product) {
    return <div className="mt-12 text-center">Loading product...</div>;
  }

  return (
    <div className="mt-12">
      <p className="flex gap-2">
        <Link to={"/"}>Home</Link> /<Link to={"/products"}> Products</Link> /
        <Link to={`/products/${product.category.toLowerCase()}`}>
          {" "}
          {product.category}
        </Link>{" "}
        /<span className="text-primary"> {product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.image.map((image, index) => (
              <div
                key={index}
                onClick={() => setThumbnail(image)}
                className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>

          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            <img
              src={thumbnail}
              alt="Selected product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>

          {/* Rating Logic */}
          <div className="flex items-center gap-0.5 mt-1">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <svg
                  key={i}
                  width="14"
                  height="13"
                  viewBox="0 0 18 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.049.927c.3-.921 1.603-.921 1.902 0l1.294 3.983a1 1 0 0 0 .951.69h4.188c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 0 0-.364 1.118l1.295 3.983c.299.921-.756 1.688-1.54 1.118L9.589 13.63a1 1 0 0 0-1.176 0l-3.389 2.46c-.783.57-1.838-.197-1.539-1.118L4.78 10.99a1 1 0 0 0-.363-1.118L1.028 7.41c-.783-.57-.38-1.81.588-1.81h4.188a1 1 0 0 0 .95-.69z"
                    fill={product.rating > i ? "#615fff" : "#615fff"}
                    fillOpacity={product.rating > i ? "1" : "0.35"}
                  />
                </svg>
              ))}
            <p className="text-base ml-2">({product.rating})</p>
          </div>

          <div className="mt-6">
            <p className="text-gray-500/70 line-through">
              MRP: {currency}
              {product.price}
            </p>
            <p className="text-2xl font-medium">
              MRP:{currency}
              {product.offerPrice}
            </p>
            <span className="text-gray-500/70">(inclusive of all taxes)</span>
          </div>

          <p className="text-base font-medium mt-6">About Product</p>
          <ul className="list-disc ml-4 text-gray-500/70">
            {product.description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>

          <div className="flex items-center mt-10 gap-4 text-base">
            <button
              onClick={() => addToCart(product._id)}
              className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                addToCart(product._id);
                navigate("/cart");
              }}
              className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
      {/* Related Products */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex flex-col items-center w-max">
          <p className="text-3xl font-medium">Related Products</p>
          <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full ">
          {relatedProducts
            .filter((product) => product.inStock)
            .map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
        </div>
        <button onClick={()=>{navigate("/products");scrollTo(0,0)}} className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition">
          See more
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
