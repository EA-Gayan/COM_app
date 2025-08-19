export interface Product {
  _id: string;
  name: string;
  description: string;
  sellingPrice: number;
  category: string;
  imageUrl?: string;
  availableQty: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
