# ESUM Energy Trading Platform
## Brand Identity & Visual Guidelines

---

## 1. BRAND OVERVIEW

### Brand Name
**ESUM** - Energy Trading Platform

### Brand Essence
ESUM represents the future of energy trading in South Africa - transparent, efficient, and sustainable. The name "ESUM" evokes:
- **E**nergy
- **S**ustainable
- **U**nified
- **M**arket

### Brand Positioning
World's first fully integrated Open Market Energy Trading Platform enabling free-market exchange of green energy contracts and carbon credits across South Africa.

### Brand Values
1. **Transparency** - Open, accessible market information
2. **Sustainability** - Accelerating green energy adoption
3. **Innovation** - AI-driven decision support
4. **Trust** - Secure, regulated trading environment
5. **Efficiency** - Streamlined energy procurement

---

## 2. LOGO DESIGN

### Primary Logo

```
    ███████╗███╗   ██╗███████╗
    ██╔════╝████╗  ██║██╔════╝
    █████╗  ██╔██╗ ██║█████╗  
    ██╔══╝  ██║╚██╗██║██╔══╝  
    ███████╗██║ ╚████║███████╗
    ╚══════╝╚═╝  ╚═══╝╚══════╝
    
    ENERGY TRADING PLATFORM
```

### Logo Concept
The ESUM logo features:
- **Bold, geometric letterforms** representing stability and reliability
- **Upward-pointing arrow** integrated into the 'E' symbolizing growth and progress
- **Circuit-like connections** in the 'M' representing grid connectivity
- **Green gradient** from emerald (#00A86B) to forest green (#007A54)

### Logo Variations

#### Full Color (Primary)
- ESUM wordmark in green gradient
- Tagline in navy (#0A111E)

#### Monochrome
- All black for print applications
- All white for dark backgrounds

#### Icon Only
- Stylized 'E' with energy bolt motif
- Used for favicons, app icons, social media

### Clear Space
Maintain minimum clear space equal to the height of the 'E' on all sides of the logo.

### Minimum Size
- Digital: 120px width
- Print: 25mm width

---

## 3. COLOR PALETTE

### Primary Colors

#### ESUM Green
```
Emerald Green
HEX: #00A86B
RGB: 0, 168, 107
CMYK: 85, 0, 75, 0
Pantone: 347 C
```

#### Forest Green (Secondary)
```
Forest Green
HEX: #007A54
RGB: 0, 122, 84
CMYK: 90, 0, 80, 10
Pantone: 342 C
```

#### Navy (Brand Base)
```
Deep Navy
HEX: #0A111E
RGB: 10, 17, 30
CMYK: 95, 90, 60, 65
Pantone: Black 6 C
```

### Accent Colors

#### Energy Gold
```
Gold
HEX: #C9A12B
RGB: 201, 161, 43
CMYK: 20, 30, 90, 0
Pantone: 124 C
Usage: Carbon credits, premium features
```

#### Data Blue
```
Tech Blue
HEX: #1A73E8
RGB: 26, 115, 232
CMYK: 85, 55, 0, 0
Pantone: 2925 C
Usage: Analytics, data features
```

#### Solar Orange
```
Solar Orange
HEX: #FF6B35
RGB: 255, 107, 53
CMYK: 0, 70, 85, 0
Pantone: 1655 C
Usage: Solar energy indicators
```

#### Wind Cyan
```
Wind Cyan
HEX: #00B4D8
RGB: 0, 180, 216
CMYK: 75, 10, 0, 0
Pantone: 2995 C
Usage: Wind energy indicators
```

### Neutral Palette

```
Pure White:     #FFFFFF
Off White:      #F8FAFC
Light Gray:     #E2E8F0
Medium Gray:    #64748B
Dark Gray:      #334155
Charcoal:       #1E293B
```

### Status Colors

```
Success: #00A86B (Emerald Green)
Warning: #F59E0B (Amber)
Error:   #EF4444 (Red)
Info:    #1A73E8 (Blue)
```

---

## 4. TYPOGRAPHY

### Primary Typeface: Instrument Serif

**Usage:** Headlines, logos, display text

```
Instrument Serif Bold
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789
```

**Weights:**
- Bold (700) - Main headlines
- SemiBold (600) - Subheadlines
- Regular (400) - Accent text

**Fallback:** Georgia, Times New Roman

### Secondary Typeface: Outfit

**Usage:** Body text, UI elements, data display

```
Outfit
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789
```

**Weights:**
- SemiBold (600) - Emphasis, buttons
- Medium (500) - Subheadings
- Regular (400) - Body text

**Fallback:** system-ui, -apple-system, sans-serif

### Typography Scale

```
Display XL:  72px / 4.5rem   - Hero headlines
Display L:   56px / 3.5rem   - Page titles
Display M:   40px / 2.5rem   - Section headers
H1:          32px / 2rem     - Major headings
H2:          24px / 1.5rem   - Subsections
H3:          20px / 1.25rem  - Card titles
H4:          18px / 1.125rem - Small headers
Body L:      18px / 1.125rem - Lead text
Body:        16px / 1rem     - Standard text
Body S:      14px / 0.875rem - Secondary text
Caption:     12px / 0.75rem  - Labels, hints
```

### Line Heights

```
Headlines: 1.1 - 1.2
Body:      1.5 - 1.6
Data:      1.3
```

---

## 5. VISUAL ELEMENTS

### Patterns

#### Grid Pattern
Inspired by energy grid networks, used for backgrounds and section dividers.

```css
background-image: 
  linear-gradient(rgba(0, 168, 107, 0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 168, 107, 0.1) 1px, transparent 1px);
background-size: 20px 20px;
```

#### Wave Pattern
Representing energy flow and market fluctuations.

```css
background: repeating-linear-gradient(
  45deg,
  transparent,
  transparent 10px,
  rgba(0, 168, 107, 0.05) 10px,
  rgba(0, 168, 107, 0.05) 20px
);
```

### Icons

**Style:** Line icons with 2px stroke, rounded caps

**Categories:**
- Energy (solar panels, wind turbines, batteries)
- Trading (charts, orders, contracts)
- Carbon (leaves, credits, offsets)
- Grid (transmission, distribution)
- Analytics (graphs, reports)

**Icon Library:** Lucide React, Heroicons

### Illustrations

**Style:** Isometric, clean lines, brand colors

**Subjects:**
- Energy trading scenarios
- Grid infrastructure
- Renewable energy installations
- Data visualization scenes

---

## 6. UI COMPONENTS

### Cards

**Default Card:**
```css
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 8px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

**Glass Card:**
```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Buttons

**Primary:**
```css
background: #00A86B;
color: #FFFFFF;
border-radius: 6px;
padding: 10px 20px;
font-weight: 600;
```

**Secondary:**
```css
background: #F8FAFC;
color: #334155;
border: 1px solid #E2E8F0;
```

### Form Elements

**Input Fields:**
```css
border: 1px solid #E2E8F0;
border-radius: 6px;
padding: 10px 12px;
background: #FFFFFF;
```

**Focus State:**
```css
border-color: #00A86B;
box-shadow: 0 0 0 3px rgba(0, 168, 107, 0.1);
```

---

## 7. DATA VISUALIZATION

### Chart Colors

```
Solar:      #FFB347 (Orange)
Wind:       #00B4D8 (Cyan)
Hydro:      #4CC9F0 (Light Blue)
Biomass:    #80B918 (Lime)
Grid:       #64748B (Gray)
Nuclear:    #7209B7 (Purple)
Coal:       #495057 (Dark Gray)
Gas:        #F59E0B (Amber)
```

### Status Indicators

```css
.active { background: #00A86B; }
.pending { background: #F59E0B; }
.error { background: #EF4444; }
.info { background: #1A73E8; }
```

### Progress Bars

**Gradient:**
```css
background: linear-gradient(90deg, #00A86B 0%, #007A54 100%);
```

---

## 8. DARK MODE

### Dark Theme Colors

```
Background:      #0A111E (Navy)
Surface:         #1E293B (Charcoal)
Surface Elevated:#334155 (Dark Gray)
Border:          #475569 (Slate)
Text Primary:    #F8FAFC (Off White)
Text Secondary:  #94A3B8 (Light Gray)
Accent:          #00A86B (Emerald)
```

### Dark Mode Adjustments

- Reduce saturation of brand colors by 20%
- Increase contrast for accessibility
- Use subtle gradients instead of flat colors
- Add glow effects for interactive elements

---

## 9. APPLICATIONS

### Web Application

**Header:**
- Navy background (#0A111E)
- White ESUM logo
- Green accent for active states

**Dashboard:**
- Light gray background (#F8FAFC)
- White cards with subtle shadows
- Green primary actions

**Trading Interface:**
- Dark mode default for reduced eye strain
- High contrast for price displays
- Color-coded order book

### Print Materials

**Business Cards:**
- Navy background
- White logo
- Green accent stripe

**Letterhead:**
- White background
- Navy logo
- Green footer accent

**Presentations:**
- Navy title slides
- White content slides
- Green highlights

### Marketing

**Website:**
- Hero with gradient background
- Clean, modern layout
- Interactive data visualizations

**Social Media:**
- Consistent green/navy palette
- Data-driven content graphics
- ESG impact highlights

---

## 10. BRAND VOICE

### Tone

- **Professional** - Enterprise-grade credibility
- **Innovative** - Forward-thinking, tech-savvy
- **Trustworthy** - Secure, regulated, reliable
- **Clear** - Complex concepts made simple

### Messaging Pillars

1. **Market Leadership** - "World's first integrated energy + carbon marketplace"
2. **Technology** - "AI-driven decision support"
3. **Impact** - "Accelerating South Africa's energy transition"
4. **Trust** - "NERSA-compliant, enterprise-grade security"

### Taglines

**Primary:**
"Powering South Africa's Green Energy Future"

**Secondary:**
- "Trade Energy. Trade Carbon. Trade Smart."
- "The Open Energy Market"
- "Where Green Energy Meets Smart Trading"

---

## 11. BRAND ASSETS

### File Formats

**Logo:**
- SVG (primary)
- PNG (transparent background)
- EPS (print)
- PDF (vector)

**Colors:**
- ASE (Adobe Swatch Exchange)
- .clr (macOS)

**Fonts:**
- OTF (OpenType)
- WOFF2 (web)

### Asset Locations

```
/assets/
  /logo/
    esum-logo-primary.svg
    esum-logo-white.svg
    esum-logo-black.svg
    esum-icon.svg
  /fonts/
    Instrument-Serif-Bold.otf
    Outfit-Regular.otf
    Outfit-Medium.otf
    Outfit-SemiBold.otf
  /colors/
    esum-palette.ase
  /templates/
    presentation.pptx
    letterhead.docx
    business-card.ai
```

---

## 12. USAGE GUIDELINES

### Do's

✅ Use the primary green gradient logo on light backgrounds
✅ Maintain minimum clear space around the logo
✅ Use brand colors consistently across all touchpoints
✅ Ensure sufficient contrast for accessibility (WCAG AA)
✅ Use Instrument Serif for headlines, Outfit for body text

### Don'ts

❌ Don't stretch or distort the logo
❌ Don't change logo colors (except approved variations)
❌ Don't place logo on busy backgrounds
❌ Don't use outdated brand colors
❌ Don't mix with incompatible typefaces

---

## 13. CONTACT

For brand guidelines questions or asset requests:

**NXT Business Solutions**
Email: reshigan@gonxt.tech
Website: www.esum.energy

---

*Version 1.0 | March 2026 | CONFIDENTIAL*
