"use client";

import { useRouter } from "next/navigation";
import { Paper, Tabs, Tab } from "@mui/material";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Calculator", href: "/calculator" },
  { label: "Todo", href: "/todo" },
  { label: "Image Tiles", href: "/image-tiles" },
  { label: "Save/Load", href: "/save-load" },
];

interface UtilityNavProps {
  current: string;
}

export default function UtilityNav({ current }: UtilityNavProps) {
  const router = useRouter();

  const handleChange = (_event: React.SyntheticEvent, value: string) => {
    if (value !== current) {
      router.push(value);
    }
  };

  return (
    <Paper variant="outlined" sx={{ mb: 4 }}>
      <Tabs
        value={current}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
      >
        {NAV_ITEMS.map((tab) => (
          <Tab key={tab.href} label={tab.label} value={tab.href} />
        ))}
      </Tabs>
    </Paper>
  );
}
