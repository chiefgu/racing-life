# Instructions for Future Claude Sessions

## 🎯 Quick Start

**READ THIS FIRST before making any design decisions!**

Racing Life is an **editorial/newspaper-style website** inspired by **The Atlantic**. It is **NOT a SaaS product**.

---

## ⚡ Critical Rules

### ❌ NEVER DO:

- Suggest gradients, colorful buttons, or vibrant accent colors
- Add rounded corners (except author avatars)
- Use drop shadows (except subtle shadow on sticky header)
- Create SaaS-style designs with blues, purples, or bright colors
- Ignore the serif font requirement for headings

### ✅ ALWAYS DO:

- Use `font-serif font-bold` for all headings (h1, h2, h3, etc.)
- Stick to grayscale palette (white, gray-900, gray-600, gray-500, gray-200)
- Use black buttons (`bg-black text-white`)
- Keep designs flat and editorial
- Include author avatars where authors are mentioned
- Follow the section pattern (see below)

---

## 🎨 Design Snapshot

**Colors:**

- Background: `bg-white` or `bg-gray-50` (alternate)
- Text: `text-gray-900` (headings), `text-gray-700` (body), `text-gray-600` (secondary)
- Buttons: `bg-black text-white hover:bg-gray-800`
- Borders: `border-gray-900` (prominent), `border-gray-200` (standard)
- Accent: `bg-red-600` (only for "Exclusive" badges)

**Typography:**

- Headings: `font-serif font-bold` (always!)
- Hero: `text-6xl lg:text-7xl`
- Section Title: `text-4xl`
- Card Title: `text-2xl`
- Body: `text-base`

**Layout:**

- Container: `max-w-[1400px] mx-auto px-6`
- Section Padding: `py-20`
- Grid Gap: `gap-6` (cards), `gap-12` (sections)

---

## 📐 Standard Section Pattern

Copy this pattern for every new section:

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

    {/* Content Grid */}
    <div className="grid md:grid-cols-3 gap-6">
      {/* Your content here */}
    </div>

  </div>
</section>
```

**Key Elements:**

1. Alternate `bg-white` and `bg-gray-50` for visual separation
2. Bold border on section headers: `border-b border-gray-900`
3. Standard padding: `py-20` vertical, `px-6` horizontal
4. Consistent spacing: `mb-12` below header, `gap-6` in grids

---

## 🧩 Component Quick Reference

### Primary Button

```typescript
<Link
  href="/action"
  className="px-10 py-5 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
>
  Button Text
</Link>
```

### Secondary Button (Outline)

```typescript
<Link
  href="/action"
  className="px-10 py-5 border-2 border-gray-900 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
>
  Button Text
</Link>
```

### Text Link

```typescript
<Link
  href="/more"
  className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600"
>
  View all →
</Link>
```

### Author with Avatar

```typescript
<div className="flex items-center gap-2">
  <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
  <span className="text-sm text-gray-600">Author Name</span>
</div>
```

### Article Card

```typescript
<article className="border border-gray-200 hover:border-gray-900 transition-all">
  <Link href="/article">
    <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300"></div>
    <div className="p-6">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Category · 5 min read
      </div>
      <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 leading-tight">
        Article Title
      </h3>
      <p className="text-gray-600 leading-relaxed mb-4">
        Description...
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
          <span className="text-sm text-gray-600">Author</span>
        </div>
        <span className="text-xs text-gray-500">Nov 10</span>
      </div>
    </div>
  </Link>
</article>
```

---

## 🏗️ Global Layout Structure

**Header and Footer are automatic!**

The root layout (`/frontend/src/app/layout.tsx`) already includes:

- `<EditorialHeader />` - Sticky navigation with scroll behavior
- `<ModernFooter />` - Editorial footer with newsletter

You don't need to add these manually to new pages.

---

## 📄 Creating New Pages

1. **Read DESIGN_SYSTEM.md** for complete guidelines
2. **Use the section pattern** shown above
3. **Start with a hero section:**

```typescript
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
```

4. **Alternate section backgrounds** (white → gray-50 → white)
5. **Use consistent spacing** and typography throughout

---

## 🎓 Reference Files

For complete code examples, reference these existing components:

| Component       | File                                                  | Purpose                           |
| --------------- | ----------------------------------------------------- | --------------------------------- |
| Hero Section    | `/frontend/src/components/home/HeroSection.tsx`       | Hero layout with featured content |
| News Cards      | `/frontend/src/components/home/NewsSection.tsx`       | Article cards with authors        |
| Bookmaker Cards | `/frontend/src/components/home/BookmakersSection.tsx` | Bookmaker offer cards             |
| Expert Tips     | `/frontend/src/components/home/FeaturesSection.tsx`   | Tips and betting guides           |
| Header          | `/frontend/src/components/layout/EditorialHeader.tsx` | Navigation header                 |
| Footer          | `/frontend/src/components/layout/ModernFooter.tsx`    | Footer with newsletter            |

---

## ✅ Pre-Flight Checklist

Before submitting any design work, verify:

- [ ] All headings use `font-serif font-bold`
- [ ] Colors are grayscale (no blues, purples, greens)
- [ ] Buttons are black or outlined
- [ ] No rounded corners (except avatars)
- [ ] Sections use `max-w-[1400px] mx-auto px-6`
- [ ] Background alternates between white and gray-50
- [ ] Author avatars included where relevant
- [ ] Borders are flat (no shadows)
- [ ] Hover states use `transition-colors`
- [ ] Links have underline on hover

---

## 🚨 Common Mistakes

**If the user says:**

- "This looks too SaaS-like" → You used colors/gradients/rounded corners
- "This doesn't match the rest of the site" → You didn't use serif fonts or the section pattern
- "The spacing feels off" → You didn't use `py-20` and consistent gaps

**Fix by:**

- Removing all colors except grayscale + strategic black/red
- Adding `font-serif font-bold` to all headings
- Following the exact section pattern above
- Using consistent spacing: `py-20`, `px-6`, `gap-6`

---

## 💡 Design Philosophy Summary

Think: **The Atlantic, The New York Times, premium editorial publications**

NOT: Stripe, Notion, Linear, or any SaaS product

**Characteristics:**

- Content-first, typography-driven
- Minimal, intentional color palette
- Clean structural borders instead of shadows
- Serif headings for editorial credibility
- Generous whitespace and reading comfort
- Flat, no-nonsense design

---

## 🔄 Workflow for New Features

1. Ask: "Would The Atlantic design it this way?"
2. If unsure, check existing homepage components
3. Use the section pattern as your foundation
4. Keep it grayscale, serif headings, flat design
5. Test that it matches the existing aesthetic

---

**For full documentation, see: `/DESIGN_SYSTEM.md`**
