# BAML with Convex Setup Guide

## Overview
BAML (Boundary ML) is a domain-specific language for building reliable, type-safe LLM functions. This guide explains how to integrate BAML with Convex for type-safe AI operations.

## Prerequisites

### Install VSCode Extension
1. Open VSCode Extensions (Cmd+Shift+X on Mac, Ctrl+Shift+X on Windows/Linux)
2. Search for "BAML" or "Baml Language"
3. Install the extension by Boundary
4. Reload VSCode window after installation

### Version Compatibility
**CRITICAL**: The BAML package version, generator version, and VSCode extension version must match (major and minor versions).

Example: If VSCode extension is `0.208.5`:
- npm package should be `@boundaryml/baml@0.208.5`
- Generator version in `generators.baml` should be `0.208.5`

To check VSCode extension version:
- Look at the bottom right of VSCode when a `.baml` file is open
- Or check Extensions panel → BAML → version number

To fix version mismatches:
```bash
# Check current package version
npm list @boundaryml/baml

# Update to match VSCode extension (example for 0.208.5)
npm uninstall @boundaryml/baml
npm install @boundaryml/baml@0.208.5

# Update generator version in baml_src/generators.baml
# Change: version "0.76.2" → version "0.208.5"
```

## Project Structure

### Cross-File Class Availability (IMPORTANT)
**All classes defined in `.baml` files within the `baml_src/` directory are automatically available across all BAML files without requiring imports.**

- ✅ Classes defined in `avatars.baml` are automatically available in `scene.baml`
- ✅ Clients defined in `clients.baml` are automatically referenced in all domain files
- ❌ DO NOT use import statements like `from "../baml_src/avatars.baml" import Avatar`
- ❌ Import syntax will cause validation errors: "This line is invalid. It does not start with any known Baml schema keyword"

This automatic availability applies to:
- Classes (e.g., `Avatar`, `Scene`, `Character`)
- Enums
- Clients (e.g., `GPT5`, `VisionModel`)
- Functions can reference any class or client from any file

### Recommended File Organization
```
project-root/
├── baml_src/           # BAML source files
│   ├── clients.baml    # ALL LLM client configurations (CENTRALIZED)
│   ├── generators.baml # Generator settings (required)
│   ├── helloworld.baml # Basic examples/demos (optional)
│   ├── avatars.baml    # Domain: models, functions, tests (NO clients)
│   ├── scene.baml      # Domain: models, functions, tests (NO clients)
│   └── screenshots.baml # Domain: models, functions, tests (NO clients)
├── baml_client/        # Generated TypeScript client (auto-generated)
├── convex/
│   └── actions/        # Convex actions that use BAML
├── package.json
└── convex.json         # Convex configuration
```

### File Organization Best Practices

#### Client Configuration (IMPORTANT)
- **CENTRALIZE ALL CLIENTS**: Define all LLM clients in `clients.baml` only
- **NO LOCAL CLIENTS**: Domain files should NOT define their own clients
- **REUSE EXISTING**: Functions should reference clients from `clients.baml`
- **NAMING PATTERN**: Use descriptive names like `GPT5`, `Gemini25Flash`, `VisionModel`

#### Domain Files
- **Domain-based organization**: Use `domain.baml` for models, functions, and tests
- **Keep tests co-located**: Place test cases right after their functions
- **Single file per domain**: Unless a domain exceeds 500+ lines
- **Naming pattern**: Use lowercase with no separators (e.g., `avatars.baml`)

## Setup Steps

### 1. Install BAML
```bash
npm install @boundaryml/baml
```

### 2. Create BAML Source Directory
Create `baml_src/` in your project root (NOT inside convex folder):

```bash
mkdir baml_src
```

### 3. Configure BAML Generator
Create `baml_src/generators.baml`:
```baml
generator target {
  output_type "typescript"
  output_dir ".."  // Outputs to project root
  version "0.76.2"
}
```

### 4. Configure OpenRouter Clients (CENTRALIZED)
Create `baml_src/clients.baml` - **ALL clients should be defined here**:

