"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const BookmarksContent = dynamic(() => import("@/components/utilities/BookmarksContent"), {
  loading: () => <Loading />,
  ssr: false,
});

export default function BookmarksPage() {
  return <BookmarksContent />;
}
