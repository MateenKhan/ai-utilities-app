"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const ImageTilesContent = dynamic(() => import("@/components/utilities/ImageTilesContent"), {
  loading: () => <Loading />,
  ssr: false,
});

export default function ImageTilesPage() {
  return <ImageTilesContent />;
}