#### Complete Client Configuration Example
```baml
// ===========================================
// CENTRALIZED CLIENT CONFIGURATION
// All LLM clients should be defined in this file
// Domain files should reference these, not define their own
// ===========================================

// Fast model - for simple tasks
client<llm> GPT5Nano {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "openai/gpt-5-nano"
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App Name"
    }
  }
}

// Smart model - for complex reasoning
client<llm> GPT5 {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "openai/gpt-5"
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App Name"
    }
  }
}

// Gemini models - various tiers
client<llm> Gemini25Pro {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.5-pro"
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App Name"
    }
  }
}

client<llm> Gemini25Flash {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.5-flash"
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App Name"
    }
  }
}

// Vision model for image analysis
client<llm> VisionModel {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "qwen/qwen2.5-vl-72b-instruct"
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App Name"
    }
  }
}
```

#### Fallback Chain Configuration
```baml
// Primary vision model
client<llm> VisionPrimary {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "qwen/qwen2.5-vl-72b-instruct"
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App"
    }
  }
}

// Fallback vision model
client<llm> VisionFallback {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.0-flash-exp:free"
    headers {
      "HTTP-Referer" "https://yourapp.com"
      "X-Title" "Your App"
    }
  }
}

// Fallback chain - tries primary, then fallback
client<llm> VisionWithFallback {
  provider "fallback"
  options {
    strategy [  // Note: array syntax, not string
      VisionPrimary,
      VisionFallback
    ]
  }
}
```

### 5. Define Your Domain Files (WITHOUT Clients)

**IMPORTANT**: Domain files should ONLY contain models, functions, and tests. Use clients from `clients.baml`.

#### Cross-File References Example
```baml
// scene.baml - Can use Avatar class without importing
class Character {
  avatar Avatar  // Avatar class from avatars.baml is automatically available
  outfit Outfit
}

function GenerateScene(characters: Character[]) -> Scene {
  client VisionModel  // Client from clients.baml is automatically available
  prompt #"..."#
}
```

#### Example Domain File Structure
```baml
// avatars.baml - Domain file for avatar analysis
// NO CLIENT DEFINITIONS HERE - use clients from clients.baml

// Models
class Avatar {
  summary string
  face_shape string
  // ... other fields
}

// Functions (reference clients from clients.baml)
function AnalyzeAvatar(image: image) -> Avatar {
  client VisionModel  // References client from clients.baml
  prompt #"
    {{ _.role("user") }}
    Analyze this person's photo:
    {{ image }}
    {{ ctx.output_format }}
  "#
}

// Tests
test AvatarTest {
  functions [AnalyzeAvatar]
  args {
    image "https://example.com/photo.jpg"
  }
}
```

#### Text-Only Functions
```baml
// Example: Using centralized clients
class AnalysisResult {
  summary string @description("Brief summary of the analysis")
  score float @description("Score from 0.0 to 1.0")
  tags string[] @description("Relevant tags")
}

function AnalyzeContent(content: string) -> AnalysisResult {
  client GPT5Nano  // Uses client from clients.baml
  prompt #"
    Analyze the following content:
    {{ content }}

    Provide a summary, score its quality, and suggest relevant tags.

    {{ ctx.output_format }}
  "#
}
```

#### Vision/Image Functions (CRITICAL SYNTAX)
```baml
// IMPORTANT: For vision models, you MUST include the image in the prompt!
function AnalyzeImage(image: image) -> AnalysisResult {
  client VisionModel  // Uses client from clients.baml
  prompt #"
    {{ _.role("user") }}  // Required for proper image handling

    Analyze this image:
    {{ image }}  // MUST explicitly include the image variable

    Provide a detailed analysis.

    {{ ctx.output_format }}
  "#
}

// WRONG - Image won't be sent to the model:
function WrongImageAnalysis(image: image) -> AnalysisResult {
  client VisionModel  // Still uses centralized client
  prompt #"
    Analyze the image and provide details.
    {{ ctx.output_format }}
  "#
  // Missing {{ image }} - model won't receive the image!
}
```

#### Multi-Modal Functions (Text + Image)
```baml
function AnalyzeWithContext(
  image: image,
  context: string
) -> AnalysisResult {
  client VisionModel  // Uses client from clients.baml
  prompt #"
    {{ _.role("user") }}

    Context: {{ context }}

    Image to analyze:
    {{ image }}

    Based on the context and image, provide your analysis.

    {{ ctx.output_format }}
  "#
}
```

