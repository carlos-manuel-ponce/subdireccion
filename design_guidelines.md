# Design Guidelines: Creaciones Management Platform

## Design Approach
**System**: Material Design with institutional customization for government/educational administration
**Rationale**: Utility-focused data management platform requiring clarity, efficiency, and professional credibility

## Core Design Elements

### Typography
- **Primary Font**: Roboto (Google Fonts)
- **Headings**: Roboto Medium (500) - 24px (h1), 20px (h2), 16px (h3)
- **Body**: Roboto Regular (400) - 14px
- **Table Text**: Roboto Regular - 13px
- **Footer**: Roboto Regular - 12px

### Color Palette
- **Primary Dark Blue**: #1e3a8a (headers, primary actions)
- **Secondary Gray**: #6b7280 (secondary text, borders)
- **Background White**: #ffffff (main content area)
- **Light Gray**: #f3f4f6 (alternating table rows, input backgrounds)
- **Accent Blue**: #3b82f6 (interactive elements, links)
- **Status Indicators**: Success #10b981, Warning #f59e0b, Error #ef4444

### Layout System
**Spacing Units**: Tailwind scale - primarily use 2, 4, 6, 8, 12, 16 for consistency
- Container: max-w-7xl, centered with px-6
- Section spacing: py-8
- Component spacing: p-4, gap-4
- Table cells: px-4 py-3

## Component Structure

### Header Section
- Full-width dark blue background (#1e3a8a)
- Two-line title layout:
  - Line 1: "CREACIONES" (24px, bold, white)
  - Line 2: "SUBDIRECCIÓN COBERTURA DE CARGOS" (16px, regular, white with 80% opacity)
- Padding: py-6 px-6
- Optional: Small institutional logo/badge on left

### Statistics Counters
- Grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile
- Each counter card:
  - White background, subtle shadow
  - Large number (32px, bold, dark blue)
  - Label below (14px, gray)
  - Icon above number (from Material Icons)
  - Padding: p-6, rounded corners
- Gap between cards: gap-4
- Examples: "Total Expedientes", "En Proceso", "Pendientes", "Aprobados"

### Action Bar
- Flexbox row with space between items
- Left: "Agregar Nuevo" button (primary blue, white text, px-6 py-2.5, rounded, medium weight)
- Right side group:
  - Search input (w-80, placeholder "Buscar expediente...", gray border)
  - Filter button (outlined style, icon + "Filtros" text)
- Margin: my-6

### Filters Panel
- Collapsible section below action bar (hidden by default)
- Grid: 3-4 columns for filter dropdowns
- Filters include:
  - Estado (dropdown with all nomenclator values)
  - Tipo de Solicitud (dropdown)
  - Establecimiento (text input with autocomplete)
  - Fecha range pickers
- Apply/Clear buttons at end

### Main Table
- Full-width responsive table with fixed header
- Columns (in order):
  1. **Expediente** (120px) - Format: 1234567/26
  2. **Solicita** (280px) - Dropdown showing solicitud type
  3. **Establecimiento** (200px) - Text + number
  4. **Estado** (140px) - Badge style with status color
  5. **Comentario** (flexible width) - Truncated text with tooltip on hover
  6. **Acciones** (100px) - Icon buttons (Edit, Delete)

- Header row: Dark blue background, white text, font-weight medium, sticky positioning
- Data rows: Alternating white/#f3f4f6, hover state (#e5e7eb)
- Borders: 1px solid #e5e7eb
- Cell padding: px-4 py-3
- Row height: min-h-[52px]

### Table Interactions
- Estado column: Colored badge pills (rounded-full, px-3 py-1, text-xs)
- Comentario: Show first 50 chars, "..." with hover tooltip for full text
- Action icons: Subtle gray, transition to blue on hover
- Sortable columns: Arrow indicator in header

### Pagination
- Below table: Flexbox row with space between
- Left: "Mostrando 1-20 de 156 registros"
- Right: Page numbers + Previous/Next buttons
- Active page: Blue background, white text
- Inactive: Gray text, hover state

### Footer
- Full-width light gray background (#f3f4f6)
- Centered text: "Desarrollado por Dirección Gestión Educativa"
- Small text (12px), medium gray color
- Padding: py-4

## Data Display Patterns

### Estado Badges
Color-coded by category (use first 4-5 as examples):
- INICIAL: Blue (#3b82f6)
- SECUNDARIO: Purple (#8b5cf6)
- OBLIGATORIA: Green (#10b981)
- LIQUIDACIONES: Orange (#f59e0b)
- Others: Varied professional palette

### Dropdown Selects
- Styled Material Design inputs
- Full solicitud nomenclator in "Tipo de Solicitud" dropdown
- Searchable dropdown for long lists
- Border: gray, focus: blue accent

## Responsive Behavior
- Desktop (>1024px): Full table, 4-column counter grid
- Tablet (768-1023px): Horizontal scroll for table, 2-column counters
- Mobile (<768px): Card-based table view (stack columns vertically), single column counters

## No Images Required
This is a data-centric administrative platform - no hero images or decorative photography needed.

## Accessibility
- High contrast ratios (WCAG AA minimum)
- Keyboard navigation for all interactive elements
- ARIA labels for icon-only buttons
- Focus visible states on all form inputs