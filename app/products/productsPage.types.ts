export interface Product {
  _id: string;
  name: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  category: string;
  imageUrl?: string;
  stockQty: number;
  sName: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
