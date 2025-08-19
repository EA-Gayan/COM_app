export interface prodctsProps {
  productId: number;
  name: string;
  description: string;
  perchasePrice: number;
  sellingPrice: number;
  category: string;
  stockQty: number;
  availableQty: number;
  sName: string;
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
