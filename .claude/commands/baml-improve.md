# BAML Improve - Iterative Prompt Optimization

Automatically run BAML tests and iteratively improve prompts until achieving desired results through intelligent analysis and refinement.

## 🚀 Core Features

### Iterative Improvement Loop
- **Test-Driven Refinement** - Runs test, analyzes results, improves prompt, repeats
- **Smart Analysis** - Identifies specific issues in LLM output
- **Targeted Fixes** - Makes precise prompt modifications
- **Progress Tracking** - Shows improvement across iterations
- **Convergence Detection** - Stops when goals achieved or no more progress possible

### Intelligent Optimization
- **Issue Detection** - Identifies vagueness, verbosity, format issues, missing details
- **Pattern Recognition** - Learns from successful vs failed attempts
- **Best Practice Application** - Applies BAML conventions and prompt engineering principles
- **Context Preservation** - Maintains successful aspects while fixing issues

### Safety & Control
- **Max Iterations** - Prevents infinite loops (default: 5)
- **User Approval** - Optionally confirm changes before applying
- **Rollback Support** - Can revert to previous version
- **Change Tracking** - Shows what changed between iterations

## 📋 Usage Examples

### Basic Usage
```
/baml-improve GenerateScreenshotEditPrompt::SnapStyleScreenshot
```
Iteratively improves until test passes or max iterations reached

### With Custom Goals
```
/baml-improve MyFunction::TestCase --goal="more specific measurements"
/baml-improve ExtractData::Test1 --goal="concise single-line descriptions"
/baml-improve ClassifyContent::Test2 --goal="consistent format across all fields"
```

### Control Options
```
/baml-improve MyFunction::Test --max-iterations=10
/baml-improve MyFunction::Test --auto-approve
/baml-improve MyFunction::Test --stop-on-first-pass
```

### Focus Areas
```
/baml-improve MyFunction::Test --focus=specificity
/baml-improve MyFunction::Test --focus=brevity
/baml-improve MyFunction::Test --focus=format
/baml-improve MyFunction::Test --focus=all
```

## 🎯 Workflow

### Phase 1: Initial Assessment
1. **Load Documentation** - Read `docs/rules/baml-rules.md`
2. **Read BAML File** - Load current function definition
3. **Parse Test Case** - Understand expected inputs/outputs
4. **Run Baseline Test** - Execute test to establish starting point

### Phase 2: Analysis
1. **Identify Issues** - Categorize problems in output:
   - Vague descriptions (missing specifics)
   - Excessive verbosity
   - Format violations (line breaks, invalid JSON)
   - Missing required details
   - Inconsistent style
2. **Prioritize Fixes** - Order issues by impact and feasibility
3. **Determine Root Cause** - Trace issue to prompt instruction or template

### Phase 3: Improvement
1. **Generate Fix** - Create targeted prompt modification:
   - Add specific examples
   - Refine instructions for clarity
   - Update template formatting
   - Adjust output constraints
2. **Apply Changes** - Update `.baml` file with modifications
3. **Regenerate Client** - Run `npm run baml:generate`

### Phase 4: Validation
1. **Re-run Test** - Execute test with updated prompt
2. **Compare Results** - Check if issues were resolved
3. **Measure Progress** - Count fixed vs remaining issues
4. **Check Convergence**:
   - All issues resolved → Success!
   - Progress made → Continue iteration
   - No progress → Stop and report

### Phase 5: Iteration
1. **Continue if Needed** - Repeat phases 2-4 until:
   - Test passes all criteria
   - Max iterations reached
   - No more progress possible
   - User requests stop
2. **Track History** - Maintain log of changes and results

### Phase 6: Completion
1. **Final Report** - Summarize improvements made
2. **Show Diff** - Display all prompt changes
3. **Provide Recommendations** - Suggest next steps if not fully resolved

## 📊 Output Format

