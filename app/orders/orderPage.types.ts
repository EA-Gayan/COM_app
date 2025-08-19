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

export interface OrderProps {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
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

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
