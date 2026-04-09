import { useOutletContext } from "react-router-dom";
import type { DashboardOutletContext } from "@/pages/Dashboard";

export function useDashboardContext() {
  return useOutletContext<DashboardOutletContext>();
}
