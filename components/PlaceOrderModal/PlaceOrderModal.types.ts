export interface placeOrderOnSubmitData {
  name: string;
  telNo: string;
}

export interface PlaceOrderModalProps {
  onClose: () => void;
  onSubmit: (data: placeOrderOnSubmitData) => void;
  onCompleteOrder: (click: boolean) => void;
  onWhatsappOrder: (click: boolean) => void;
}
