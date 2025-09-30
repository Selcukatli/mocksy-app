# BAML Test - Run and Analyze BAML Tests

Run specific BAML tests and provide detailed analysis of the results to verify LLM function behavior.

## 🚀 Core Features

### Test Execution
- **Direct Test Running** - Executes BAML tests using `baml-cli test`
- **Pattern Matching** - Supports test name patterns and function filters
- **Raw Output Display** - Shows unmodified test results for inspection
- **Smart Analysis** - Evaluates whether results meet expectations

### Documentation Reference
- **Auto-loads** `docs/rules/baml-rules.md` for context
- **Type Safety** - Understands BAML class structures and validators
- **Best Practices** - Applies BAML conventions from documentation

## 📋 Usage Examples

### Basic Usage
```
/baml-test GenerateScreenshotEditPrompt::SnapStyleScreenshot
```
Runs the specific test and provides analysis

### Function-Level Testing
```
/baml-test GenerateScreenshotEditPrompt
```
Runs all tests for the function

### Pattern Matching
```
/baml-test Generate*
```
Runs all tests matching the pattern

### With Analysis Focus
```
/baml-test ExtractData::TestCase1 --focus=accuracy
/baml-test GeneratePrompt::Test2 --focus=format
/baml-test ClassifyContent::Test3 --focus=consistency
```

## 🎯 Workflow

### Phase 1: Preparation
1. **Load Documentation** - Read `docs/rules/baml-rules.md` for context
2. **Parse Test Name** - Extract function and test case identifiers
3. **Identify BAML File** - Locate the relevant `.baml` file

### Phase 2: Execution
1. **Run Test** - Execute `npx baml-cli test -i "TestName"`
2. **Capture Output** - Collect raw test results
3. **Parse Results** - Extract LLM response and test status

### Phase 3: Analysis
1. **Format Verification** - Check if output matches expected structure
2. **Content Quality** - Evaluate description quality, specificity, and accuracy
3. **Type Compliance** - Verify output conforms to return type schema
4. **Best Practices** - Check against BAML patterns and conventions

### Phase 4: Reporting
1. **Raw Output** - Display complete test output unchanged
2. **Analysis Summary** - Key observations about result quality
3. **Pass/Fail Assessment** - Whether results meet expectations
4. **Recommendations** - Suggestions for improvements if needed

## 📊 Output Format

### Successful Test
```
🧪 Running BAML Test: GenerateScreenshotEditPrompt::SnapStyleScreenshot

📖 Loaded context from docs/rules/baml-rules.md

🏃 Executing: npx baml-cli test -i "GenerateScreenshotEditPrompt::SnapStyleScreenshot"

═══════════════════════════════════════════════════════════════
RAW TEST OUTPUT:
═══════════════════════════════════════════════════════════════

Test: GenerateScreenshotEditPrompt::SnapStyleScreenshot
Status: ✓ PASSED

Input:
  copy: { header: "Play Games with Friends!", subheader: null }
  layout: { header_position: "top", text_alignment: "center", ... }
  style: { background: {...}, device: {...}, typography: {...} }

Output:
{
  "header_text": "Play Games with Friends!",
  "header_placement": "Centered at the top of the canvas with 40px padding from the top edge.",
  "device_model": "iPhone 16 Pro with under-display camera technology",
  "device_angle": "Slight tilt to the right at approximately 10 degrees with subtle 3D perspective",
  ...
}

═══════════════════════════════════════════════════════════════

✅ ANALYSIS:

Format & Structure:
  ✓ Valid JSON output
  ✓ All required fields present
  ✓ Matches ScreenshotEditSpec schema

Content Quality:
  ✓ Device angle is specific (10 degrees tilt)
  ✓ Descriptions are concise and actionable
  ✓ Decorative elements have size, count, and placement details
  ✓ Typography specifications are complete

Type Compliance:
  ✓ String values have no line breaks
  ✓ Optional fields (subheader) correctly omitted when null
  ✓ Array structures match decorative_elements schema

Best Practices:
  ✓ Uses structured inputs (CopyConfig, LayoutConfig, StyleConfig)
  ✓ Concise natural language descriptions
  ✓ Specific measurements and counts included

🎯 VERDICT: ✅ PASS

The test produces high-quality output that matches the expected format
and contains specific, actionable descriptions suitable for image generation.
```

### Failed Test
```
🧪 Running BAML Test: GeneratePrompt::TestCase

📖 Loaded context from docs/rules/baml-rules.md

🏃 Executing: npx baml-cli test -i "GeneratePrompt::TestCase"

═══════════════════════════════════════════════════════════════
RAW TEST OUTPUT:
═══════════════════════════════════════════════════════════════

Test: GeneratePrompt::TestCase
Status: ✗ FAILED

Error: Expected field 'device_angle' to contain specific degree measurement,
       but got vague description: "slight tilt with perspective"

═══════════════════════════════════════════════════════════════

⚠️  ANALYSIS:

Issues Detected:
  ✗ Device angle lacks specificity (no degree measurement)
  ✗ Decorative element placement is vague
  ✗ Some descriptions are too verbose

Recommendations:
  1. Update prompt to require specific degree measurements for angles
  2. Add examples showing concise placement descriptions
  3. Emphasize brevity in instruction section

Type Compliance:
  ✓ JSON structure is valid
  ✓ All required fields present

🎯 VERDICT: ❌ FAIL

The output lacks sufficient specificity in critical fields. Consider using
/baml-improve to iteratively refine the prompt.
```

## 🎨 Analysis Dimensions

### Format Verification
- Valid JSON output
- Schema compliance
- Required vs optional fields
- No line breaks in strings

### Content Quality
- Specificity (measurements, counts, degrees)
- Clarity and conciseness
- Actionability for downstream use
- Natural language quality

### Type Safety
- Return type conformance
- Proper handling of optional fields
- Array structure correctness
- Enum value validity

### BAML Best Practices
- Structured input usage
- Clear type annotations
- Proper Jinja2 templating
- Concise prompt instructions

## 💡 When to Use

### Verification Scenarios
```
# After updating a prompt
/baml-test MyFunction::UpdatedTest

# Before committing changes
/baml-test MyFunction

# After reviewing PR feedback
/baml-test *::CriticalTest
```

### Quality Assurance
```
# Check consistency
/baml-test GenerateContent --focus=consistency

# Validate format changes
/baml-test ExtractData --focus=format

# Verify type safety
/baml-test ClassifyInput --focus=types
```

### Development Workflow
1. Write/update BAML function
2. Create test case
3. Run `/baml-test FunctionName::TestName`
4. Review analysis
5. If issues found, use `/baml-improve` to fix

## 🔧 Integration with Development

### Pre-commit Validation
```bash
# Validate all tests pass before commit
/baml-test *
```

### CI/CD Integration
```yaml
- name: BAML Tests
  run: npx baml-cli test
```

### Pair with /baml-improve
```
# Quick check first
/baml-test MyFunction::Test1

# If fails, improve iteratively
/baml-improve MyFunction::Test1
```

## 📖 Related Commands

- `/baml-improve` - Iteratively improve prompts until tests pass
- `/lint-fix` - Fix code quality issues
- `/commit` - Create semantic commits after successful tests

## 🎯 Success Criteria

A test is considered passing when:
- ✅ Test executes without errors
- ✅ Output matches expected schema
- ✅ Content is specific and actionable
- ✅ Follows BAML best practices
- ✅ Meets quality thresholds for intended use

This command helps ensure your BAML functions produce reliable, high-quality results before deploying to production!
