export interface Product {
  _id: string;
  name: string;
  description: string;
  perchasePrice: number;
  sellingPrice: number;
  category: string;
  imageUrl?: string;
  stockQty: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
