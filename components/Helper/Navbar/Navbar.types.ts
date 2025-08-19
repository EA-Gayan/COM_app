export interface NavProps {
  showSearch: boolean;
  onSearchChange?: (value: string) => void;
  pageType: (value: string) => void;
}
