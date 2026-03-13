# UE5 Blueprint Documentation

A comprehensive Next.js-based documentation site for Unreal Engine 5 Blueprints with visual examples and copy/paste support.

## Features

### 🎮 Comprehensive Coverage
- **14 Categories**: From basics to advanced topics
  - Basics, Character Blueprints, Level Blueprints
  - Animation, AI & Behavior, Interfaces
  - Physics, Networking, Gameplay
  - UI & HUD, Materials, Particles & VFX
  - Audio, Utilities

### 📋 Copy & Paste Ready
- All blueprints include raw UE5 blueprint code
- One-click copy functionality
- Direct paste into Unreal Engine 5 editor
- No manual node reconstruction needed

### 🔍 Advanced Search
- Full-text search across titles, descriptions, and tags
- Filter by category
- Filter by difficulty level (Beginner, Intermediate, Advanced)
- Real-time results

### 🎨 Modern UI
- Beautiful gradient headers
- Dark mode support
- Responsive design
- Visual blueprint preview areas
- Intuitive navigation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint

## Getting Started

### Prerequisites
- Node.js 18+ or compatible version
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd ue5-blueprints-docs
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
ue5-blueprints-docs/
├── app/                          # Next.js App Router pages
│   ├── blueprints/              # All blueprints listing
│   │   └── [id]/               # Individual blueprint pages
│   ├── category/               # Category pages
│   │   └── [id]/
│   ├── categories/             # All categories listing
│   ├── search/                 # Search functionality
│   ├── layout.tsx              # Root layout with Header/Footer
│   └── page.tsx                # Homepage
├── components/                  # React components
│   ├── blueprint/
│   │   ├── BlueprintCard.tsx   # Blueprint card component
│   │   └── BlueprintViewer.tsx # Blueprint detail viewer
│   ├── Header.tsx              # Site navigation
│   └── Footer.tsx              # Site footer
├── lib/                        # Utilities and data
│   ├── types/
│   │   └── blueprint.ts        # TypeScript interfaces
│   └── data/
│       ├── categories.ts       # Category definitions
│       └── sample-blueprints.ts # Blueprint data
└── public/                     # Static assets
```

## Adding New Blueprints

1. Open `lib/data/sample-blueprints.ts`
2. Add a new blueprint object to the `sampleBlueprints` array:

```typescript
{
  id: 'unique-id',
  title: 'Blueprint Title',
  description: 'Detailed description',
  category: 'category-id', // Must match a category
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  ueVersion: '5.7',
  tags: ['tag1', 'tag2'],
  author: 'Author Name',
  createdAt: '2026-03-13',
  updatedAt: '2026-03-13',
  code: `Paste raw UE5 blueprint code here`,
  nodes: [],
  connections: [],
  thumbnail: '/images/blueprints/your-image.png' // Optional
}
```

## Blueprint Code Format

Blueprint code should be the raw text format from Unreal Engine:
- Copy nodes from UE5 Blueprint Editor
- Includes node type, properties, pins, and connections
- Users can paste directly back into UE5

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Roadmap

### Current Version (v1.0)
✅ Core blueprint documentation
✅ Category organization
✅ Search functionality
✅ Copy/paste support
✅ Responsive design

### Future Enhancements
- [ ] Visual node renderer (interactive blueprint visualization)
- [ ] User authentication and custom blueprints
- [ ] Blueprint rating and comments
- [ ] Export blueprints as images
- [ ] Advanced filtering (by UE version, tags)
- [ ] Blueprint collections and favorites
- [ ] Community contributions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Inspired By

This project is inspired by [blueprintUE.com](https://blueprintue.com/) which provides an excellent platform for sharing Unreal Engine blueprints.

## License

This project is for educational purposes. All Unreal Engine trademarks and copyrights belong to Epic Games.

---

Built with ❤️ for the Unreal Engine community
