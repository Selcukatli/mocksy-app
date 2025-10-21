# Using Mocksy as an AI-Powered Project Template

This project is designed to be reused as a production-ready starter template for AI-powered applications. It includes authentication, AI text/image generation, type-safe LLM functions, and a beautiful adaptive navigation system.

## 🎯 What's Included

### Core Infrastructure (100% Reusable)
- ✅ **Authentication**: Clerk + Convex with automatic profile sync
- ✅ **User Profiles**: Complete user management with admin system
- ✅ **Adaptive Navigation**: Desktop sidebar + mobile bottom tabs
- ✅ **Theme System**: Dark/light/system mode with CSS variables
- ✅ **File Storage**: Convex file storage ready to use

### AI Infrastructure (100% Portable)
- ✅ **Text Generation**: AI SDK with GPT-5, Claude, Gemini, etc.
- ✅ **Image Generation**: FAL integration (FLUX, GPT Image, Imagen, etc.)
- ✅ **Type-Safe LLM**: BAML for structured AI outputs
- ✅ **Streaming Support**: Real-time text streaming
- ✅ **Automatic Fallbacks**: Model chains for reliability

### UI Components
- ✅ **shadcn/ui**: Full component library
- ✅ **Responsive Layout**: Works perfectly on all devices
- ✅ **Page Context System**: Dynamic headers and breadcrumbs
- ✅ **Animation**: Framer Motion for smooth transitions

---

## 🚀 Quick Start (30 minutes)

### 1. Clone and Install
```bash
# Clone the template
git clone https://github.com/your-org/mocksy-template my-new-project
cd my-new-project

# Install dependencies
npm install

# Initialize Convex
npx convex dev
```

### 2. Set Up Authentication (Clerk)

