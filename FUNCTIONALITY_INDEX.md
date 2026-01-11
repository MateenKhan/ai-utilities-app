# Functionality Index

This document provides an index of the major functionalities in the Utilities App and pointers to the relevant code.

## Core

*   **Authentication**: Handles user login, logout, and session management.
    *   API Routes: [`src/app/api/auth/`](src/app/api/auth/)
    *   Frontend Logic: [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx)
    *   Login Page: [`src/app/login/page.tsx`](src/app/login/page.tsx)
*   **Database**: Manages the database schema and connections.
    *   Schema: [`prisma/schema.prisma`](prisma/schema.prisma)
    *   Prisma Client: [`src/lib/prisma.ts`](src/lib/prisma.ts)
*   **Routing**: Defines the application's routes.
    *   Layout: [`src/app/layout.tsx`](src/app/layout.tsx)
    *   Route Registry: [`src/components/RouteRegistry.tsx`](src/components/RouteRegistry.tsx)

## Utilities

*   **Bookmarks**: Allows users to save and organize bookmarks.
    *   API Route: [`src/app/api/bookmarks/route.ts`](src/app/api/bookmarks/route.ts)
    *   Frontend Component: [`src/components/utilities/BookmarksContent.tsx`](src/components/utilities/BookmarksContent.tsx)
    *   Hook: [`src/hooks/useBookmarks.ts`](src/hooks/useBookmarks.ts)
*   **Calculator**: A simple calculator with history.
    *   API Routes: [`src/app/api/calculator/`](src/app/api/calculator/)
    *   Frontend Component: [`src/components/utilities/CalculatorContent.tsx`](src/components/utilities/CalculatorContent.tsx)
*   **Cloud Image Gallery**: A gallery for images stored in the cloud.
    *   API Route: [`src/app/api/cloud-images/route.ts`](src/app/api/cloud-images/route.ts)
    *   Frontend Component: [`src/components/utilities/CloudImageGallery.tsx`](src/components/utilities/CloudImageGallery.tsx)
*   **Image Tiles**: A utility for creating image tiles.
    *   API Route: [`src/app/api/image-tiles/route.ts`](src/app/api/image-tiles/route.ts)
    *   Frontend Component: [`src/components/utilities/ImageTilesContent.tsx`](src/components/utilities/ImageTilesContent.tsx)
*   **Save/Load**: A utility for saving and loading application state.
    *   Frontend Component: [`src/components/utilities/SaveLoadContent.tsx`](src/components/utilities/SaveLoadContent.tsx)
*   **Todos**: A simple todo list application.
    *   API Routes: [`src/app/api/todos/`](src/app/api/todos/)
    *   Frontend Component: [`src/components/utilities/TodoContent.tsx`](src/components/utilities/TodoContent.tsx)
    *   Hook: [`src/hooks/useTodos.ts`](src/hooks/useTodos.ts)
