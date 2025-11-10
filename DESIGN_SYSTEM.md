# Racing Life Design System & Style Guide

**Last Updated:** November 2025
**Design Inspiration:** The Atlantic (Editorial/Newspaper aesthetic)

---

## Design Philosophy

Racing Life is **NOT a SaaS website**. It is an editorial, content-first platform inspired by premium publications like The Atlantic. The design prioritizes:

- **Readability and typography** over flashy visuals
- **Clean, structured layouts** with clear hierarchy
- **Minimal color palette** focusing on grayscale with strategic accent colors
- **Editorial credibility** through serif fonts and newspaper-style layouts
- **Content density** without feeling cluttered

### Core Principles

1. **Editorial First**: Content is king. Design should enhance, not distract from content
2. **Typographic Hierarchy**: Use font size, weight, and family to create clear visual hierarchy
3. **Structured Grids**: Consistent use of borders, dividers, and grid layouts
4. **Minimal Colors**: Primarily grayscale with strategic use of black, white, and red accents
5. **No Gradients or Shadows**: Flat design except for subtle shadows on sticky elements

---

## Color Palette

### Primary Colors

```css
White Background: #FFFFFF (bg-white)
Black Text/Accents: #000000 (bg-black, text-black)
Dark Gray: #111827 (gray-900) - Primary text, borders
Medium Gray: #4B5563 (gray-600/gray-700) - Secondary text
Light Gray: #9CA3AF (gray-500) - Tertiary text, subtle elements
Very Light Gray: #F9FAFB (gray-50) - Background sections
Border Gray: #E5E7EB (gray-200) - Standard borders
Subtle Border: #F3F4F6 (gray-100) - Very subtle dividers
```

### Accent Colors

```css
Red (Exclusive/Featured): #DC2626 (red-600) - Used sparingly for "Exclusive" badges
Hover States: #1F2937 (gray-800) - Black button hover states
```

### Usage Rules

- **Background**: Alternate between `bg-white` and `bg-gray-50` for section contrast
- **Text**: `text-gray-900` for headings, `text-gray-700` for body, `text-gray-600` for secondary, `text-gray-500` for tertiary
- **Borders**: Use `border-gray-900` for prominent dividers (section headers), `border-gray-200` for standard borders, `border-gray-100` for subtle dividers
- **Interactive Elements**: Black backgrounds (`bg-black`) with white text, hover to `bg-gray-800`

---

## Typography

### Font Families

```css
Serif (Headings): font-serif - Used for all major headings, logo, section titles
Sans-serif (Body): Default Tailwind sans - Used for body text, labels, UI elements
```

### Type Scale

```typescript
// Headings
Hero Heading: "text-6xl lg:text-7xl font-serif font-bold" (60px/70px)
Page Title: "text-4xl font-serif font-bold" (36px)
Section Heading: "text-3xl font-serif font-bold" (30px)
Card Title: "text-2xl font-serif font-bold" (24px)
Subheading: "text-xl font-serif font-bold" (20px)

// Body Text
Large Body: "text-2xl font-light" (24px) - Hero descriptions
Body: "text-base" (16px) - Standard body text
Small: "text-sm" (14px) - Secondary text, metadata
Extra Small: "text-xs" (12px) - Labels, uppercase tracking
```

### Font Weights

```css
Bold: font-bold (700) - Headings, emphasis
Semibold: font-semibold (600) - Buttons, strong labels
Medium: font-medium (500) - Links, navigation
Normal: font-normal (400) - Body text
Light: font-light (300) - Large display text
```

### Line Heights & Spacing

```css
Tight Headings: leading-[1.1] or leading-tight
Relaxed Body: leading-relaxed
Tracking: tracking-tight (headings), tracking-wide (uppercase labels), tracking-wider (small labels)
```

---

## Layout System

### Container & Spacing

```typescript
// Max width container (used on all sections)
<div className="max-w-[1400px] mx-auto px-6">

// Section vertical padding
py-20 // Standard section padding (80px top/bottom)
py-16 // Reduced section padding (64px)
py-12 // Compact section padding (48px)
```

### Grid Layouts

```typescript
// Common grid patterns
grid md:grid-cols-2 gap-6        // 2 columns
grid md:grid-cols-3 gap-6        // 3 columns (bookmakers, guides)
grid md:grid-cols-5 gap-12       // 5 columns (footer)
grid lg:grid-cols-[2fr,1fr]      // 2:1 ratio (main content + sidebar)

// Gap spacing
gap-2  // 8px - Tight spacing
gap-3  // 12px - Compact spacing
gap-4  // 16px - Standard spacing
gap-6  // 24px - Card spacing
gap-8  // 32px - Section spacing
gap-12 // 48px - Large spacing
```

### Section Structure Pattern

