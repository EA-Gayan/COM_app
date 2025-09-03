import { Expense } from "@/app/expenses/expensesPage.types";

export interface ExpenseModalProps {
  isEdit?: boolean;
  initialData?: Expense;
  onClose: () => void;
  onSubmit: (expense: Expense) => void;
}
