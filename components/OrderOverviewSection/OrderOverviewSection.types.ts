import { dashboardResponseData } from "@/app/dashboard/dashboardPage.types";

export type FilterType =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "FROM_TO";

export interface FilterRequest {
  filterType: FilterType;
  fromDate?: string;
  toDate?: string;
}

export const filters: { label: string; value: FilterType }[] = [
  { label: "TODAY", value: "TODAY" },
  { label: "THIS WEEK", value: "THIS_WEEK" },
  { label: "THIS MONTH", value: "THIS_MONTH" },
  { label: "THIS YEAR", value: "THIS_YEAR" },
  { label: "FROM/TO", value: "FROM_TO" },
];

export interface OrderOverviewSectionProps {
  ordersOverviewRequestPayload: (data: FilterRequest) => void;
  responseData: dashboardResponseData | null;
}
