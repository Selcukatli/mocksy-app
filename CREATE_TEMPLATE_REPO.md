# Creating the Mocksy Template Repository

This guide walks through creating a separate template repository from the Mocksy codebase, stripped down to just the reusable infrastructure.

## Overview

**Goal**: Create `mocksy-template` - a clean, reusable starter for AI-powered apps

**Strategy**: Clone Mocksy to a new location, remove project-specific code, publish as separate template repo

**Result**: 
- Keep `mocksy/` as the full Mocksy app
- Create `mocksy-template/` for future projects

---

## Step 1: Clone to New Location

```bash
# Navigate to your Projects folder
cd ~/Documents/Projects/

# Clone mocksy to a new folder called "mocksy-template"
git clone https://github.com/Selcukatli/mocksy-app.git mocksy-template
cd mocksy-template

# Install dependencies (optional but recommended - verify everything works)
npm install

# Test that it runs (optional)
# npx convex dev  # In one terminal
# npm run dev     # In another terminal
# Then Ctrl+C to stop both

# Remove connection to original repo
rm -rf .git

# Start fresh git history
git init
git add .
git commit -m "Initial template from Mocksy"
```

**Result**: Fresh copy in `~/Documents/Projects/mocksy-template/`

**Note**: You can skip `npm install` at this step since you'll be removing files anyway. But it's helpful to verify the clone worked correctly before making changes.

---

## Step 2: Remove Mocksy-Specific Backend Code

```bash
# Navigate to template directory
cd ~/Documents/Projects/mocksy-template/

# Remove Mocksy business logic
rm -rf convex/data/apps.ts
rm -rf convex/data/appScreens.ts
rm -rf convex/data/appConcepts.ts
rm -rf convex/data/appReviews.ts
rm -rf convex/data/screenshotSizes.ts
rm -rf convex/features/appGeneration/
rm -rf convex/fileStorage/  # Or keep if you want file helpers in template

# Keep these (core infrastructure):
# ✅ convex/data/profiles.ts
# ✅ convex/utils/aisdk/
# ✅ convex/utils/fal/
# ✅ convex/webhooks/clerk/
# ✅ convex/auth.config.ts
# ✅ convex/http.ts
```

---

## Step 3: Remove Mocksy-Specific Frontend Code

```bash
# Remove Mocksy pages
rm -rf src/app/appstore/
rm -rf src/app/apps/
rm -rf src/app/generate/
rm -rf src/app/admin/  # Optional: keep if you want admin in template

# Remove Mocksy-specific components
rm src/components/AppCard.tsx
rm src/components/AppConceptCard.tsx
rm src/components/AppConceptDetailModal.tsx
rm src/components/AppListCarousel.tsx
rm src/components/AppListItem.tsx
rm src/components/AppsInCategoryCarousel.tsx
rm src/components/AppStorePreviewCard.tsx
rm src/components/CategoryFilter.tsx
rm src/components/CoverImageSelectionModal.tsx
rm src/components/FeaturedAppsCarousel.tsx
rm src/components/FeatureSlides.tsx
rm src/components/GenerateVideoModal.tsx
rm src/components/GenerationProgressBar.tsx
rm src/components/HorizontalAppCarousel.tsx
rm src/components/ImageLightbox.tsx
rm src/components/InlineStarRating.tsx
rm src/components/OnboardingDialog.tsx
rm src/components/ReviewCard.tsx
rm src/components/ReviewsSection.tsx
rm src/components/ScreenshotLightbox.tsx
rm src/components/WriteReviewModal.tsx

# Keep these (core infrastructure):
# ✅ src/components/layout/
# ✅ src/components/ui/
# ✅ src/components/RootLayoutContent.tsx
# ✅ src/components/ThemeProvider.tsx
# ✅ src/components/AuthModal.tsx
# ✅ src/components/LoginDialog.tsx
# ✅ src/components/SearchModal.tsx
# ✅ src/components/PageTransition.tsx
# ✅ src/components/Toast.tsx
# ✅ src/components/ModalWithMascot.tsx

# Remove Zustand stores
rm -rf src/stores/

# Keep these directories:
# ✅ src/providers/
# ✅ src/hooks/
# ✅ src/lib/
# ✅ src/middleware.ts
```

---

## Step 4: Clean Up BAML Files

```bash
# Remove Mocksy BAML functions
rm baml_src/app-concepts.baml
rm baml_src/app-generation.baml

# Keep these (reusable):
# ✅ baml_src/clients.baml - All LLM client configs
# ✅ baml_src/generators.baml - Generator config
# ✅ baml_src/clients.tests.baml - Test configs

# Optionally regenerate BAML client
npm run baml:generate
```

---

