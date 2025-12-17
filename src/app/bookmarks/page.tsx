import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const BookmarksContent = dynamic(() => import("@/components/utilities/BookmarksContent"), {
  loading: () => <Loading />,
});

export default function BookmarksPage() {
  return <BookmarksContent />;
}
