import { dashboardResponseData } from "@/app/dashboard/dashboardPage.types";
import { Pagination } from "@/app/products/productsPage.types";

export interface ProductOverviewSectionProps {
  productOverviewRequestPayload: (data: Pagination) => void;
  responseData: dashboardResponseData | null;
}
