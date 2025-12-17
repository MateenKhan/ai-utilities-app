live site link: 

# Utilities App

A comprehensive collection of useful tools built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 📚 Bookmarks Manager
- Create, read, update, and delete bookmarks
- Organize bookmarks with tags
- Search functionality
- Responsive card-based layout

### 🧮 Advanced Calculator
- Scientific calculator with basic operations
- Unit conversion (Length, Weight, Temperature)
- Calculation history with timestamp
- Keyboard support
- Toggleable views (Calculator Only, Converter Only, Both)
- Resizable panels

### ✅ Todo List
- Create, update, and delete tasks
- Mark tasks as complete/incomplete
- Add notes to tasks
- Upload and preview documents
- Local storage persistence

### 🖼️ Image Tiles Generator
- Convert images into printable A4 tiles
- Custom tile dimensions
- Download individual tiles or all tiles at once
- Preview generated tiles

### 🎨 Theme Customization
- **Preset Themes**: Choose from Default and Dark themes
- **Custom Themes**: Create your own themes with:
  - 60-30-10 color rule implementation (Primary 60%, Secondary 30%, Accent 10%)
  - Custom font families and styling
  - Adjustable border radius and box shadows
  - Custom color palette
- **Font Management**: 
  - Add custom fonts from Google Fonts or other sources
  - Manage multiple font libraries
  - Export themes with embedded fonts
- **Export/Import**:
  - Export themes as JSON files
  - Export themes with embedded font files in ZIP format
  - Import themes from JSON files
  - Share themes between devices

### 💾 Save & Load Data
- Export all app data (bookmarks, todos, calculator history, image tiles) to ZIP
- Import data from ZIP files
- Export themes with custom fonts
- Complete data migration between devices

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd utilities-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
The application will be available at http://localhost:3000

#### Production Build
```bash
npm run build
npm start
```

### Exporting for Static Hosting
```bash
npm run export
```
This creates a static export in the `docs` folder for easy deployment to GitHub Pages or similar services.

## Technologies Used

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Icons** for icons
- **JSZip** for ZIP file handling
- **FileSaver.js** for file downloads

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── bookmarks/       # Bookmarks manager
│   ├── calculator/      # Calculator and unit converter
│   ├── image-tiles/     # Image tile generator
│   ├── save-load/       # Data export/import
│   ├── todo/            # Todo list
│   ├── layout.tsx       # Root layout with theme provider
│   └── page.tsx         # Home page
├── components/          # Reusable components
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── ThemeProvider.tsx # Theme management context
│   └── ThemeSelector.tsx # Theme selection UI
├── hooks/               # Custom React hooks
│   ├── useBookmarks.ts  # Bookmarks state management
│   └── useTodos.ts      # Todo state management
└── utils/               # Utility functions
```

## Theme Customization Guide

### Using Preset Themes
1. Click the "Theme" button in the top right corner
2. Select from available preset themes (Default, Dark)

### Creating Custom Themes
1. Click the "Theme" button in the top right corner
2. Select "Customize Theme"
3. Adjust colors following the 60-30-10 rule:
   - Primary Color (60% dominance)
   - Secondary Color (30% support)
   - Accent Color (10% highlight)
4. Customize typography (font family, size, weight)
5. Adjust styling (border radius, box shadow)
6. Add custom fonts by URL
7. Click "Save Theme"

### Managing Custom Fonts
1. In the theme customizer, click "Manage" next to Custom Fonts
2. Enter the URL for a font stylesheet (e.g., Google Fonts CDN)
3. Click "Add" to include the font in your theme
4. Use the font family name in the Font Family field

### Exporting Themes
1. Click the "Theme" button in the top right corner
2. Choose "Export Themes" to save theme definitions
3. Choose "Export with Fonts" to save themes with embedded font files

### Importing Themes
1. Click the "Theme" button in the top right corner
2. Select "Import Themes"
3. Choose a previously exported theme JSON file

## Data Management

### Exporting All Data
1. Navigate to the "Save/Load" page
2. Click "Export All Data"
3. Save the generated ZIP file

### Importing Data
1. Navigate to the "Save/Load" page
2. Click "Choose File" and select a previously exported ZIP file
3. The application will reload with imported data

## Keyboard Shortcuts

### Calculator
- `0-9`: Input digits
- `+`, `-`, `*`, `/`: Operators
- `Enter` or `=`: Equals
- `Escape`: Clear (AC)
- `.`: Decimal point
- `%`: Percentage
- `H`: Toggle history
- `1`: Calculator only view
- `2`: Converter only view
- `3`: Both views

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.