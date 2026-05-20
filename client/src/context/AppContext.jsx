import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setshowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  // Fetch All Products from the Backend API
  const fetchProducts = async () => {
    try {
      // 1. Send a GET request to the backend API endpoint using Axios to retrieve the product list
      const { data } = await axios.get("/api/product/list");

      // 2. Check if the backend responded with a successful status
      if (data.success) {
        // 3. Update the frontend component state with the fetched array of products
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch Seller Status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  // Fetch User Authentication Status, User Data, and Cart Items
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");

      // If the backend confirms the user session is active and valid
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
    } catch (error) {
      setUser(null);
    }
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
    const initializeApp = async () => {
      try {
        // 1. මුලින්ම යූසර් ඇත්තටම Login වෙලාද කියලා සර්වර් එකෙන් චෙක් කරලා Cookies සෙට් කරගන්නවා
        await fetchUser();

        // 2. යූසර්ව තහවුරු කරගත්තට පස්සේ විතරක් අනිත් දේවල් ටික ඉල්ලනවා
        await Promise.all([fetchProducts(), fetchSeller()]);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeApp();
  }, []);

  // Cart එකේ බඩු බාහිරාදිය වෙනස් වෙද්දී (Update වෙද්දී) ඒ දත්ත backend එකට යැවීම
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (user && Object.keys(cartItems).length > 0) {
      updateCart();
    }
  }, [cartItems, user]); // user එකත් dependency එකට දාන්න

  const value = {
    currency,
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setshowUserLogin,
    products,
    setProducts,
    addToCart,
    removeFromCart,
    updateCartItem,
    cartItems,
    setCartItems,
    setSearchQuery,
    searchQuery,
    getCartItemCount,
    getCartAmount,
    axios,
    fetchProducts,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
