import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

export const LineChart = dynamic(() => import("./LineChart").then((mod) => mod.LineChart), {
  loading: () => <Skeleton className="h-[320px] w-full" />,
  ssr: true,
});

export const AreaChart = dynamic(() => import("./AreaChart").then((mod) => mod.AreaChart), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: true,
});

export const BarChart = dynamic(() => import("./BarChart").then((mod) => mod.BarChart), {
  loading: () => <Skeleton className="h-[250px] w-full" />,
  ssr: true,
});
