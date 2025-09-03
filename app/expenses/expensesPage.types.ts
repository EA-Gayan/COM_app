export interface Expense {
  _id: string;
  description: string;
  date: string;
  expenseId?: number;
  amount: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalExpenses: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