### Iteration Progress
```
🔄 BAML IMPROVE: GenerateScreenshotEditPrompt::SnapStyleScreenshot

📖 Loaded context from docs/rules/baml-rules.md

═══════════════════════════════════════════════════════════════
🔍 ITERATION 1: Baseline Assessment
═══════════════════════════════════════════════════════════════

Running test...

Issues Found (5):
  ❌ Device angle lacks specific degree measurement
  ❌ Decorative element descriptions too verbose
  ❌ Some strings contain line breaks
  ❌ Placement descriptions not concise
  ❌ Inconsistent level of detail across fields

Analysis:
  - Prompt instructions don't emphasize degree specificity
  - Examples show verbose natural language instead of concise format
  - No explicit constraint against line breaks in strings
  - Missing guidance on placement description format

Proposed Fix:
  1. Add instruction: "Device angles MUST include specific degree measurements"
  2. Update examples to show concise format: "Large simple black outlined smiley..."
  3. Add constraint: "ALL string values MUST be on a single line"
  4. Add placement format guidance with examples

Apply these changes? (auto-approved)

✏️  Applying changes to baml_src/screenshots.baml...
🔄 Regenerating BAML client...

═══════════════════════════════════════════════════════════════
🔍 ITERATION 2: Validating Improvements
═══════════════════════════════════════════════════════════════

Running test...

Progress:
  ✅ Device angle now includes degree (10 degrees)
  ✅ No line breaks in strings
  ✅ Placement descriptions more concise
  ⚠️  Element descriptions still somewhat verbose
  ⚠️  Detail level still inconsistent

Issues Remaining (2):
  ❌ Some decorative element descriptions exceed 20 words
  ❌ Background aesthetic description inconsistent with element detail level

Analysis:
  - Improved significantly but need stronger brevity emphasis
  - Need examples showing maximum acceptable length
  - Should specify word count or character limits

Proposed Fix:
  1. Add constraint: "Descriptions should be 15 words or less"
  2. Add bad vs good examples showing verbosity
  3. Emphasize consistency in detail level across all fields

Apply these changes? (auto-approved)

✏️  Applying changes...
🔄 Regenerating client...

═══════════════════════════════════════════════════════════════
🔍 ITERATION 3: Final Validation
═══════════════════════════════════════════════════════════════

Running test...

Progress:
  ✅ All descriptions now concise (under 15 words)
  ✅ Consistent detail level across fields
  ✅ Device angle specific
  ✅ No format violations
  ✅ Placement descriptions clear and brief

Issues Remaining: 0

═══════════════════════════════════════════════════════════════
🎉 SUCCESS - Test Passing
═══════════════════════════════════════════════════════════════

Iterations: 3
Issues Fixed: 5
Time Taken: 2m 34s

Summary of Changes:
  ✓ Added specific degree requirement for device angles
  ✓ Added single-line string constraint
  ✓ Updated examples to show concise format
  ✓ Added 15-word limit for descriptions
  ✓ Emphasized consistency in detail level

Before/After Comparison:
  Verbosity: Reduced by 43%
  Specificity: Improved (now includes measurements)
  Format Compliance: 100% (was 60%)
  Consistency: High (was medium)

📝 Final Output Example:
{
  "device_angle": "Slight tilt to the right at 10 degrees with 3D depth",
  "decorative_elements": "Large simple black outlined smiley emojis (80-100px) - 3-4 scattered around sides"
  ...
}

✅ Test now passes all criteria. No further improvements needed.
```

### Max Iterations Reached
```
═══════════════════════════════════════════════════════════════
⚠️  MAX ITERATIONS REACHED (5)
═══════════════════════════════════════════════════════════════

Progress Made:
  ✅ Fixed 4 out of 6 issues (67%)
  ✅ Output quality improved significantly

Remaining Issues (2):
  ❌ Edge case: Very long headers cause layout problems
  ❌ Color descriptions sometimes too technical

Recommendations:
  1. Consider adding input validation for header length
  2. Add examples showing casual vs technical color descriptions
  3. Test with more diverse input scenarios

Current State:
  - Test still failing but much closer to passing
  - Manual refinement may be needed for remaining issues
  - Consider breaking test into multiple focused tests

Would you like to:
  - Continue with manual adjustments
  - Try different approach to remaining issues
  - Accept current state and mark known limitations
```

### No Progress Detected
```
═══════════════════════════════════════════════════════════════
🛑 NO PROGRESS DETECTED
═══════════════════════════════════════════════════════════════

Iterations Attempted: 2
Issues Remaining: 3 (same as previous iteration)

Issue:
  Changes were applied but test results unchanged. This suggests:
  - Issues may be with test expectations rather than prompt
  - LLM model may have inherent limitations for this task
  - Input data may not provide enough context

Suggestions:
  1. Review test expectations - are they realistic?
  2. Try different LLM model with better capabilities
  3. Provide more context in input data
  4. Simplify the task into smaller sub-tasks
  5. Add few-shot examples to prompt

Stopping to avoid wasted iterations.
```

## 🎨 Improvement Strategies

### Issue Type → Fix Strategy

#### Vagueness (Missing Specifics)
```
Issue: "slight tilt" without degree
Fix: Add instruction requiring measurements
     Add examples showing "10 degrees"
```