```typescript
<section className="bg-white border-b border-gray-200">
  <div className="max-w-[1400px] mx-auto px-6 py-20">

    {/* Section Header */}
    <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-900">
      <div>
        <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
          Section Title
        </h2>
        <p className="text-gray-600">
          Section description
        </p>
      </div>
      <Link
        href="/view-all"
        className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600"
      >
        View all →
      </Link>
    </div>

    {/* Section Content */}
    <div className="grid md:grid-cols-3 gap-6">
      {/* Content here */}
    </div>

  </div>
</section>
```

---

## Component Patterns

### Buttons

#### Primary Button (CTA)

```typescript
<Link
  href="/action"
  className="inline-flex items-center justify-center px-10 py-5 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all hover:translate-x-1"
>
  Button Text
  <ArrowRight className="ml-3 h-5 w-5" />
</Link>
```

#### Secondary Button (Outline)

```typescript
<Link
  href="/action"
  className="inline-flex items-center justify-center px-10 py-5 border-2 border-gray-900 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
>
  Button Text
</Link>
```

#### Small Button

```typescript
<Link
  href="/action"
  className="px-6 py-3 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
>
  Get Bonus
</Link>
```

#### Text Link with Underline

```typescript
<Link
  href="/view-more"
  className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600"
>
  View all →
</Link>
```

### Cards

#### Standard Article Card

```typescript
<article className="group border border-gray-200 hover:border-gray-900 transition-all">
  <Link href="/article-slug">
    {/* Image */}
    <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300"></div>

    {/* Content */}
    <div className="p-6">
      {/* Category & Meta */}
      <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        <span>Category</span>
        <span>·</span>
        <span>8 min read</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors leading-tight">
        Article Title
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed mb-4">
        Article description text...
      </p>

      {/* Author & Date */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
          <span className="text-sm text-gray-600">Author Name</span>
        </div>
        <span className="text-xs text-gray-500">Nov 10, 2025</span>
      </div>
    </div>
  </Link>
</article>
```

#### Race Card (Next to Jump)

```typescript
<Link href="/races/flemington-r4" className="group">
  <div className="border border-gray-200 hover:border-gray-900 transition-all">
    {/* Header */}
    <div className="bg-gray-900 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs opacity-75 mb-1">FLEMINGTON · R4</div>
          <div className="font-semibold">1400m · Good 4</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-75 mb-1">STARTS</div>
          <div className="font-bold text-lg">2:15 PM</div>
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="p-4 bg-white">
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">FAVOURITE</div>
        <div className="font-semibold text-gray-900 text-lg">Horse Name</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">BEST ODDS</div>
          <div className="text-2xl font-bold text-gray-900">$3.50</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-500 mb-1">BOOKMAKER</div>
          <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">TAB</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</Link>
```

#### Bookmaker Card

```typescript
<div className="bg-gray-50 border-2 border-gray-200 hover:border-gray-900 transition-all group">
  {/* Header with Logo & Offer */}
  <div className="bg-white border-b-2 border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-900 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white">TAB</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">TAB</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {/* Star ratings */}
            </div>
            <span className="text-xs text-gray-600">4.5</span>
          </div>
        </div>
      </div>
      <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
        Exclusive
      </div>
    </div>

    <div className="text-2xl font-bold text-gray-900 mb-2">
      Bet $50, Get $50 in Bonus Bets
    </div>
    <p className="text-xs text-gray-500 mb-4">
      New customers only. T&Cs apply.
    </p>
  </div>

  {/* Features & CTA */}
  <div className="p-6">
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Feature checkmarks */}
    </div>

    <div className="flex gap-3">
      <Link href="/bookmakers/tab" className="flex-1 text-center px-6 py-3 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors">
        Get Bonus
      </Link>
      <Link href="/bookmakers/tab/review" className="px-6 py-3 border-2 border-gray-900 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
        Review
      </Link>
    </div>

    <p className="text-xs text-gray-500 mt-4 text-center">
      18+ · T&Cs Apply · Gamble Responsibly
    </p>
  </div>
</div>
```

### Badges & Labels

#### Exclusive Badge

```typescript
<div className="px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
  Exclusive
</div>
```

#### Featured Badge

```typescript
<div className="inline-block px-3 py-1 bg-black text-white text-xs font-semibold uppercase tracking-wider">
  Featured
</div>
```

#### Bookmaker Badge

```typescript
<div className="flex items-center gap-2 px-2 py-1 bg-gray-100 border border-gray-200">
  <div className="w-5 h-5 bg-gray-900 flex items-center justify-center">
    <span className="text-white text-[10px] font-bold">TAB</span>
  </div>
  <span className="text-xs font-semibold text-gray-700">TAB</span>
</div>
```

#### Category Label

```typescript
<div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
  Category Name
</div>
```

### Author Avatars

Always include author avatars as circular gray placeholders where authors are mentioned:

