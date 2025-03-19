
import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.find((item) => item._id === action.payload._id);
      const quantityToAdd = action.payload.quantity ?? 1; // Use provided quantity or default to 1

      if (existingItem) {
        return state.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + quantityToAdd } // Add the correct quantity
            : item
        );
      }

      return [...state, { ...action.payload, quantity: quantityToAdd }]; // Set initial quantity correctly
    }

    

    case "REMOVE_FROM_CART":
      return state.filter((item) => item._id !== action.payload);

    case "CLEAR_CART":
      return [];

    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item._id === action.payload._id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter((item) => item.quantity > 0);

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], ()=>{


    const localCart = localStorage.getItem("cart");
    return localCart ? JSON.parse(localCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  return (
    <CartContext.Provider value={{ cart, dispatch,  }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);












// import React, { createContext, useContext, useReducer, useEffect } from "react";

// const CartContext = createContext();

// const cartReducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_TO_CART": {
//       const existingItem = state.find((item) => item._id === action.payload._id);
//       if (existingItem) {
//         return state.map((item) =>
//           item._id === action.payload._id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...state, { ...action.payload, quantity: 1 }];
//     }

//     case "REMOVE_FROM_CART":
//       return state.filter((item) => item._id !== action.payload);

//     case "CLEAR_CART":
//       return [];

//     case "UPDATE_QUANTITY":
//       return state.map((item) =>
//         item._id === action.payload._id
//           ? { ...item, quantity: action.payload.quantity }
//           : item
//       ).filter((item) => item.quantity > 0);

//     default:
//       return state;
//   }
// };

// export const CartProvider = ({ children }) => {
//   const [cart, dispatch] = useReducer(cartReducer, [], ()=>{


//     const localCart = localStorage.getItem("cart");
//     return localCart ? JSON.parse(localCart) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cart));
//   }, [cart]);


//   return (
//     <CartContext.Provider value={{ cart, dispatch }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);









