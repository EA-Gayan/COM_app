// Type definitions
interface Event {
  id: number;
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
  onAdd: (event: Omit<Event, "id">) => void;
}