```typescript
// Small avatar (6x6) - Secondary content
<div className="flex items-center gap-2">
  <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
  <span className="text-sm text-gray-600">Author Name</span>
</div>

// Medium avatar (8x8) - Featured content
<div className="flex items-center gap-3">
  <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
  <span className="font-medium">Author Name</span>
</div>
```

### Forms

#### Input Field

```typescript
<input
  type="email"
  placeholder="Enter your email"
  className="flex-1 px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-900"
/>
```

#### Newsletter Signup

```typescript
<form className="flex gap-2">
  <input
    type="email"
    placeholder="Enter your email"
    className="flex-1 px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-900"
  />
  <button
    type="submit"
    className="px-6 py-2 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
  >
    Subscribe
  </button>
</form>
```

---

## Global Components

### Header (EditorialHeader)

**File:** `/frontend/src/components/layout/EditorialHeader.tsx`

Features:

- Sticky header with scroll behavior (top bar hides on scroll down)
- Three-tier navigation: Top bar (date/auth), Main nav (logo + links), Secondary nav (featured links)
- White background with subtle shadow on scroll
- Serif logo: "Racing Life"
- Dropdown menu for "More" section
- Mobile responsive menu

**Usage:** Automatically included in root layout - no need to add manually

### Footer (ModernFooter)

**File:** `/frontend/src/components/layout/ModernFooter.tsx`

Features:

- 5-column grid layout (Brand 2-col, Racing, Content, Company)
- Integrated newsletter signup
- Bold black top border
- Section headers with black underline borders
- Clean, minimal link styling

**Usage:** Automatically included in root layout - no need to add manually

---

## Page Layout Pattern

All pages should follow this structure:

```typescript
export default function PageName() {
  return (
    <>
      {/* Hero/Header Section */}
      <section className="bg-white border-b border-gray-900">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <h1 className="text-6xl font-serif font-bold text-gray-900 mb-4">
            Page Title
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Page description
          </p>
        </div>
      </section>

      {/* Content Section 1 */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-900">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                Section Title
              </h2>
              <p className="text-gray-600">
                Section description
              </p>
            </div>
            <Link
              href="/view-all"
              className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600"
            >
              View all →
            </Link>
          </div>

          {/* Section Content */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cards/Content */}
          </div>
        </div>
      </section>

      {/* Content Section 2 */}
      <section className="bg-white border-b border-gray-200">
        {/* Alternate background color */}
      </section>
    </>
  );
}
```

---

## Interactive States

### Hover States

```css
/* Links */
hover:text-gray-600 (from text-gray-900)
hover:text-black (from text-gray-700)

/* Buttons */
hover:bg-gray-800 (from bg-black)
hover:bg-gray-50 (from bg-white)

/* Borders */
hover:border-gray-900 (from border-gray-200)
hover:border-gray-600 (from border-gray-900)

/* Transform */
hover:translate-x-1 (for CTAs with arrows)

/* Opacity */
hover:opacity-70 (for logo)
```

### Transitions

```css
transition-colors    // Default for most interactions
transition-all       // For complex state changes
transition-opacity   // For fade effects
transition-transform // For movement effects

// Duration (default 150ms is usually fine)
duration-200
duration-300
```

### Focus States

```css
focus:outline-none
focus:border-gray-900 (for inputs)
```

---

## Spacing System

### Padding/Margin Scale

```css
p-2  = 8px    // Tight
p-3  = 12px   // Compact
p-4  = 16px   // Standard
p-6  = 24px   // Comfortable
p-8  = 32px   // Spacious
p-10 = 40px   // Large
p-12 = 48px   // Extra Large
p-16 = 64px   // Section padding
p-20 = 80px   // Standard section padding
```

### Section Spacing Pattern

```typescript
// Standard section
<section className="bg-white border-b border-gray-200">
  <div className="max-w-[1400px] mx-auto px-6 py-20">
    {/* mb-12 for header spacing */}
    {/* gap-6 for content grid */}
  </div>
</section>
```

---

## Border Patterns

### Border Colors & Weights

```css
// Prominent dividers
border-gray-900       // Bold black borders for section headers

// Standard borders
border-gray-200       // Card borders, standard dividers

// Subtle dividers
border-gray-100       // Very subtle separation

// Border widths
border               // 1px
border-2             // 2px (for emphasis)
border-t             // Top only
border-b             // Bottom only
```

### Common Border Patterns

```typescript
// Section header with bottom border
<div className="mb-12 pb-6 border-b border-gray-900">

// Card with hover border change
<div className="border border-gray-200 hover:border-gray-900">

// Top bar separator
<div className="border-t border-gray-100">

// Footer top border
<footer className="bg-white border-t border-gray-900">
```

---

## Advertising Spaces

The site includes designated advertising spaces. Always maintain editorial integrity:

