import { Product } from "@/app/products/productsPage.types";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsTableProps {
  products: Product[];
  pagination: Pagination | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onPageChange: (page: number) => void;
}
