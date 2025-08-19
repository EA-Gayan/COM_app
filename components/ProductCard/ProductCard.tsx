import React from "react";
import { ProductCardProps } from "./ProductCard.types";

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  description,
  price,
  imageUrl,
  availableQty,
}) => {
  return (
    <div className="border rounded-xl p-3 shadow-sm hover:shadow-md transition text-sm bg-white">
      {/* Product Image */}
      <h2 className="font-medium truncate">{name}</h2>

      <img
        src={imageUrl || "/placeholder.png"}
        alt={name}
        className="mt-4 h-20 w-full object-cover rounded-md mb-4"
      />

      {/* Product Info */}
      <h2 className="font-medium bg-red-50 mt-2 truncate">
        Available Qty: {availableQty}
      </h2>
      <p className="font-bold mt-2 text-base">Rs {price}</p>
    </div>
  );
};

export default ProductCard;
