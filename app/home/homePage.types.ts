export interface prodctsProps {
  productId: number;
  name: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  category: string;
  stockQty: number;
  availableQty: number;
  sName: string;
  _id: string;
}

export interface paginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalProducts: number;
}

export interface productPageProps {
  pagination: paginationProps;
  prodcts: prodctsProps[];
}
