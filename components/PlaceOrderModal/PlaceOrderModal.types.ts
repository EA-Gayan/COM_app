export interface PlaceOrderModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; tel: string }) => void;
}
