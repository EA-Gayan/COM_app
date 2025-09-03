"use client";

import Spinner from "@/components/Common/Spinner/Spinner";
import Nav from "@/components/Helper/Navbar/Nav";
import { FaExclamationTriangle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Expense, Pagination } from "./expensesPage.types";
import ExpensesTable from "@/components/ExpensesTable/ExpensesTable";
import ExpenseModal from "@/components/ExpensesPageModals/ExpenseModal";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState<Expense | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{
    id: string;
    description: string;
  } | null>(null);

  // Page state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, limit, searchText }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch");

      setExpenses(data.data.expenses);
      setPagination(data.data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, searchText]);

  // Actions
  const handleEdit = (expense: Expense) => {
    setIsEditClicked(true);
    setExpenseModalOpen(true);
    setExpenseData({
      _id: expense._id || "",
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
    });
  };

  const confirmDelete = (id: string, description: string) => {
    setDeleteInfo({ id, description });
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteInfo) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/${deleteInfo.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
      } else {
        alert(data.message || "Failed to delete expense");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setDeleteInfo(null);
    }
  };

  const addOrUpdateExpenseData = async (modalData: Expense) => {
    try {
      setLoading(true);
      setError(null);

      let res;
      if (modalData?._id && modalData._id !== "") {
        // Update expense
        res = await fetch(`/api/expenses/${modalData._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modalData),
        });
      } else {
        // Create new expense
        res = await fetch("/api/expenses/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modalData),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save expense");
      }

      setExpenseModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      fetchExpenses();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <Nav showSearch={true} onSearchChange={(val) => setSearchText(val)} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-end">
          <button
            className="px-4 py-2 text-sm bg-blue-800 text-white rounded-md hover:bg-blue-900"
            onClick={() => setExpenseModalOpen(true)}
          >
            Add Expense
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found</p>
        ) : (
          <ExpensesTable
            expenses={expenses}
            pagination={pagination}
            onEdit={handleEdit}
            onDelete={confirmDelete}
            onPageChange={setPage}
          />
        )}
      </div>

      {expenseModalOpen && (
        <ExpenseModal
          isEdit={isEditClicked}
          initialData={expenseData || undefined}
          onClose={() => {
            setExpenseModalOpen(false);
            setIsEditClicked(false);
          }}
          onSubmit={addOrUpdateExpenseData}
        />
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-sm text-gray-700 mb-4 flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-600 text-xl mt-0.5" />
              <span>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteInfo?.description}</span>
                ?
              </span>
            </h2>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
