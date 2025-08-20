// Type definitions
interface Event {
  title: string;
  start: Date;
  end: Date;
  description: string;
  type: string;
}

export interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}
