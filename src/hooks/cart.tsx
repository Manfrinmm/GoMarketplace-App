import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function storageData(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }

    storageData();
  }, [products]);

  const addToCart = useCallback(async product => {
    // TODO ADD A NEW ITEM TO THE CART

    setProducts(state => {
      const productAlreadyAdded = state.find(item => item.id === product.id);

      if (productAlreadyAdded) {
        productAlreadyAdded.quantity += 1;

        return [...state];
      }

      return [...state, { ...product, quantity: 1 }];
    });
  }, []);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    setProducts(state => {
      const product = state.find(item => item.id === id);

      if (product) {
        product.quantity += 1;

        return [...state];
      }

      return state;
    });
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    setProducts(state => {
      const product = state.find(item => item.id === id);

      if (product) {
        product.quantity -= 1;

        if (product.quantity < 1) {
          const productsUpdated = state.filter(item => item.id !== id);

          return productsUpdated;
        }

        return [...state];
      }

      return state;
    });
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