### 6. Configure Convex External Packages (REQUIRED)
Create `convex.json` in project root:
```json
{
  "node": {
    "externalPackages": ["@boundaryml/baml"]
  }
}
```

**Why this is necessary:** BAML includes native Node.js modules (.node files) that cannot be bundled by Convex. Without this configuration, you'll get errors like:
```
No loader is configured for ".node" files: node_modules/@boundaryml/baml-darwin-arm64/baml.darwin-arm64.node
```

The external package configuration tells Convex to use BAML directly from node_modules at runtime instead of trying to bundle it.

### 7. Add Generation Script
In `package.json`:
```json
{
  "scripts": {
    "baml:generate": "baml-cli generate"
  }
}
```

### 8. Generate TypeScript Client
```bash
npm run baml:generate
```

This creates `baml_client/` with type-safe TypeScript code.

### 9. Use BAML in Convex Actions

#### Text Analysis Action
```typescript
"use node";  // REQUIRED: Enables Node.js runtime and environment access
import { action } from "./_generated/server";
import { v } from "convex/values";
import { b } from "../baml_client";
import type { AnalysisResult } from "../baml_client/types";

export const analyzeContent = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, { content }) => {
    // BAML automatically uses OPENROUTER_API_KEY from Convex environment
    const result: AnalysisResult = await b.AnalyzeContent(content);

    return {
      summary: result.summary,
      score: result.score,
      tags: result.tags
    };
  }
});
```

#### Image Analysis Action (IMPORTANT: CommonJS Import)
```typescript
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { b } from "../baml_client";
// CRITICAL: Use CommonJS import for Image to avoid bundling errors
import pkg from "@boundaryml/baml";
const { Image } = pkg;
import type { AnalysisResult } from "../baml_client/types";

export const analyzeImage = action({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, { imageUrl }) => {
    // Convert URL to BAML Image object
    const image = Image.fromUrl(imageUrl);

    // Call BAML function with image
    const result = await b.AnalyzeImage(image);

    return result;
  }
});
```

#### Passing Multiple Images (Arrays)
When passing an array of images to BAML functions from Convex actions:

```typescript
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { b } from "../baml_client";

export const analyzeMultipleImages = action({
  args: {
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, { imageUrls }) => {
    // IMPORTANT: Convert URLs to objects with 'url' property
    // BAML expects: [{ url: "..." }, { url: "..." }]
    // NOT: ["https://...", "https://..."]
    const images = imageUrls.map(url => ({ url }));

    // Call BAML function with image array
    const result = await b.AnalyzeImages(images);

    return result;
  }
});
```

**Critical Image Format Rules:**
- ✅ **CORRECT**: `{ url: "https://..." }` - Object with url property
- ❌ **WRONG**: `"https://..."` - Raw URL string
- ✅ **Array**: `[{ url: "..." }, { url: "..." }]` - Array of objects
- ❌ **Array**: `["https://...", "https://..."]` - Array of strings

This applies to:
- Single images: Use `Image.fromUrl()` or `{ url: "..." }`
- Image arrays: Use `.map(url => ({ url }))`
- Test cases: Use `image { url "..." }` syntax

#### Why CommonJS Import for Image?
When using the Image class from BAML in Convex:
- ❌ WRONG: `import { Image } from "@boundaryml/baml"`
- ✅ CORRECT: `import pkg from "@boundaryml/baml"; const { Image } = pkg;`

This is because BAML is a CommonJS module and Convex's bundler requires this syntax to properly handle the native modules.

## Key Points

### Three Essential Requirements
1. **BAML in root directory** - Keeps generated files outside Convex bundling
2. **"use node" directive** - Enables Node.js runtime and environment access in Convex actions
3. **External package config** - Prevents Convex from trying to bundle native modules

### Why BAML Must Be Outside Convex Folder
- BAML generates files with native Node.js modules (.node files)
- These generated files cannot be modified to add "use node" directive
- Placing BAML in root avoids Convex bundling issues

