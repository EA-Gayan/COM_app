export interface ModalData {
  name: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  category: string;
  stockQty: number;
  sName: string;
}

export interface ProductModalProps {
  categoryList: string[];
  isEdit?: boolean;
  initialData?: ModalData;
  onClose: () => void;
  onSubmit: (product: ModalData) => void;
}