#### Verbosity (Too Wordy)
```
Issue: "Large, cheerful smiley face emojis with bold black outline..."
Fix: Add word/character limit constraint
     Show before/after examples
     Emphasize brevity in instructions
```

#### Format Violations
```
Issue: Line breaks in JSON strings
Fix: Add explicit "single line" constraint
     Update template to prevent breaks
     Add output validation instruction
```

#### Inconsistency
```
Issue: Some fields very detailed, others vague
Fix: Add consistency instruction
     Provide uniform detail level examples
     Emphasize balance across all fields
```

#### Missing Details
```
Issue: Decorative elements lack size/count
Fix: Add required fields checklist
     Update examples to always include
     Emphasize completeness in instructions
```

## 💡 Advanced Techniques

### Few-Shot Learning
```
When improving prompts, the tool may add few-shot examples:

BEFORE:
"Describe decorative elements clearly"

AFTER:
"Describe decorative elements clearly. Examples:
 ✓ GOOD: 'Large simple black outlined smiley emojis (80-100px) - 3-4 scattered'
 ✗ BAD: 'Some nice smiley faces placed around the design'"
```

### Constraint Layering
```
Iteration 1: Add basic constraints
Iteration 2: Add specific measurements
Iteration 3: Add format requirements
Iteration 4: Add consistency checks
```

### Template Optimization
```
May modify Jinja2 templates to:
- Add conditional formatting
- Enforce output structure
- Prevent common issues
- Ensure type compliance
```

## 🔧 Options Reference

### --max-iterations=N
Default: 5, Range: 1-10
```
/baml-improve MyTest --max-iterations=3   # Quick attempts
/baml-improve MyTest --max-iterations=10  # Thorough refinement
```

### --auto-approve
Skip confirmation prompts
```
/baml-improve MyTest --auto-approve
```

### --stop-on-first-pass
Exit as soon as test passes (don't over-optimize)
```
/baml-improve MyTest --stop-on-first-pass
```

### --goal="description"
Provide specific improvement goal
```
/baml-improve MyTest --goal="output should be under 500 characters"
```

### --focus=area
Focus on specific quality dimension
```
/baml-improve MyTest --focus=specificity
/baml-improve MyTest --focus=brevity
/baml-improve MyTest --focus=format
```

### --preserve="aspect"
Keep specific aspects unchanged
```
/baml-improve MyTest --preserve="device descriptions"
```

## 🎯 Success Metrics

The tool tracks and reports:
- **Issue Resolution Rate** - % of issues fixed
- **Iteration Efficiency** - Issues fixed per iteration
- **Output Quality** - Specificity, conciseness, consistency scores
- **Format Compliance** - JSON validity, schema conformance
- **Convergence Speed** - How quickly improvements plateau

## 📖 Integration

### With Other Commands
```bash
# Test → Improve → Commit workflow
/baml-test MyFunction::Test     # Check current state
/baml-improve MyFunction::Test  # Fix issues
/commit                         # Commit improvements
```

### CI/CD Integration
```yaml
# Ensure all tests pass with quality standards
- name: BAML Quality Check
  run: |
    npx baml-cli test || /baml-improve --auto-approve --max-iterations=3
```

### Development Workflow
1. Write new BAML function
2. Create test case with expected behavior
3. Run `/baml-improve FunctionName::TestCase`
4. Review proposed changes
5. Approve or manually adjust
6. Test passes → commit changes

## 🛡️ Safety Features

### Change Tracking
- Every iteration saves previous version
- Can rollback to any previous state
- Maintains change log with rationale

### Validation
- Runs `baml-cli check` after each change
- Ensures valid BAML syntax
- Verifies TypeScript generation succeeds

### User Control
- Can stop iteration at any point
- Option to review/approve each change
- Can provide guidance for next iteration

## 💡 Best Practices

### When to Use
- ✅ Test is failing and needs systematic improvement
- ✅ Output quality is inconsistent
- ✅ You want to optimize an already-working prompt
- ✅ Exploring different prompt strategies

### When NOT to Use
- ❌ Test expectations are unclear (fix test first)
- ❌ Function logic is fundamentally wrong (redesign needed)
- ❌ Issues are with input data quality
- ❌ LLM model lacks necessary capabilities

### Tips for Success
1. **Clear Test Cases** - Well-defined expected outputs
2. **Specific Goals** - Use `--goal` to guide improvements
3. **Reasonable Expectations** - LLMs have inherent limitations
4. **Iterative Refinement** - Let it work through issues systematically
5. **Review Changes** - Understand what changed and why

## 🚀 Example Session

```
User: /baml-improve GenerateScreenshotEditPrompt::SnapStyleScreenshot