### Why External Package Configuration is Required
- BAML contains native Node.js modules (.node files)
- Convex cannot bundle these binary files
- The `convex.json` configuration tells Convex to load BAML from node_modules at runtime
- Without this, you'll get "No loader is configured for .node files" errors

### How Environment Variables Work
- BAML reads environment variables at **runtime**, not build time
- When BAML executes inside a Convex action with "use node", it has access to Convex environment variables
- No wrapper needed - direct imports work fine

### The "use node" Directive
- MUST be at the top of any Convex file using BAML
- Provides access to Node.js APIs and Convex environment variables
- Enables BAML to read `env.OPENROUTER_API_KEY` from Convex environment

## Common Issues and Solutions

### Issue: "Could not resolve fs" or native module errors
**Solution**: Ensure BAML folders are in project root, not inside convex/

### Issue: "Provider returned error" from OpenRouter
**Solution**: Check that your model ID is valid and your API key is set in Convex environment

### Issue: Nested baml_client/baml_client structure after generation
**Solution**: Set `output_dir ".."` in generators.baml (not `"../baml_client"`)

### Issue: VSCode extension shows version mismatch warning
**Solution**: Update all three versions to match:
1. Check VSCode extension version (bottom right when .baml file is open)
2. Update npm package: `npm install @boundaryml/baml@<version>`
3. Update generator: Change `version` in `generators.baml`
4. Regenerate: `npm run baml:generate`

### Issue: Playground not showing up in VSCode
**Solution**:
1. Ensure VSCode extension is installed and activated
2. Reload VSCode window (Cmd+Shift+P → "Developer: Reload Window")
3. Open a `.baml` file (playground only appears in BAML files)
4. Check that `baml_src` directory exists in workspace root

### Issue: "Named export 'Image' not found" when importing from BAML
**Solution**: Use CommonJS import syntax in Convex:
```typescript
// Wrong:
import { Image } from "@boundaryml/baml";

// Correct:
import pkg from "@boundaryml/baml";
const { Image } = pkg;
```

### Issue: CommonJS module import errors
**Solution**: BAML is a CommonJS module. When using in Convex, always use default import:
```typescript
import pkg from "@boundaryml/baml";
const { Image, BamlClient } = pkg;
```

## Array Parameters and Template Syntax

### Working with Arrays in BAML

#### Array Parameter Definition
```baml
function ProcessMultipleItems(
  items: string[] @description("Array of items to process"),
  configs: Config[] @description("Array of configuration objects")
) -> Result {
  client GPT5
  prompt #"
    Process these items...
  "#
}
```

#### Template Iteration Syntax
When iterating over arrays in BAML templates, use the `{% for %}` syntax:

```baml
function ProcessArray(items: Item[]) -> Result {
  client GPT5
  prompt #"
    {% for item in items %}
    Item {{ loop.index }}: {{ item.name }}
    - Description: {{ item.description }}
    {% endfor %}
  "#
}
```

#### Important Template Limitations

**BAML arrays do NOT support `.length` property:**
```baml
// ❌ WRONG - This will cause an error
Number of items: {{ items.length }}

// ✅ CORRECT - Use loop counting or let the LLM infer
{% for item in items %}
Item {{ loop.index }} of {{ items | length }}  // Note: filter syntax may vary
{% endfor %}
```

#### Loop Variables Available
Inside `{% for %}` loops, you have access to:
- `loop.index` - 1-based index of current iteration
- `loop.index0` - 0-based index of current iteration
- `loop.first` - Boolean, true if first iteration
- `loop.last` - Boolean, true if last iteration

#### Array Testing in Playground
When testing functions with array parameters in the BAML playground:

```baml
test ArrayTest {
  functions [ProcessMultipleItems]
  args {
    // Arrays use square brackets
    items ["item1", "item2", "item3"]

    // Array of objects
    configs [
      { name "config1", value 10 },
      { name "config2", value 20 }
    ]
  }
}
```

## BAML CLI Commands

BAML provides a powerful CLI for generating code, running tests, and validating your BAML files.

### Core Commands

#### Generate TypeScript Client
```bash
# Generate from default location (./baml_src)
npx baml-cli generate

# Generate from custom location
npx baml-cli generate --from path/to/baml_src

# Skip version checking (not recommended)
npx baml-cli generate --no-version-check
```

