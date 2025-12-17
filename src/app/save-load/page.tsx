import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const SaveLoadContent = dynamic(() => import("@/components/utilities/SaveLoadContent"), {
  loading: () => <Loading />,
});

export default function SaveLoadPage() {
  return <SaveLoadContent />;
}
