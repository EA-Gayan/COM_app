import { Expense, Pagination } from "@/app/expenses/expensesPage.types";

export interface ExpensesTableProps {
  expenses: Expense[];
  pagination: Pagination | null;
  onEdit: (product: Expense) => void;
  onDelete: (id: string, name: string) => void;
  onPageChange: (page: number) => void;
}
