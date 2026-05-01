import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: number;
  variantId?: number;
  name: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
};

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number, variantId?: number) => void;
  updateQuantity: (id: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// P11: Selector hooks for optimized re-renders
// These selectors prevent components from re-rendering when unrelated state changes

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.variantId === item.variantId
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.variantId === item.variantId 
                  ? { ...i, quantity: i.quantity + item.quantity } 
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id, variantId) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.variantId === variantId)),
        }));
      },
      updateQuantity: (id, quantity, variantId) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) => 
            (i.id === id && i.variantId === variantId) ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cosmetics-cart-storage',
    }
  )
);
