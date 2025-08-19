export interface OrderProps {
  customerDetails: {
    name: string;
    telNo: string;
  };
  orderId: string;
  orderStatus: number;
  orderDate: string;
  bills: {
    total: number;
    tax: number;
    discount?: number;
  };
  items: {
    product: string;
    name: string;
    pricePerQuantity: number;
    quantity: number;
    price: number;
  }[];
}

export interface CreateOrderProps {
  customerDetails: {
    name?: string;
    tel?: string;
  };
  bills: {
    total: number;
    tax: number;
    discount?: number;
  };
  items: {
    productId: number;
    name: string;
    pricePerQuantity: number;
    quantity: number;
    price: number;
  }[];
}
