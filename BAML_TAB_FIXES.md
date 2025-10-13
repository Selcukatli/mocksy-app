# BAML Tab Generation Fixes

## Issues Found

1. **Contradictory instructions** about copying decorations but not colors
2. **Overly complex `tab_styling` field** that's hard to parse
3. **Verbose prompts** causing inconsistent generation
4. **"Markings under tabs"** are artifacts from confused decoration copying

## Proposed Fixes

### Fix 1: Simplify TabStructure class

**Current (problematic):**
```baml
tab_styling string @description("Complete styling description including visual selection indicators, decorations, positioning, and sizing...")
```

**Proposed:**
```baml
class TabStructure {
  has_tabs bool
  tab_names string[]
  tab_icon_descriptions string[]
  active_tab_color string
  inactive_tab_color string
  active_icon_style string // "filled" or "outline"
  inactive_icon_style string // "filled" or "outline"
  
  // SIMPLIFIED - Just specify ONE clear approach
  selection_indicator string @description("How active tab is shown. Choose ONE: 'underline_2px' OR 'pill_background' OR 'none'. Keep it simple.")
  tab_bar_height int @description("Tab bar height in pixels (typically 72)")
  icon_size int @description("Icon size in pixels (typically 24)")
  label_size int @description("Label font size in pixels (typically 11)")
}
```

### Fix 2: Simplify First Screen Tab Instructions

**Current (Line 527):**
```
5. **TAB BAR** (bottom of canvas, 72px height): {{ tabs.tab_names | join(', ') }}. {{ tabs.tab_styling }}
```

**Proposed:**
```
5. **TAB BAR** (bottom edge, {{ tabs.tab_bar_height }}px):
Tabs: {{ tabs.tab_names | join(', ') }}
{% if screen_detail.active_tab_index is defined and screen_detail.active_tab_index is not none %}
- Active "{{ tabs.tab_names[screen_detail.active_tab_index] }}": {{ tabs.active_icon_style }} {{ tabs.icon_size }}px icon + {{ tabs.active_tab_color }} {{ tabs.label_size }}px label{% if tabs.selection_indicator == 'underline_2px' %} + 2px underline below{% endif %}{% if tabs.selection_indicator == 'pill_background' %} + rounded pill bg at 15% opacity{% endif %}
- Others: {{ tabs.inactive_icon_style }} {{ tabs.icon_size }}px icon + {{ tabs.inactive_tab_color }} {{ tabs.label_size }}px label
{% endif %}
Evenly spaced. Icons above labels, 4px gap.
```

### Fix 3: Fix Reference Screen Tab Instructions (THE BIG FIX)

**Current (Lines 633-636 - CONTRADICTORY):**
```
5. **TAB BAR UPDATE (CRITICAL - bottom edge, 72px)**: Look at reference (image 1) tab bar. Copy its EXACT visual style (layout, spacing, icons, decorations). ONLY change: deselect previously active tab, activate "..." tab.
- Active "...": ... + decoration (pill/underline/etc from reference)
- All other tabs: ... label, no decoration
```

**Proposed (CLEAR AND CONSISTENT):**
```
5. **TAB BAR** (bottom edge, {{ tabs.tab_bar_height }}px):
Match reference bar: EXACT spacing, sizing, positioning.
Tabs: {{ tabs.tab_names | join(', ') }}
ONLY UPDATE which tab is active:
- Active "{{ tabs.tab_names[screen_detail.active_tab_index] }}": {{ tabs.active_icon_style }} icon + {{ tabs.active_tab_color }} label{% if tabs.selection_indicator == 'underline_2px' %} + 2px underline{% endif %}{% if tabs.selection_indicator == 'pill_background' %} + pill bg (match reference pill style exactly - same radius, padding){% endif %}
- All others: {{ tabs.inactive_icon_style }} icon + {{ tabs.inactive_tab_color }} label, NO decoration
Keep exact icon size, label size, spacing from reference.
```

### Fix 4: Simplify App Design Plan Prompt

In `GenerateAppDesignPlan`, replace lines 329-340 with:

```
- **CRITICAL: Define selection_indicator:**
  * Pick ONE simple approach: "underline_2px" (2px line under active tab), "pill_background" (rounded background behind active tab), or "none"
  * Don't over-specify - the image generator will handle the details
  * Most apps use underline or pill
- **Tab bar measurements:**
  * tab_bar_height: typically 72px
  * icon_size: typically 24px  
  * label_size: typically 11px
```

## Why These Fixes Work

1. **Removes contradiction** - No more "copy decorations but not colors"
2. **Simplifies field structure** - Each field has ONE clear purpose
3. **Reduces prompt length** - Shorter, clearer instructions
4. **Consistent across screens** - Same simple approach for first screen and reference screens
5. **Easier to parse** - AI can understand "underline_2px" vs 500 char description
6. **No artifacts** - Clear instructions = no weird markings

## Implementation Priority

**HIGH PRIORITY:**
- Fix 3 (Reference screen instructions) - This is causing the "markings under tabs" issue

**MEDIUM PRIORITY:**  
- Fix 1 (Simplify TabStructure) - Makes everything else easier
- Fix 2 (First screen instructions) - Consistency

**LOW PRIORITY:**
- Fix 4 (Simplify planning prompt) - Quality of life improvement

