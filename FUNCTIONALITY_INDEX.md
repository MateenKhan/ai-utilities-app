# Functionality Index

This document provides an index of all major functionalities in the application, along with links to the relevant files.

## Core

*   **Authentication**: Handles user login, signup, and session management.
    *   [Auth Context](src/contexts/AuthContext.tsx)
    *   [Login Page](src/app/login/page.tsx)
    *   [Signup Page](src/app/signup/page.tsx)
    *   [Auth API Routes](src/app/api/auth)
    *   [Auth Library](src/lib/auth.ts)
*   **Database**: Manages the database connection and schema.
    *   [Prisma Client](src/lib/prisma.ts)
    *   [Prisma Schema](prisma/schema.prisma)
*   **Application Layout**: Defines the main application layout and global components.
    *   [Root Layout](src/app/layout.tsx)
    *   [App Layout Component](src/components/AppLayout.tsx)
    *   [Header Component](src/components/Header.tsx)
    *   [Sidebar Component](src/components/Sidebar.tsx)
    *   [Loading Component](src/components/Loading.tsx)
    *   [Route Registry](src/components/RouteRegistry.tsx)
*   **Theming**: Provides theme management for the application.
    *   [Theme Provider](src/components/ThemeProvider.tsx)
    *   [Theme Selector](src/components/ThemeSelector.tsx)
*   **Contexts**: Global state management.
    *   [Auth Context](src/contexts/AuthContext.tsx)
    *   [Notification Context](src/contexts/NotificationContext.tsx)
    *   [Sidebar Context](src/contexts/SidebarContext.tsx)

## Utilities / Features

*   **Amazon Integration**: Handles Amazon login, configuration, and order retrieval.
    *   [Amazon API Callback](src/app/api/amazon/callback/route.ts)
    *   [Amazon API Config](src/app/api/amazon/config/route.ts)
    *   [Amazon API Login](src/app/api/amazon/login/route.ts)
    *   [Amazon API Orders](src/app/api/amazon/orders/route.ts)
    *   [Amazon Config Utility](src/utils/amazonConfig.ts)
    *   [Amazon Order Parser Utility](src/utils/amazonOrderParser.ts)
*   **Bookmarks**: Allows users to save and organize bookmarks.
    *   [Bookmarks Page](src/app/bookmarks/page.tsx)
    *   [Bookmarks Content Component](src/components/utilities/BookmarksContent.tsx)
    *   [Bookmarks API Route](src/app/api/bookmarks/route.ts)
    *   [Bookmarks Hook](src/hooks/useBookmarks.ts)
*   **Calculator**: A simple calculator with history.
    *   [Calculator Page](src/app/calculator/page.tsx)
    *   [Calculator Content Component](src/components/utilities/CalculatorContent.tsx)
    *   [Calculator History API Route](src/app/api/calculator/history/route.ts)
    *   [Calculator State API Route](src/app/api/calculator/state/route.ts)
*   **Cloud Images**: Displays a gallery of cloud-hosted images.
    *   [Cloud Images API Route](src/app/api/cloud-images/route.ts)
    *   [Cloud Image Gallery Component](src/components/utilities/CloudImageGallery.tsx)
*   **Image Tiles**: A tool for creating tiled images from an uploaded image.
    *   [Image Tiles Page](src/app/image-tiles/page.tsx)
    *   [Image Tiles API Route](src/app/api/image-tiles/route.ts)
    *   [Image Tiles Main Content Component](src/components/utilities/ImageTilesContent.tsx)
    *   [Dimension Inputs Component](src/components/utilities/ImageTiles/DimensionInputs.tsx)
    *   [Image Upload Component](src/components/utilities/ImageTiles/ImageUpload.tsx)
    *   [Tile Display Component](src/components/utilities/ImageTiles/TileDisplay.tsx)
    *   [Tile Generation Component](src/components/utilities/ImageTiles/TileGeneration.tsx)
    *   [Image Tiles State Management](src/components/utilities/ImageTiles/state.ts)
    *   [Image Tiles Types](src/components/utilities/ImageTiles/types.ts)
    *   [Image Tiles Utilities](src/components/utilities/ImageTiles/utils.ts)
    *   [Image Tiles Hooks](src/components/utilities/ImageTiles/hooks)
*   **Save/Load Projects**: Functionality for saving and loading user projects.
    *   [Save/Load Page](src/app/save-load/page.tsx)
    *   [Save Load Content Component](src/components/utilities/SaveLoadContent.tsx)
    *   [Saved Projects List Component](src/components/utilities/SavedProjectsList.tsx)
*   **Todos**: A simple todo list application.
    *   [Todo Page](src/app/todo/page.tsx)
    *   [Todo Content Component](src/components/utilities/TodoContent.tsx)
    *   [Todos API Route](src/app/api/todos/route.ts)
    *   [Todos ID API Route](src/app/api/todos/[id]/route.ts)
    *   [Todos States API Route](src/app/api/todos/states/route.ts)
    *   [Todos Hook](src/hooks/useTodos.ts)
*   **Health Check**: API endpoint for application health checks.
    *   [Health API Route](src/app/api/health/route.ts)
*   **Test Endpoint**: API endpoint for testing purposes.
    *   [Test API Route](src/app/api/test/route.ts)
