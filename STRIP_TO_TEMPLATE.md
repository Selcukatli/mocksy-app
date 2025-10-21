# Strip Mocksy to Template - Execution Instructions

**Context**: This is a cloned copy of Mocksy that needs to be stripped down to a reusable template. Execute these steps in order to remove all Mocksy-specific code while keeping the reusable infrastructure.

**Current directory**: You are in the cloned mocksy-template folder

---

## Files to Delete

### Backend - Mocksy Business Logic
```
convex/data/apps.ts
convex/data/appScreens.ts
convex/data/appConcepts.ts
convex/data/appReviews.ts
convex/data/screenshotSizes.ts
convex/features/appGeneration/
convex/fileStorage/
```

### Frontend - Mocksy Pages
```
src/app/appstore/
src/app/apps/
src/app/generate/
src/app/admin/
```

### Frontend - Mocksy Components
```
src/components/AppCard.tsx
src/components/AppConceptCard.tsx
src/components/AppConceptDetailModal.tsx
src/components/AppListCarousel.tsx
src/components/AppListItem.tsx
src/components/AppsInCategoryCarousel.tsx
src/components/AppStorePreviewCard.tsx
src/components/CategoryFilter.tsx
src/components/CoverImageSelectionModal.tsx
src/components/FeaturedAppsCarousel.tsx
src/components/FeatureSlides.tsx
src/components/GenerateVideoModal.tsx
src/components/GenerationProgressBar.tsx
src/components/HorizontalAppCarousel.tsx
src/components/ImageLightbox.tsx
src/components/InlineStarRating.tsx
src/components/OnboardingDialog.tsx
src/components/ReviewCard.tsx
src/components/ReviewsSection.tsx
src/components/ScreenshotLightbox.tsx
src/components/WriteReviewModal.tsx
```

### Frontend - Stores
```
src/stores/
```

### BAML - Mocksy Functions
```
baml_src/app-concepts.baml
baml_src/app-generation.baml
```

### Assets - Mocksy Branding
```
public/mocksy-logo-dark-mode.png
public/mocksy-logo-light-mode.png
public/mocksy-app-icon.png
public/mocksy_cover.jpg
public/mocksy-buzzed.gif
public/mocksy-dancing.gif
public/mocksy-dancing.webm
public/mocksy-generating.gif
public/mocksy-generating.webm
public/mocksy-study.gif
public/mocksy-study.webm
public/mocksybot.gif
public/mocksybot.webm
public/mocsy-study-green.mp4
converted-videos/
```

### Scripts - Mocksy Utilities
```
scripts/
```

### Documentation - Mocksy Specific
```
docs/features/
docs/debugging/
docs/migrations/
docs/pr-reviews/
AGENTS.md
CLAUDE.md
GEMINI.md
BAML_TAB_FIXES.md
STRUCTURED_DESIGN_SYSTEM.md
CREATE_TEMPLATE_REPO.md
create-template.sh
```

---

## Files to Keep (DO NOT DELETE)

### Backend - Core Infrastructure
```
✅ convex/data/profiles.ts
✅ convex/utils/aisdk/
✅ convex/utils/fal/
✅ convex/webhooks/clerk/
✅ convex/auth.config.ts
✅ convex/http.ts
✅ convex/crons.ts
✅ convex/README.md
```

### Frontend - Core Infrastructure
```
✅ src/components/layout/
✅ src/components/ui/
✅ src/components/RootLayoutContent.tsx
✅ src/components/ThemeProvider.tsx
✅ src/components/AuthModal.tsx
✅ src/components/LoginDialog.tsx
✅ src/components/SearchModal.tsx
✅ src/components/PageTransition.tsx
✅ src/components/Toast.tsx
✅ src/components/ModalWithMascot.tsx
✅ src/providers/
✅ src/hooks/
✅ src/lib/
✅ src/middleware.ts
✅ src/app/layout.tsx
✅ src/app/globals.css
✅ src/app/not-found.tsx
✅ src/app/profile/
✅ src/app/welcome/
```

### BAML - Core Client Configs
```
✅ baml_src/clients.baml
✅ baml_src/generators.baml
✅ baml_src/clients.tests.baml
```

### Documentation - Reusable Guides
```
✅ docs/rules/
✅ docs/learnings/
✅ TEMPLATE_SETUP.md
```

### Configuration Files
```
✅ package.json
✅ tsconfig.json
✅ next.config.ts
✅ convex.json
✅ components.json
✅ eslint.config.mjs
✅ postcss.config.mjs
```

---

## Files to Update

### 1. Update `convex/schema.ts`

Replace entire contents with:

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

### 2. Update `src/app/page.tsx`

Replace entire contents with:

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

### 3. Update `package.json`

Update these fields only:
```json
{
  "name": "ai-app-template",
  "version": "1.0.0",
  "description": "Production-ready starter for AI-powered applications"
}
```

### 4. Create new `README.md`

Replace entire contents with:

```markdown
# AI-Powered App Template

Production-ready starter template for building AI-powered applications with Next.js, Convex, and modern AI tools.

## ⚡ Quick Start

\`\`\`bash
# Use this template
npx degit Selcukatli/mocksy-template my-ai-app
cd my-ai-app
npm install
\`\`\`

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

## Verification Steps

After executing all deletions and updates:

1. Run `npm install` to ensure dependencies still work
2. Run `npm run baml:generate` to regenerate BAML client
3. Check that these key files exist:
   - `convex/data/profiles.ts`
   - `convex/utils/aisdk/`
   - `convex/utils/fal/`
   - `src/components/layout/`
   - `src/providers/`
   - `TEMPLATE_SETUP.md`
4. Verify these are gone:
   - `convex/data/apps.ts`
   - `src/app/appstore/`
   - `src/components/AppCard.tsx`

---

## Final Git Commands

After all changes are complete:

```bash
git add .
git commit -m "Strip to template - remove Mocksy-specific code

- Removed business logic (apps, concepts, reviews)
- Removed project-specific components
- Kept core infrastructure (auth, AI, navigation)
- Updated landing page and README for template
- Ready to use as starter template"
```

---

## Summary

**What gets deleted**: All Mocksy business logic, pages, components, branding  
**What stays**: Auth system, AI utils (aisdk/fal/baml), navigation, UI components, providers  
**What updates**: Schema (profiles only), landing page, README, package.json

**Result**: Clean template ready for new AI-powered projects



