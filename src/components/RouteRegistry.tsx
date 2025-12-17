"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";

export default function RouteRegistry() {
    const pathname = usePathname();
    const { showNotification } = useNotification();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Notify on route change
        showNotification(`Navigated to ${pathname}`, "info");

    }, [pathname, showNotification]);

    return null;
}
