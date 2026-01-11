"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const CalculatorContent = dynamic(() => import("@/components/utilities/CalculatorContent"), {
  loading: () => <Loading />,
  ssr: false,
});

export default function CalculatorPage() {
  return <CalculatorContent />;
}