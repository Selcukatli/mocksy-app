#!/bin/bash

# =============================================================================
# Create Mocksy Template Repository
# =============================================================================
# This script creates a clean template repository from Mocksy by:
# 1. Cloning to a new directory
# 2. Removing Mocksy-specific code
# 3. Creating template versions of key files
# 4. Setting up git for the new repo
#
# Usage: ./create-template.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Creating Mocksy Template Repository${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# =============================================================================
# Step 1: Clone Repository
# =============================================================================
echo -e "${YELLOW}Step 1: Cloning Mocksy to new location...${NC}"

cd ~/Documents/Projects/

if [ -d "mocksy-template" ]; then
  echo -e "${RED}Error: mocksy-template directory already exists!${NC}"
  echo "Please remove it first: rm -rf ~/Documents/Projects/mocksy-template"
  exit 1
fi

git clone https://github.com/Selcukatli/mocksy-app.git mocksy-template
cd mocksy-template

echo -e "${GREEN}✓ Cloned successfully${NC}"
echo ""

# =============================================================================
# Step 2: Remove Git History
# =============================================================================
echo -e "${YELLOW}Step 2: Removing original git history...${NC}"

rm -rf .git
git init
git add .
git commit -m "Initial template from Mocksy"

echo -e "${GREEN}✓ Fresh git history created${NC}"
echo ""

# =============================================================================
# Step 3: Remove Mocksy Backend Code
# =============================================================================
echo -e "${YELLOW}Step 3: Removing Mocksy backend code...${NC}"

rm -f convex/data/apps.ts
rm -f convex/data/appScreens.ts
rm -f convex/data/appConcepts.ts
rm -f convex/data/appReviews.ts
rm -f convex/data/screenshotSizes.ts
rm -rf convex/features/appGeneration/
rm -rf convex/fileStorage/

echo -e "${GREEN}✓ Backend code removed${NC}"
echo ""

# =============================================================================
# Step 4: Remove Mocksy Frontend Code
# =============================================================================
echo -e "${YELLOW}Step 4: Removing Mocksy frontend code...${NC}"

# Remove pages
rm -rf src/app/appstore/
rm -rf src/app/apps/
rm -rf src/app/generate/
rm -rf src/app/admin/

# Remove components
rm -f src/components/AppCard.tsx
rm -f src/components/AppConceptCard.tsx
rm -f src/components/AppConceptDetailModal.tsx
rm -f src/components/AppListCarousel.tsx
rm -f src/components/AppListItem.tsx
rm -f src/components/AppsInCategoryCarousel.tsx
rm -f src/components/AppStorePreviewCard.tsx
rm -f src/components/CategoryFilter.tsx
rm -f src/components/CoverImageSelectionModal.tsx
rm -f src/components/FeaturedAppsCarousel.tsx
rm -f src/components/FeatureSlides.tsx
rm -f src/components/GenerateVideoModal.tsx
rm -f src/components/GenerationProgressBar.tsx
rm -f src/components/HorizontalAppCarousel.tsx
rm -f src/components/ImageLightbox.tsx
rm -f src/components/InlineStarRating.tsx
rm -f src/components/OnboardingDialog.tsx
rm -f src/components/ReviewCard.tsx
rm -f src/components/ReviewsSection.tsx
rm -f src/components/ScreenshotLightbox.tsx
rm -f src/components/WriteReviewModal.tsx

# Remove stores
rm -rf src/stores/

echo -e "${GREEN}✓ Frontend code removed${NC}"
echo ""

# =============================================================================
# Step 5: Remove BAML Files
# =============================================================================
echo -e "${YELLOW}Step 5: Removing Mocksy BAML functions...${NC}"

rm -f baml_src/app-concepts.baml
rm -f baml_src/app-generation.baml

echo -e "${GREEN}✓ BAML files removed${NC}"
echo ""

# =============================================================================
# Step 6: Remove Assets and Scripts
# =============================================================================
echo -e "${YELLOW}Step 6: Removing Mocksy assets and scripts...${NC}"

