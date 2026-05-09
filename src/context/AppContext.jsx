import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.VITE_CURRENCY;

  const navigate = useNavigate();
  const [user, setUser] = useState(true);
  const [isSeller, setisSeller] = useState(false);
  const [showUserLogin, setshowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  // Fetch All Products
  const fetchProducts = async (params) => {
    setProducts(dummyProducts);
  };

  // Add Product to Cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  // Get Cart Item Count
  const getCartItemCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  // Get Cart Total Amount
  const getCartAmount = () => {
    let totalAmount = 0;

    for (const items in cartItems) {
      
      let itemInfo = products.find((product) => product._id === items);

      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }

  
    return Math.floor(totalAmount * 100) / 100;
  };

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart Updated");
  };

  // Remove Product from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success("Removed From Cart");
    setCartItems(cartData);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    currency,
    navigate,
    user,
    setUser,
    isSeller,
    setisSeller,
    showUserLogin,
    setshowUserLogin,
    products,
    setProducts,
    addToCart,
    removeFromCart,
    updateCartItem,
    cartItems,
    setSearchQuery,
    searchQuery,
    getCartItemCount,
    getCartAmount
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
