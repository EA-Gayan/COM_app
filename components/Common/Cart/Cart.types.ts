// Single item in the cart
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  _id: string;
}

export interface CartProps {
  items: CartItem[];
  discount: number;
  vat: number;
  total: number;
  onRemoveItem: (id: number) => void;
  onClearAll: () => void;
}
