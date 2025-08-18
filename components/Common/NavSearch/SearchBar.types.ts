export interface SearchBarProps {
  isShow: boolean; // show or hide
  placeholder?: string; // input placeholder text
  value?: string; // controlled input
  onChange?: (value: string) => void; // callback when typing
  onSearch?: (value: string) => void; // callback when pressing Enter or Search btn
}
