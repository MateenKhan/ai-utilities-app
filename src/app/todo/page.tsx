import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const TodoContent = dynamic(() => import("@/components/utilities/TodoContent"), {
  loading: () => <Loading />,
  ssr: false,
});

export default function TodoPage() {
  return <TodoContent />;
}
