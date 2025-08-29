import { FaEdit, FaTrash } from "react-icons/fa";
import { ProductsTableProps } from "./ProductsTable.types";

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                PRODUCT
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                CATEGORY
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                PURCHASE PRICE
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                SELLING PRICE
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                STOCK QTY
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.category || "-"}
                </td>
                <td className="px-4 py-3 font-medium">{item.perchasePrice}</td>
                <td className="px-4 py-3 font-medium">{item.sellingPrice}</td>
                <td className="px-4 py-3 font-medium text-red-600">
                  {item.stockQty}
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <button
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                    onClick={() => onEdit(item)}
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    onClick={() => onDelete(item._id)}
                  >
                    <FaTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