## Step 5: Remove Mocksy Assets and Scripts

```bash
# Remove Mocksy branding
rm public/mocksy-logo-dark-mode.png
rm public/mocksy-logo-light-mode.png
rm public/mocksy-app-icon.png
rm public/mocksy_cover.jpg
rm public/mocksy-buzzed.gif
rm public/mocksy-dancing.gif
rm public/mocksy-dancing.webm
rm public/mocksy-generating.gif
rm public/mocksy-generating.webm
rm public/mocksy-study.gif
rm public/mocksy-study.webm
rm public/mocksybot.gif
rm public/mocksybot.webm
rm public/mocsy-study-green.mp4

# Remove converted videos
rm -rf converted-videos/

# Remove project-specific scripts
rm -rf scripts/

# Keep these:
# ✅ public/next.svg
# ✅ public/vercel.svg
# ✅ public/file.svg
# ✅ public/globe.svg
# ✅ public/window.svg
```

---

## Step 6: Clean Up Documentation

```bash
# Remove Mocksy-specific docs
rm -rf docs/features/
rm -rf docs/debugging/
rm -rf docs/migrations/
rm -rf docs/pr-reviews/  # Or keep for learning

# Keep these (reusable guides):
# ✅ docs/rules/ - All setup guides for AI agents
# ✅ docs/learnings/ - Integration learnings
```

---

## Step 7: Update Schema to Template Version

