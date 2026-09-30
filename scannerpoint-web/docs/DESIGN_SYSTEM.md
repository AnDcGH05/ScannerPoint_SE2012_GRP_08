# ScannerPoint design system

Source of truth in code: `src/styles/theme.css`. Layouts follow the Stitch screens
("Calm Precision Workshop"), re-coloured to the palette below.

## Colour

| Token | Hex | Use |
|---|---|---|
| `--charcoal` | `#36454F` | Sidebar, top bar, landing canvas |
| `--charcoal-deep` | `#28333B` | Body text, dark buttons, active nav |
| `--beige` | `#F5F5DC` | App page background |
| `--orange` | `#FF6B35` | The one primary action per screen (text on it is charcoal) |
| `--white` | `#FFFFFF` | Cards |
| `--text-2` | `#5C6B73` | Secondary text |
| `--border` / `--border-strong` | `#D1D8DC` / `#B8C2C7` | Lines, input borders |
| `--success` | `#1F9D6B` | Completed, paid, passed, in stock |
| `--warning` | `#E8A317` | Pending, in progress, partial, low stock |
| `--danger` | `#D64545` | Failed, errors, deactivate |
| `--neutral` | `#64748B` | Cancelled, closed, inactive |

## Type

Plus Jakarta Sans (200–800), Inter as fallback.

- Landing headlines: weight 400, tight negative tracking, up to 104px.
- App page titles: 30px, weight 500. Greeting: weight 450.
- Eyebrow labels: 12px, weight 700, uppercase, `.12em` tracking.
- Numbers in tables and stats use tabular figures.

## Shape and elevation

Cards 16px radius, hairline border and a micro-shadow. Inputs 48px tall, 12px radius.
Badges and chips are pills.

## Motion

- Fade-up on scroll: 350ms, 60ms stagger (`Reveal`).
- Count-up on stats (`CountUp`).
- Pulsing orange ring on "Create Job Card" only.
- Triangle particle field on the landing hero and the auth brand panel only.
- The sidebar has a static triangle pattern at 7% opacity.
- Everything is off under `prefers-reduced-motion`.