**What it does:**
- Reads all `.baml` files from `baml_src/`
- Generates TypeScript client code in `baml_client/`
- Creates type-safe functions for all BAML functions
- Validates schema and reports errors

**When to run:**
- After modifying any `.baml` files
- After adding new functions or classes
- Before deploying to ensure types are up-to-date

#### Run Tests
```bash
# Run all tests
npx baml-cli test

# Run specific test by name
npx baml-cli test -i "FunctionName::TestName"

# Run all tests for a specific function
npx baml-cli test -i "FunctionName::"

# Run tests matching a pattern
npx baml-cli test -i "Generate*"

# Run multiple specific tests
npx baml-cli test -i "Foo::" -i "Bar::"

# Exclude specific tests
npx baml-cli test -x "SlowTest::"

# List tests without running them
npx baml-cli test --list

# Run tests from custom location
npx baml-cli test --from path/to/baml_src

# Control parallelism (default: 10)
npx baml-cli test --parallel 5
```

**Test Pattern Syntax:**
- `FunctionName::TestName` - Run specific test
- `FunctionName::` - All tests for a function
- `::TestName` - Test with that name in any function
- `wild_card*` - Wildcard matching
- `Get*::*Bar` - Function starts with "Get" AND test ends with "Bar"

**Example test output:**
```
INFO: Test results:
---------------------------------------------------------
function GenerateScreenshotEditPrompt
1 tests (1 ✅)
  4.57s PASSED       GenerateScreenshotEditPrompt::SnapStyleScreenshot
     ./baml_src/screenshots.baml:539
---------------------------------------------------------
INFO: Test run completed, 1 tests (1 ✅)
```

#### Validate BAML Files
```bash
# Check for errors and warnings
npx baml-cli check

# Check from custom location
npx baml-cli check --from path/to/baml_src
```

**What it checks:**
- Syntax errors in `.baml` files
- Type mismatches
- Invalid client configurations
- Missing required fields
- Unused variables in prompts

### Development Workflow

#### Recommended npm Scripts
Add these to your `package.json`:

```json
{
  "scripts": {
    "baml:generate": "baml-cli generate",
    "baml:test": "baml-cli test",
    "baml:test:watch": "baml-cli test -i",
    "baml:check": "baml-cli check"
  }
}
```

#### Typical Development Flow

1. **Edit BAML files** - Make changes to `.baml` files
2. **Validate** - `npm run baml:check`
3. **Generate** - `npm run baml:generate`
4. **Test** - `npm run baml:test`
5. **Deploy** - Deploy to Convex with updated types

#### Testing During Development

```bash
# Quick iteration: test specific function while developing
npx baml-cli test -i "MyFunction::"

# Test with specific inputs from test cases
npx baml-cli test -i "MyFunction::SpecificTestCase"

# Run tests in parallel for faster feedback
npx baml-cli test --parallel 20
```

### Advanced Features

#### Environment Variables
```bash
# Use custom .env file for testing
npx baml-cli test --dotenv --dotenv-path .env.test

# Tests will use OPENROUTER_API_KEY from .env.test
```

#### Beta Features
```bash
# Enable beta features and suppress experimental warnings
npx baml-cli generate --features beta
npx baml-cli test --features beta

# Show all warnings during CLI operations
npx baml-cli check --features display_all_warnings
```

### Common Workflows

#### After Cloning Repository
```bash
# Install dependencies
npm install

# Generate TypeScript client
npm run baml:generate

# Verify everything works
npm run baml:test
```

#### Before Committing Changes
```bash
# Validate all BAML files
npm run baml:check

# Regenerate client
npm run baml:generate

# Run all tests
npm run baml:test

# Commit if all pass
git add .
git commit -m "Update BAML functions"
```

#### Debugging Test Failures
```bash
# Run failing test in isolation
npx baml-cli test -i "FailingFunction::FailingTest"

# Check for validation errors first
npx baml-cli check

# Verify client is up-to-date
npx baml-cli generate
```

## Using the BAML Playground

The VSCode extension includes a playground for testing your BAML functions interactively.