Create a Clerk account at [clerk.com](https://clerk.com) and get your keys:

```bash
# Set Clerk environment variables
npx convex env set CLERK_PUBLISHABLE_KEY=pk_test_...
npx convex env set CLERK_SECRET_KEY=sk_test_...

# Also add to .env.local for Next.js
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_..." >> .env.local
echo "CLERK_SECRET_KEY=sk_test_..." >> .env.local
```

**Configure Clerk Webhook** (for profile sync):
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-deployment.convex.site/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret:
```bash
npx convex env set CLERK_WEBHOOK_SECRET=whsec_...
```

### 3. Set Up AI Providers

You only need the providers you plan to use:

```bash
# For text generation (AI SDK)
npx convex env set OPENAI_API_KEY=sk-...              # GPT models
npx convex env set ANTHROPIC_API_KEY=sk-ant-...       # Claude models
npx convex env set GOOGLE_AI_API_KEY=...              # Gemini models
npx convex env set OPENROUTER_API_KEY=sk-or-...       # Multi-provider

# For image generation (FAL)
npx convex env set FAL_KEY=...                        # fal.ai API key

# For production
npx convex env set OPENROUTER_API_KEY=... --prod
npx convex env set FAL_KEY=... --prod
```

**Note**: BAML uses OpenRouter by default, so `OPENROUTER_API_KEY` gives you access to all models in `baml_src/clients.baml`.

### 4. Start Development
```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Visit `http://localhost:3000` - you're ready to build!

---

## 🔧 Customization Guide

### Step 1: Update Project Metadata

**Edit `src/app/layout.tsx`:**
```typescript
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
  openGraph: {
    title: "Your App Name",
    description: "Your app description",
    images: [{ url: "/your-cover.jpg" }],
  },
  icons: {
    icon: "/your-icon.png",
  },
};
```

**Replace branding assets in `public/`:**
- `your-logo-dark-mode.png`
- `your-logo-light-mode.png`
- `your-app-icon.png`
- `your-cover.jpg`

### Step 2: Customize Navigation

**Edit `src/components/layout/Sidebar.tsx`:**
```typescript
// Change navigation links (around line 85-110)
<Link href="/your-route" className={...}>
  <YourIcon className="w-5 h-5" />
  <span>Your Page</span>
</Link>
```

**Edit `src/components/layout/BottomTabBar.tsx`:**
```typescript
// Update mobile tabs (around line 14-43)
const tabs = [
  { id: 'home', label: 'Home', icon: Home, href: '/', isActive: pathname === '/' },
  { id: 'create', label: 'Create', icon: Pencil, href: '/create', isActive: pathname === '/create' },
  // ... your tabs
];
```

**Update static routes in `src/components/RootLayoutContent.tsx`:**
```typescript
// Line 47: Define which routes have persistent sidebar
const staticRoutes = ['/browse', '/profile', '/settings'];
```

### Step 3: Define Your Database Schema

**Edit `convex/schema.ts`:**
```typescript
export default defineSchema({
  // ✅ Keep this - user profiles
  profiles: defineTable({ ... })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),
  
  // 🔄 Add your tables
  posts: defineTable({
    profileId: v.id("profiles"),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_created", ["createdAt"]),
  
  // ... more tables
});
```

### Step 4: Set Up Your BAML Functions

**Keep `baml_src/clients.baml`** (all LLM client configs are reusable)

**Replace example BAML files with your own:**

```bash
# Remove Mocksy-specific BAML
rm baml_src/app-concepts.baml
rm baml_src/app-generation.baml

# Create your BAML functions
touch baml_src/your-functions.baml
```

**Example: `baml_src/blog-writer.baml`**
```baml
class BlogPost {
  title string
  excerpt string
  content string
  tags string[]
}

function GenerateBlogPost(topic: string, tone: string) -> BlogPost {
  client GPT5
  prompt #"
    Write a blog post about {{ topic }} in a {{ tone }} tone.
    
    {{ ctx.output_format }}
  "#
}
```

**Generate TypeScript client:**
```bash
npm run baml:generate
```

**Use in Convex:**
```typescript
import { b } from "../../baml_client";

export const generateBlogPost = action({
  args: { topic: v.string(), tone: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const result = await b.GenerateBlogPost(args.topic, args.tone);
    return result;
  },
});
```

### Step 5: Remove Mocksy-Specific Code

**Delete these directories:**
```bash
# Convex backend
rm -rf convex/data/apps.ts
rm -rf convex/data/appScreens.ts
rm -rf convex/data/appConcepts.ts
rm -rf convex/data/appReviews.ts
rm -rf convex/features/appGeneration/

# Frontend pages
rm -rf src/app/appstore/
rm -rf src/app/apps/
rm -rf src/app/generate/
rm -rf src/app/admin/  # Or keep if you want admin features

# Components (most are Mocksy-specific)
# Keep: layout/, ui/, RootLayoutContent, ThemeProvider
# Remove: AppCard, AppConceptCard, etc.

# Stores (Zustand)
rm -rf src/stores/

# Scripts
rm -rf scripts/
```

**Keep these for reference:**
```
docs/rules/           # Setup guides for agents
convex/utils/aisdk/   # AI text generation
convex/utils/fal/     # AI image generation
```

---

## 📚 Using the AI Infrastructure

### Text Generation (AI SDK)

```typescript
// In a Convex action
import { internal } from "./_generated/api";

export const generateContent = action({
  args: { prompt: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const result = await ctx.runAction(
      internal.utils.aisdk.aiSdkActions.generateTextInternal,
      {
        messages: [{ role: "user", content: args.prompt }],
        modelPreset: "large", // or "medium", "small", "tiny", "vision"
      }
    );
    return result.content;
  },
});
```

**Available presets:**
- `large`: GPT-5 (high reasoning) - complex tasks
- `medium`: GPT-5 (balanced) - general purpose
- `small`: GPT-5 Mini - quick tasks
- `tiny`: GPT-5 Nano - simple decisions
- `vision`: Qwen 72B Vision - image analysis

**See full docs:** `convex/utils/aisdk/README.md`

### Image Generation (FAL)

```typescript
// In a Convex action
import { api } from "./_generated/api";

export const generateImage = action({
  args: { prompt: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const result = await ctx.runAction(
      api.utils.fal.falImageActions.fluxTextToImage,
      {
        prompt: args.prompt,
        model: "dev", // "schnell" | "dev" | "pro"
        image_size: "landscape_4_3",
      }
    );
    return result.images[0].url;
  },
});
```

**Available models:**
- FLUX (fast, high-quality)
- GPT Image (OpenAI)
- Imagen4 (Google)
- Gemini 2.5 Flash
- Nano Banana
- Qwen Image

**See full docs:** `convex/utils/fal/README.md`

### Type-Safe LLM Functions (BAML)

**1. Define your function in `baml_src/`:**
```baml
class Recipe {
  name string
  ingredients string[]
  instructions string[]
  cookTime int
}

function GenerateRecipe(dish: string) -> Recipe {
  client GPT5
  prompt #"
    Create a recipe for {{ dish }}.
    {{ ctx.output_format }}
  "#
}
```

**2. Generate TypeScript client:**
```bash
npm run baml:generate
```

**3. Use in Convex:**
```typescript
import { b } from "../../baml_client";

export const getRecipe = action({
  args: { dish: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const recipe = await b.GenerateRecipe(args.dish);
    return recipe; // Fully typed!
  },
});
```

**See full docs:** `docs/rules/baml-convex-setup.md`

---

## 🏗️ Architecture Overview

### Authentication Flow
```
User signs in (Clerk)
    ↓
Clerk webhook → convex/webhooks/clerk/handler.ts
    ↓
Profile created/updated in Convex
    ↓
ProfileProvider syncs client-side state
    ↓
User profile available everywhere
```

### Navigation System
```
RootLayoutContent (manages layout modes)
    ↓
├── Static Mode (browse pages)
│   └── Sidebar (always visible) + BottomTabBar (mobile)
│
└── Overlay Mode (detail pages)
    └── TopHeader + Collapsible Sidebar
```

### AI Request Flow
```
Frontend → Convex Action → AI Utils → AI Provider
                              ↓
                    Automatic fallback chain
                    (GPT-5 → Claude → Gemini)
```

---

## 🔑 Key Features to Keep

### 1. Profile System
- **Files**: `convex/data/profiles.ts`, `convex/webhooks/clerk/`
- **Why**: Production-ready auth with Clerk sync
- **Admin**: Set `isAdmin: true` in database for admin access

### 2. Adaptive Navigation
- **Files**: `src/components/RootLayoutContent.tsx`, `src/components/layout/`
- **Why**: Handles desktop/mobile perfectly with two modes
- **Usage**: Set `sidebarMode` and page context per route

### 3. AI Utils
- **Files**: `convex/utils/aisdk/`, `convex/utils/fal/`
- **Why**: Battle-tested AI integration with fallbacks
- **Portable**: Can use outside Convex (see READMEs)

### 4. Theme System
- **Files**: `src/components/ThemeProvider.tsx`, `src/app/globals.css`
- **Why**: CSS variable-based theming works everywhere
- **Customization**: Edit CSS variables in `globals.css`

### 5. Page Context System
- **Usage**: `usePageHeader()` hook in any page
- **Features**: Dynamic titles, breadcrumbs, actions
- **Example**:
```typescript
const { setTitle, setBreadcrumbs, setActions } = usePageHeader();

useEffect(() => {
  setTitle("Your Page");
  setBreadcrumbs([
    { label: "Home", href: "/" },
    { label: "Your Page" }
  ]);
  setActions(<YourActionButton />);
}, []);
```

---

## 📖 Documentation Reference

### For Developers
- **Convex Setup**: `docs/rules/convex-rules.mdc`
- **Clerk Setup**: `docs/rules/clerk-convex-setup.mdc`
- **BAML Setup**: `docs/rules/baml-convex-setup.md`
- **Navigation**: `docs/rules/route-navigation-patterns.mdc`

### For AI Agents
- **All rules**: `docs/rules/` (AI agents read these automatically)
- **Repository guidelines**: See root `.cursorrules` or `AGENTS.md`

### API Documentation
- **AI SDK**: `convex/utils/aisdk/README.md`
- **FAL Images**: `convex/utils/fal/README.md`

---

## 🎨 Common Use Cases

### Content Creation Tool
```typescript
// Example: Blog writer
1. Keep: Auth, navigation, theme
2. Schema: posts, drafts, categories
3. BAML: blog-writer.baml (structured output)
4. AI: modelPreset: "large" for creative content
```

### Image Generation App
```typescript
// Example: Logo maker
1. Keep: Auth, navigation, theme
2. Schema: projects, designs, templates
3. FAL: FLUX for fast generation
4. Storage: Convex file storage for results
```

### AI Chatbot
```typescript
// Example: Customer support
1. Keep: Auth, navigation, theme
2. Schema: conversations, messages
3. AI SDK: Streaming for real-time responses
4. BAML: For structured commands/data extraction
```

### Creative Studio
```typescript
// Example: Story + art generator
1. Keep: Everything
2. Schema: stories, characters, scenes
3. AI SDK: Text generation
4. FAL: Image generation
5. BAML: Structured story outlines
```

---

## 🐛 Troubleshooting

### Clerk Webhook Not Working
1. Check webhook URL includes `/webhooks/clerk`
2. Verify webhook secret matches: `npx convex env get CLERK_WEBHOOK_SECRET`
3. Check Convex logs: `npx convex logs`

### AI Requests Failing
1. Verify API keys: `npx convex env list`
2. Check model availability (some require specific keys)
3. Review logs for specific error messages

### BAML Generation Errors
1. Run `npm run baml:generate` after any BAML changes
2. Ensure `generators.baml` points to correct output directory
3. Check `baml_client/` was generated successfully

### Navigation Not Working
1. Verify route definitions in `RootLayoutContent.tsx`
2. Check `staticRoutes` array includes your browse pages
3. Ensure sidebar links match your actual routes

---

## 🚢 Deployment

### 1. Deploy Convex Backend
```bash
npx convex deploy --prod
```

### 2. Deploy Next.js Frontend
```bash
# Build locally
npm run build

# Or deploy to Vercel
vercel --prod

# Update production environment variables
# Set all API keys in production deployment
```

### 3. Update Clerk Webhook
Point webhook to production URL: `https://your-prod.convex.site/webhooks/clerk`

---

## 📝 Checklist for New Projects

- [ ] Clone template and install dependencies
- [ ] Set up Clerk authentication
- [ ] Configure Clerk webhook for profile sync
- [ ] Set AI provider API keys (OpenRouter, FAL, etc.)
- [ ] Update project metadata (name, description, icons)
- [ ] Customize navigation links
- [ ] Define database schema for your domain
- [ ] Replace BAML example files with your functions
- [ ] Remove Mocksy-specific code
- [ ] Test authentication flow
- [ ] Test AI text generation
- [ ] Test AI image generation
- [ ] Deploy to production

---

## 💡 Tips

1. **Start Small**: Get auth working, then add one AI feature at a time
2. **Use Presets**: Start with `modelPreset: "medium"` for balanced performance
3. **Check Logs**: `npx convex logs` is your best friend for debugging
4. **Test Webhooks**: Use Clerk dashboard to trigger test events
5. **BAML First**: Define types in BAML before writing Convex functions
6. **Mobile Testing**: Navigation system shines on mobile - test it!

---

## 🎓 Learning Resources

- **Convex Docs**: https://docs.convex.dev
- **Clerk Docs**: https://clerk.com/docs
- **BAML Docs**: https://docs.boundaryml.com
- **AI SDK**: https://sdk.vercel.ai/docs
- **FAL Docs**: https://fal.ai/docs

---

## 📞 Support

- **Convex Discord**: https://convex.dev/community
- **Clerk Discord**: https://clerk.com/discord
- **GitHub Issues**: [Your template repo]

---

## 🎉 You're Ready!

This template gives you a production-ready foundation. Focus on your unique features - the infrastructure is handled.

**Happy building! 🚀**