```typescript
// Standard Ad Space
<div className="border border-gray-300 bg-gray-50 flex flex-col">
  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    <div className="text-center p-6">
      <div className="w-20 h-20 bg-gray-900 mx-auto mb-4 flex items-center justify-center">
        <span className="text-white text-2xl font-bold">AD</span>
      </div>
      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Sponsored Content
      </div>
    </div>
  </div>
  <div className="p-6 flex-1 flex flex-col justify-center text-center">
    <p className="text-sm text-gray-500 mb-4">
      Premium advertising space available
    </p>
    <a href="/advertise" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600 inline-block">
      Learn More →
    </a>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

```css
sm:   640px   // Mobile landscape
md:   768px   // Tablet
lg:   1024px  // Desktop
xl:   1280px  // Large desktop
2xl:  1536px  // Extra large
```

### Common Responsive Patterns

```typescript
// Grid that collapses on mobile
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

// Text size scaling
<h1 className="text-5xl lg:text-7xl">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Show on mobile, hide on desktop
<div className="lg:hidden">

// Responsive padding
<div className="px-4 md:px-6">

// Responsive flex direction
<div className="flex flex-col md:flex-row">
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This:

1. **Using gradient backgrounds everywhere**

   ```typescript
   // Wrong - too SaaS-like
   <div className="bg-gradient-to-r from-blue-500 to-purple-600">
   ```

2. **Rounded corners on everything**

   ```typescript
   // Wrong - not editorial
   <div className="rounded-2xl">
   ```

3. **Colorful buttons and CTAs**

   ```typescript
   // Wrong - too vibrant
   <button className="bg-blue-500 hover:bg-blue-600">
   ```

4. **Drop shadows on cards**

   ```typescript
   // Wrong - not flat enough
   <div className="shadow-xl rounded-lg">
   ```

5. **Missing serif fonts on headings**
   ```typescript
   // Wrong - loses editorial feel
   <h1 className="text-4xl font-bold">
   ```

### ✅ Do This Instead:

1. **Use solid backgrounds**

   ```typescript
   // Correct
   <div className="bg-white">
   ```

2. **Square corners (no border-radius)**

   ```typescript
   // Correct
   <div className="border border-gray-200">
   ```

3. **Black/white buttons**

   ```typescript
   // Correct
   <button className="bg-black text-white hover:bg-gray-800">
   ```

4. **Flat design with borders**

   ```typescript
   // Correct
   <div className="border border-gray-200">
   ```

5. **Always use serif for headings**
   ```typescript
   // Correct
   <h1 className="text-4xl font-serif font-bold">
   ```

---

## Quick Reference Checklist

When creating new pages or components, ensure:

- [ ] Headings use `font-serif font-bold`
- [ ] Primary text is `text-gray-900`
- [ ] No rounded corners except for author avatars
- [ ] Background alternates between `bg-white` and `bg-gray-50`
- [ ] Section borders use `border-b border-gray-200` or `border-gray-900`
- [ ] Buttons are black (`bg-black`) or outlined (`border-2 border-gray-900`)
- [ ] No gradients (except ad placeholder backgrounds)
- [ ] No box shadows (except subtle `shadow-sm` on sticky header)
- [ ] Consistent spacing: `px-6` horizontal, `py-20` vertical for sections
- [ ] Max width container: `max-w-[1400px] mx-auto`
- [ ] Author avatars included where appropriate
- [ ] Links use underline hover: `border-b border-gray-900 hover:border-gray-600`
- [ ] Interactive states have `transition-colors` or `transition-all`

---

## Tech Stack Reference

- **Framework:** Next.js 16.0.1 (App Router)
- **React:** 19.2.0
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Fonts:** Default system serif + sans-serif stack

---

## Example Components Reference

For complete code examples, see:

- `/frontend/src/components/home/HeroSection.tsx` - Hero pattern with featured content
- `/frontend/src/components/home/NewsSection.tsx` - Article cards with authors
- `/frontend/src/components/home/BookmakersSection.tsx` - Bookmaker cards
- `/frontend/src/components/home/FeaturesSection.tsx` - Expert tips and guides
- `/frontend/src/components/layout/EditorialHeader.tsx` - Navigation header
- `/frontend/src/components/layout/ModernFooter.tsx` - Footer with newsletter

---

## For Future Claude Sessions

When continuing work on Racing Life:

1. **Read this document first** to understand the design system
2. **Never suggest SaaS-style designs** (gradients, colorful buttons, heavy shadows)
3. **Always use the section pattern** shown above for new pages
4. **Maintain typography hierarchy** with serif headings
5. **Keep the minimal color palette** - grayscale + strategic black/red
6. **Check existing components** before creating new patterns
7. **Remember:** This is an editorial publication, not a SaaS product

---

**End of Design System Guide**