**Edit `convex/schema.ts`:**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================================
  // USER PROFILES - Core authentication table
  // ============================================================================
  profiles: defineTable({
    userId: v.string(), // Clerk's user ID (unique)
    username: v.optional(v.string()), // Username from Clerk (unique when present)
    usernameUpdatedAt: v.optional(v.number()), // Last time username was synced
    firstName: v.optional(v.string()), // First name from Clerk
    lastName: v.optional(v.string()), // Last name from Clerk
    imageUrl: v.optional(v.string()), // Profile image URL from Clerk
    imageUrlUpdatedAt: v.optional(v.number()), // Last time image was synced
    isAdmin: v.optional(v.boolean()), // Admin access flag
    preferences: v.optional(
      v.object({
        // Future preferences can be added here
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  // ============================================================================
  // YOUR TABLES GO HERE
  // ============================================================================
  // Example:
  // posts: defineTable({
  //   profileId: v.id("profiles"),
  //   title: v.string(),
  //   content: v.string(),
  //   published: v.boolean(),
  //   createdAt: v.number(),
  //   updatedAt: v.number(),
  // })
  //   .index("by_profile", ["profileId"])
  //   .index("by_published", ["published"])
  //   .index("by_created", ["createdAt"]),
});
```

---

## Step 8: Update Navigation to Template Placeholders

**Edit `src/components/layout/Sidebar.tsx`:**

Replace the navigation links section (around line 85-110) with:

```typescript
// Main Navigation
<nav className="pt-2 px-2 flex flex-col items-start gap-1 flex-shrink-0">
  <Link
    href="/"
    className={cn(
      "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
      isActive('/')
        ? "text-foreground font-medium bg-muted shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}
  >
    <Home className="w-5 h-5 flex-shrink-0" />
    <span>Home</span>
  </Link>

  <Link
    href="/create"
    className={cn(
      "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
      isActive('/create')
        ? "text-foreground font-medium bg-muted shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}
  >
    <Pencil className="w-5 h-5 flex-shrink-0" />
    <span>Create</span>
  </Link>

  <button
    onClick={() => setIsSearchOpen(true)}
    className="inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full"
  >
    <Search className="w-5 h-5 flex-shrink-0" />
    <span>Search</span>
  </button>

  {/* Add your own navigation links here */}
</nav>
```

**Also update `src/components/layout/BottomTabBar.tsx`:**

```typescript
const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    isActive: pathname === '/',
  },
  {
    id: 'create',
    label: 'Create',
    icon: Pencil,
    href: '/create',
    isActive: pathname === '/create',
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    onClick: () => setIsSearchOpen(true),
    isActive: false,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
    isActive: pathname === '/profile',
  },
];
```

**Update static routes in `src/components/RootLayoutContent.tsx` (line 47):**

```typescript
// Define static (browse) pages - everything else defaults to overlay (dynamic)
const staticRoutes = ['/', '/profile', '/settings'];
```

---

## Step 9: Create Template Landing Page

**Replace `src/app/page.tsx`:**

```tsx
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome to Your AI-Powered App
        </h1>
        <p className="text-xl text-muted-foreground">
          This template includes everything you need to build production-ready AI applications
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-2">🔐 Authentication Ready</h3>
          <p className="text-sm text-muted-foreground">
            Clerk + Convex integration with automatic profile sync
          </p>
        </div>
        
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-2">🤖 AI Text Generation</h3>
          <p className="text-sm text-muted-foreground">
            GPT-5, Claude, Gemini with automatic fallbacks
          </p>
        </div>
        
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-2">🎨 AI Image Generation</h3>
          <p className="text-sm text-muted-foreground">
            FLUX, GPT Image, Imagen, and more via FAL
          </p>
        </div>
        
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-2">📱 Adaptive Navigation</h3>
          <p className="text-sm text-muted-foreground">
            Beautiful sidebar + mobile tabs, theme support
          </p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-3">Ready to Build?</h2>
        <p className="text-muted-foreground mb-4">
          Check out <code className="px-2 py-1 bg-background rounded">TEMPLATE_SETUP.md</code> for complete setup instructions
        </p>
        <div className="flex gap-4 justify-center">
          <a 
            href="https://github.com/Selcukatli/mocksy-template" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View on GitHub
          </a>
          <a 
            href="/welcome" 
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 10: Update Metadata in Layout

**Edit `src/app/layout.tsx`:**

```typescript
export const metadata: Metadata = {
  title: "AI-Powered App Template",
  description: "Production-ready starter for AI-powered applications with authentication, text/image generation, and beautiful navigation.",
  openGraph: {
    title: "AI-Powered App Template",
    description: "Production-ready starter for AI-powered applications",
    images: [
      {
        url: "/og-image.jpg", // Add your own
        width: 1200,
        height: 630,
        alt: "AI-Powered App Template",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered App Template",
    description: "Production-ready starter for AI-powered applications",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico", // Update with your icon
  },
};
```

---

## Step 11: Create Template README

**Replace `README.md`:**

```markdown
# AI-Powered App Template

Production-ready starter template for building AI-powered applications with Next.js, Convex, and modern AI tools.

## ⚡ Quick Start

```bash
# Use this template
npx degit Selcukatli/mocksy-template my-ai-app
cd my-ai-app
npm install
```

See [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md) for complete setup instructions.

## 🎯 What's Included

### Core Infrastructure
- ✅ **Authentication**: Clerk + Convex with automatic profile sync
- ✅ **User Profiles**: Complete user management with admin system
- ✅ **Adaptive Navigation**: Desktop sidebar + mobile bottom tabs
- ✅ **Theme System**: Dark/light/system mode with CSS variables
- ✅ **File Storage**: Convex file storage ready to use

### AI Infrastructure
- ✅ **Text Generation**: AI SDK with GPT-5, Claude, Gemini
- ✅ **Image Generation**: FAL integration (FLUX, GPT Image, Imagen)
- ✅ **Type-Safe LLM**: BAML for structured AI outputs
- ✅ **Streaming Support**: Real-time text streaming
- ✅ **Automatic Fallbacks**: Model chains for reliability

### UI Components
- ✅ **shadcn/ui**: Complete component library
- ✅ **Responsive Layout**: Works on all devices
- ✅ **Page Context System**: Dynamic headers and breadcrumbs
- ✅ **Animations**: Framer Motion for smooth transitions

## 🚀 Tech Stack

- **Frontend**: Next.js 15.5 + React 19
- **Backend**: Convex (Database + Backend)
- **Auth**: Clerk
- **AI Text**: AI SDK v5 (GPT-5, Claude, Gemini)
- **AI Images**: FAL (FLUX, Imagen, etc.)
- **Type-Safe AI**: BAML
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion

## 📚 Documentation

- [Setup Guide](./TEMPLATE_SETUP.md) - Complete setup instructions
- [Convex Rules](./docs/rules/convex-rules.mdc) - Convex patterns
- [BAML Setup](./docs/rules/baml-convex-setup.md) - Type-safe LLM functions
- [AI SDK Docs](./convex/utils/aisdk/README.md) - Text generation
- [FAL Docs](./convex/utils/fal/README.md) - Image generation

## 🎨 Example Use Cases

This template is perfect for:

- 📝 Content creation tools (blog writers, social media tools)
- 🎨 Image generation apps (logo makers, design tools)
- 💬 AI chatbots and assistants
- 🎭 Creative tools (story generators, art studios)
- 🎯 Any app that needs AI + beautiful UI

## 📄 License

MIT

---

Built from [Mocksy](https://github.com/Selcukatli/mocksy-app) - An AI-powered app concept generator
```

---

## Step 12: Clean Up Root-Level Files

```bash
# Remove Mocksy-specific docs
rm AGENTS.md  # Or keep if you want agent guidelines in template
rm CLAUDE.md
rm GEMINI.md
rm BAML_TAB_FIXES.md
rm STRUCTURED_DESIGN_SYSTEM.md

# Keep these:
# ✅ README.md (updated in Step 11)
# ✅ TEMPLATE_SETUP.md (already exists)
# ✅ CREATE_TEMPLATE_REPO.md (this file - optional)
# ✅ package.json
# ✅ tsconfig.json
# ✅ next.config.ts
# ✅ components.json
# ✅ convex.json
# ✅ eslint.config.mjs
# ✅ postcss.config.mjs
```

---

## Step 13: Update package.json

**Edit `package.json`:**

```json
{
  "name": "ai-app-template",
  "version": "1.0.0",
  "description": "Production-ready starter for AI-powered applications",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "npx convex codegen && next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "baml:generate": "baml-cli generate"
  },
  // ... rest stays the same
}
```

---

## Step 14: Commit Template Changes

```bash
# Review what you've changed
git status

# Add all changes
git add .

# Commit
git commit -m "Create template from Mocksy - stripped to reusable infrastructure

- Removed Mocksy business logic (apps, concepts, reviews, etc.)
- Removed project-specific components
- Kept core infrastructure (auth, AI utils, navigation)
- Updated to template landing page
- Added TEMPLATE_SETUP.md guide"
```

---

## Step 15: Create GitHub Repository

1. **Go to GitHub** → Create new repository
2. **Name**: `mocksy-template` or `ai-app-template`
3. **Description**: "Production-ready starter for AI-powered applications"
4. **Public** (so others can use it)
5. **Don't initialize** with README (you already have one)

Then push:

```bash
# Add remote
git remote add origin https://github.com/Selcukatli/mocksy-template.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 16: Mark as Template Repository

1. Go to your repo on GitHub
2. Click **Settings**
3. Scroll to **Template repository**
4. Check **"Template repository"**
5. Save

Now anyone (including you) can click **"Use this template"** to create new projects!

---

## Your Final Structure

```
~/Documents/Projects/
├── mocksy/              # Original Mocksy app
│   ├── Full business logic
│   ├── All Mocksy features
│   └── Continue development here
│
└── mocksy-template/     # Clean template repo
    ├── Core auth infrastructure
    ├── AI utilities (aisdk, fal, baml)
    ├── Navigation system
    ├── UI components
    └── TEMPLATE_SETUP.md guide
```

---

## Using the Template for New Projects

### Option 1: GitHub UI (Easiest)
1. Go to https://github.com/Selcukatli/mocksy-template
2. Click **"Use this template"** → **"Create a new repository"**
3. Name your new project
4. Clone and start building!

### Option 2: Command Line
```bash
# Using degit (removes git history)
npx degit Selcukatli/mocksy-template my-new-ai-app
cd my-new-ai-app
npm install

# Follow TEMPLATE_SETUP.md for configuration
```

---

## Maintenance

### Updating the Template

When you add new reusable infrastructure to Mocksy:

```bash
# In the original mocksy repo
git log --oneline -10  # Note the commits you want to port

# In mocksy-template repo
cd ~/Documents/Projects/mocksy-template/

# Cherry-pick specific commits
git cherry-pick <commit-hash>

# Or manually copy files and commit
cp ~/Documents/Projects/mocksy/convex/utils/newfeature.ts convex/utils/
git add convex/utils/newfeature.ts
git commit -m "Add new reusable feature from Mocksy"
git push
```

### What to Port from Mocksy → Template

✅ **Port these**:
- New AI utility functions
- Navigation improvements
- UI component enhancements
- Authentication fixes
- Theme improvements

❌ **Don't port these**:
- Mocksy business logic
- Project-specific features
- App-specific components

---

## Troubleshooting

### "I deleted too much!"
```bash
# You still have the original
cd ~/Documents/Projects/mocksy-template
rm -rf *
git clone https://github.com/Selcukatli/mocksy-app.git .
# Start over from Step 2
```

### "Git history is showing Mocksy commits"
That's fine! The template is derived from Mocksy. If you want a clean history:
```bash
# Create fresh history (optional)
rm -rf .git
git init
git add .
git commit -m "Initial template"
git remote add origin https://github.com/Selcukatli/mocksy-template.git
git push -u origin main --force
```

---

## Next Steps

After creating the template:

1. ✅ Test it works: `npm install && npx convex dev && npm run dev`
2. ✅ Update GitHub repo description and topics
3. ✅ Add a nice cover image (`public/og-image.jpg`)
4. ✅ Create your first project from the template
5. ✅ Iterate and improve based on experience

---

## Questions?

- Original Mocksy: https://github.com/Selcukatli/mocksy-app
- Template repo: https://github.com/Selcukatli/mocksy-template (after Step 15)
- Setup guide: `TEMPLATE_SETUP.md`

