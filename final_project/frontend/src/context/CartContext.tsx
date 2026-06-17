/**
 * CartContext.tsx
 *
 * Course selection state for the checkout flow.
 * Students select up to 7 courses before submitting a payment request.
 *
 * Used by: Checkout.tsx, CourseDetail.tsx, CourseListingSection.tsx
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export const MAX_COURSE_SELECTION = 7;

export type PurchaseType = 'bundle' | 'specific' | null;

interface CartContextType {
  selectedCourses: string[];
  toggleCourse:    (id: string) => void;
  isAtLimit:       boolean;
  clearCart:       () => void;
  slotsRemaining:  number;
  selectionCount:  number;
  purchaseType:    PurchaseType;
  setPurchaseType: (type: PurchaseType) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tilla_cart') || '[]');
      if (!Array.isArray(stored)) return [];
      // Validate: every entry must be a numeric string (integer Django PK).
      // Old static IDs like 'FLEn-1011' are non-numeric — discard the whole cart
      // so stale data from a previous session cannot fill the cart on fresh load.
      const allNumeric = stored.every(
        (id: unknown) => typeof id === 'string' && /^\d+$/.test(id)
      );
      if (!allNumeric) {
        localStorage.removeItem('tilla_cart');
        return [];
      }
      return stored;
    } catch {
      return [];
    }
  });
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(null);

  useEffect(() => {
    localStorage.setItem('tilla_cart', JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  const toggleCourse = (id: string) =>
    setSelectedCourses(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= MAX_COURSE_SELECTION) return prev;
      return [...prev, id];
    });

  const clearCart = () => setSelectedCourses([]);

  const selectionCount  = selectedCourses.length;
  const isAtLimit       = selectionCount >= MAX_COURSE_SELECTION;
  const slotsRemaining  = MAX_COURSE_SELECTION - selectionCount;

  return (
    <CartContext.Provider value={{
      selectedCourses, toggleCourse, isAtLimit,
      clearCart, slotsRemaining, selectionCount,
      purchaseType, setPurchaseType,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