# Remove branding
rm -f public/mocksy-*.png
rm -f public/mocksy-*.gif
rm -f public/mocksy-*.webm
rm -f public/mocksy*.gif
rm -f public/mocksy*.webm
rm -f public/mocksy_cover.jpg
rm -f public/mocsy-*.gif
rm -f public/mocsy-*.webm
rm -f public/mocsy-*.mp4

# Remove directories
rm -rf converted-videos/
rm -rf scripts/

echo -e "${GREEN}✓ Assets and scripts removed${NC}"
echo ""

# =============================================================================
# Step 7: Remove Documentation
# =============================================================================
echo -e "${YELLOW}Step 7: Cleaning up documentation...${NC}"

rm -rf docs/features/
rm -rf docs/debugging/
rm -rf docs/migrations/
rm -rf docs/pr-reviews/

# Remove root docs
rm -f AGENTS.md
rm -f CLAUDE.md
rm -f GEMINI.md
rm -f BAML_TAB_FIXES.md
rm -f STRUCTURED_DESIGN_SYSTEM.md
rm -f CREATE_TEMPLATE_REPO.md
rm -f create-template.sh  # Remove this script from template

echo -e "${GREEN}✓ Documentation cleaned${NC}"
echo ""

# =============================================================================
# Step 8: Update Schema
# =============================================================================
echo -e "${YELLOW}Step 8: Updating schema.ts...${NC}"

cat > convex/schema.ts << 'EOF'
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
EOF

echo -e "${GREEN}✓ Schema updated${NC}"
echo ""

# =============================================================================
# Step 9: Create Template Landing Page
# =============================================================================
echo -e "${YELLOW}Step 9: Creating template landing page...${NC}"

cat > src/app/page.tsx << 'EOF'
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
EOF

echo -e "${GREEN}✓ Landing page created${NC}"
echo ""

# =============================================================================
# Step 10: Update package.json
# =============================================================================
echo -e "${YELLOW}Step 10: Updating package.json...${NC}"

# Use node to update package.json (cross-platform)
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.name = 'ai-app-template';
pkg.version = '1.0.0';
pkg.description = 'Production-ready starter for AI-powered applications';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo -e "${GREEN}✓ package.json updated${NC}"
echo ""

# =============================================================================
# Step 11: Create Template README
# =============================================================================
echo -e "${YELLOW}Step 11: Creating template README...${NC}"

cat > README.md << 'EOF'
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
EOF

echo -e "${GREEN}✓ README created${NC}"
echo ""

# =============================================================================
# Step 12: Commit Changes
# =============================================================================
echo -e "${YELLOW}Step 12: Committing template changes...${NC}"

git add .
git commit -m "Create template from Mocksy - stripped to reusable infrastructure

- Removed Mocksy business logic (apps, concepts, reviews, etc.)
- Removed project-specific components
- Kept core infrastructure (auth, AI utils, navigation)
- Updated to template landing page
- Added TEMPLATE_SETUP.md guide"

echo -e "${GREEN}✓ Changes committed${NC}"
echo ""

# =============================================================================
# Done!
# =============================================================================
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Template Repository Created Successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}Location:${NC} ~/Documents/Projects/mocksy-template/"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test the template:"
echo "   cd ~/Documents/Projects/mocksy-template"
echo "   npm install"
echo "   npx convex dev  # In one terminal"
echo "   npm run dev     # In another terminal"
echo ""
echo "2. Create GitHub repository:"
echo "   - Go to GitHub and create new repo: 'mocksy-template'"
echo "   - Run: git remote add origin https://github.com/Selcukatli/mocksy-template.git"
echo "   - Run: git push -u origin main"
echo ""
echo "3. Mark as template:"
echo "   - Go to repo Settings → Check 'Template repository'"
echo ""
echo "4. Use for new projects:"
echo "   - Click 'Use this template' on GitHub"
echo "   - Or: npx degit Selcukatli/mocksy-template my-new-app"
echo ""
echo -e "${GREEN}Done! 🎉${NC}"