### Accessing the Playground
1. Open any `.baml` file in VSCode
2. Look for "▶ Open BAML Playground" button next to function definitions
3. Click to open the playground panel
4. Select your function from the dropdown

### Creating Test Cases
Test cases are predefined inputs for quickly testing your functions. Add them to any `.baml` file:

```baml
// Define test cases for your function
test TestCaseName {
  functions [YourFunctionName]
  args {
    paramName "test value"
    anotherParam "another value"
  }
}

// Example with multiple test cases
test TestSkyQuestion {
  functions [DetailedTest]
  args {
    query "Why is the sky blue?"
  }
}

test TestMathQuestion {
  functions [DetailedTest]
  args {
    query "What is the square root of 144?"
  }
}
```

#### Testing with Images
When testing functions that accept image parameters in the BAML playground, you must use the object syntax with a `url` property:

```baml
// CORRECT - Use object with url property for images in test cases
test ImageAnalysisTest {
  functions [AnalyzeImage]
  args {
    image { url "https://example.com/photo.jpg" }
  }
}

// WRONG - This will cause an error in the playground
test WrongImageTest {
  functions [AnalyzeImage]
  args {
    image "https://example.com/photo.jpg"  // Error: Expected type Media(Image), got String
  }
}
```

**Note**: This object syntax is only needed for test cases in the BAML playground. When calling from code, you'll use `Image.fromUrl()` as shown in the Convex action examples above.

### Benefits of Test Cases
- **Quick Testing**: Switch between predefined inputs via dropdown
- **Documentation**: Serve as usage examples for your functions
- **Regression Testing**: Verify functions still work after changes
- **Save Time**: No need to retype common test inputs

### Playground Features
- **Live Testing**: Test functions without deploying
- **Response Preview**: See structured outputs in real-time
- **Multiple Clients**: Switch between different LLM providers
- **Cost Estimation**: View token usage and estimated costs

## Benefits of BAML with Convex

1. **Type Safety**: Compile-time type checking for LLM responses
2. **Structured Outputs**: Guaranteed response format with classes
3. **Environment Security**: API keys stay in Convex environment
4. **Better DX**: Prompts defined in .baml files with syntax highlighting
5. **Reliability**: Built-in retry logic and error handling
6. **Interactive Testing**: VSCode playground for rapid iteration

## Example: Complete Setup for Screenshot Generation

```baml
// baml_src/screenshot.baml - Domain file (NO client definitions)
class ScreenshotMetadata {
  title string @description("App screen title")
  description string @description("Screen description")
  keywords string[] @description("SEO keywords")
  primaryColor string @description("Hex color code")
}

function GenerateScreenshotMetadata(
  imageDescription: string,
  appContext: string
) -> ScreenshotMetadata {
  client Gemini25Flash  // Uses client from clients.baml
  prompt #"
    Given this app screen: {{ imageDescription }}
    App context: {{ appContext }}

    Generate metadata for this screenshot.

    {{ ctx.output_format }}
  "#
}

test ScreenshotTest {
  functions [GenerateScreenshotMetadata]
  args {
    imageDescription "Login screen with email and password fields"
    appContext "Social media app"
  }
}
```

```typescript
// convex/screenshotActions.ts
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { b } from "../baml_client";

export const generateMetadata = action({
  args: {
    imageDescription: v.string(),
    appContext: v.string(),
  },
  handler: async (ctx, { imageDescription, appContext }) => {
    const metadata = await b.GenerateScreenshotMetadata(
      imageDescription,
      appContext
    );

    // Type-safe access to all fields
    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      primaryColor: metadata.primaryColor,
    };
  }
});
```

## Comparison with AI SDK

| Feature | BAML | AI SDK |
|---------|------|--------|
| Type Safety | Compile-time with DSL | Runtime TypeScript |
| Prompt Management | .baml files | Inline strings |
| Response Validation | Automatic | Manual |
| Setup Complexity | Requires generation step | Direct usage |
| Flexibility | Schema-focused | Runtime configuration |
| Best For | Structured outputs, type safety | Dynamic prompts, fallbacks |

Choose BAML when you need strong type guarantees and structured outputs. Choose AI SDK for more runtime flexibility and dynamic prompt construction.