import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const CalculatorContent = dynamic(() => import("@/components/utilities/CalculatorContent"), {
  loading: () => <Loading />,
});

export default function CalculatorPage() {
  return <CalculatorContent />;
}