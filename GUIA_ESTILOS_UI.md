# 🎨 PROMPT HUB - Guía de Estilos UI

## Tema: Cyber AI (Dark Mode)

---

## 1. 🎨 PALETA DE COLORES

### Fondos Principales
| Uso | Color | HEX | Clase Tailwind |
|-----|-------|-----|----------------|
| Body/Fondo principal | Slate 900 | `#0f172a` | `bg-slate-900` |
| Cards/Paneles | Slate 800 | `#1e293b` | `bg-slate-800` |
| Inputs/Modales | Slate 950 | `#020617` | `bg-slate-950` |
| Sección alternativa | Slate 800/30 | Semi-transparente | `bg-slate-800/30` |

### Bordes
| Uso | Color | HEX | Clase Tailwind |
|-----|-------|-----|----------------|
| Bordes normales | Slate 700 | `#334155` | `border-slate-700` |
| Bordes hover | Indigo 500 | `#6366f1` | `border-indigo-500` |

### Colores de Marca (Acento)
| Rol | Color | HEX | Clase Tailwind |
|-----|-------|-----|----------------|
| **Primario** | Indigo 500 | `#6366f1` | `bg-indigo-500` |
| Primario hover | Indigo 400 | `#818cf8` | `bg-indigo-400` |
| Secundario | Violet 500 | `#8b5cf6` | `bg-violet-500` |
| Acento | Teal 400/500 | `#2dd4bf` | `bg-teal-500` |

### Gradientes
| Uso | Gradiente |
|-----|-----------|
| Logo/Hero | `from-indigo-400 via-violet-400 to-teal-400` |
| Avatar usuario | `from-teal-400 to-indigo-500` |
| Icono sidebar | `from-indigo-500 to-violet-600` |

---

## 2. 🔠 TIPOGRAFÍA

### Familias
| Tipo | Fuente | Clase |
|------|--------|-------|
| **Sans (Principal)** | Inter | `font-sans` |
| **Mono (Código)** | JetBrains Mono | `font-mono` |

### Tamaños de Texto
| Elemento | Tamaño | Peso | Clase |
|----------|--------|------|-------|
| Título H1 (Hero) | 4xl-6xl | 800 (Extra Bold) | `text-4xl lg:text-6xl font-extrabold` |
| Título H2 (Sección) | 3xl-4xl | 700 (Bold) | `text-3xl sm:text-4xl font-bold` |
| Título H3 (Card) | xl | 700 (Bold) | `text-xl font-bold` |
| Título página | 2xl-3xl | 700 (Bold) | `text-2xl lg:text-3xl font-bold` |
| Texto normal | base/lg | 400 | `text-base` o `text-lg` |
| Texto secundario | sm | 400 | `text-sm` |
| Labels pequeños | xs | 500 | `text-xs font-medium` |
| Badge/Pill | [10px] | 500 | `text-[10px] font-medium` |

### Colores de Texto
| Uso | Color | Clase |
|-----|-------|-------|
| Títulos/Principal | Slate 100 | `text-slate-100` |
| Cuerpo | Slate 200 | `text-slate-200` |
| Secundario | Slate 400 | `text-slate-400` |
| Terciario/Muted | Slate 500 | `text-slate-500` |
| Link/Acento | Indigo 400 | `text-indigo-400` |

---

## 3. 🔘 BOTONES

### Primario (CTA)
```
bg-indigo-500 hover:bg-indigo-400 text-white font-semibold
px-8 py-4 rounded-xl
shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
```

### Secundario (Outline)
```
bg-slate-800 border border-slate-700 text-slate-300
hover:bg-slate-700 
px-4 py-2 rounded-xl
```

### Ghost/Link
```
text-indigo-400 hover:text-indigo-300 font-medium
```

### Danger (Logout)
```
text-slate-500 hover:text-red-400
```

---

## 4. 📦 CARDS

### Card de Prompt (220-260px altura)
```
rounded-xl border border-slate-700 bg-slate-800
hover:border-[AI_COLOR] hover:shadow-lg
h-[220px] o h-[260px]
```

#### Header de Card (fondo de IA)
- Altura: `h-[88px]`
- Fondo: Color de IA correspondiente
- Icono: `w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl`
- Badge IA: `px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px]`

#### Body de Card
- Padding: `p-4`
- Fuente: `font-mono`
- Altura: `h-[132px]` o `h-[162px]`

### Folder Card (Features/Carpetas)
```
folder-card group
hover: translateY(-4px) + shadow
```

---

## 5. 🤖 COLORES POR IA

| IA | Background | Border | Texto | HEX |
|----|------------|--------|-------|-----|
| **ChatGPT** | `bg-emerald-500` | `border-emerald-500` | `text-emerald-400` | `#10b981` |
| **Claude** | `bg-orange-500` | `border-orange-500` | `text-orange-400` | `#f97316` |
| **Gemini** | `bg-blue-500` | `border-blue-500` | `text-blue-400` | `#3b82f6` |
| **MidJourney** | `bg-indigo-500` | `border-indigo-500` | `text-indigo-400` | `#6366f1` |
| **DALL-E** | `bg-teal-500` | `border-teal-500` | `text-teal-400` | `#14b8a6` |
| **DeepSeek** | `bg-violet-500` | `border-violet-500` | `text-violet-400` | `#8b5cf6` |
| **Stable Diffusion** | `bg-purple-600` | `border-purple-600` | `text-purple-400` | `#9333ea` |
| **Grok** | `bg-gray-900` | `border-gray-900` | `text-gray-400` | `#111827` |
| **Copilot** | `bg-sky-600` | `border-sky-600` | `text-sky-400` | `#0284c7` |
| **Default** | `bg-slate-600` | `border-slate-600` | `text-slate-400` | `#475569` |

---

## 6. 📐 SIDEBAR

- **Ancho expandido**: `w-64` (256px)
- **Ancho colapsado**: `w-20` (80px = 5rem)
- **Fondo**: `bg-slate-800`
- **Borde**: `border-r border-slate-700`
- **Z-index**: `z-40`

### Links de Navegación
```
flex items-center gap-3 px-3 py-3 rounded-xl
text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400

# Activo:
bg-slate-700/50 text-indigo-400
```

### User Section
- Avatar: `w-10 h-10 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-full`
- Container: `p-3 rounded-xl bg-slate-900/50`

---

## 7. 🧭 NAVBAR (Público)

- **Posición**: `fixed top-0 z-50`
- **Fondo**: `bg-slate-900/80 backdrop-blur-md`
- **Borde**: `border-b border-slate-700`
- **Altura**: `h-20` (~80px, `pt-20` en body)

---

## 8. 📝 INPUTS

```
w-full bg-slate-950 border border-slate-700 rounded-xl
px-4 py-3 text-slate-200 placeholder-slate-500
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
```

---

## 9. 🏷️ BADGES/PILLS

### Filtros de Categoría
```
# Inactivo
bg-slate-800 border border-slate-700 text-slate-300
px-5 py-2.5 rounded-full text-sm font-medium

# Activo
bg-indigo-500 text-white
px-5 py-2.5 rounded-full text-sm font-medium
```

### Badge Público
```
bg-teal-500 rounded-full text-[10px] text-white font-medium
px-2 py-0.5
```

---

## 10. 🌈 HEADING COLORES (Editor)

| Heading | Color | Clase |
|---------|-------|-------|
| H1 | Verde | `#10b981` (emerald-500) |
| H2 | Amarillo | `#facc15` (yellow-400) |
| H3 | Rosa/Rojo | `#fb7185` (rose-400) |

---

## 11. 📏 ESPACIADOS

| Uso | Valor | Clase |
|-----|-------|-------|
| Padding página | 24-32px | `p-6 lg:p-8` |
| Gap entre cards | 24px | `gap-6` |
| Margin secciones | 32px | `mb-8` |
| Border radius cards | 12px | `rounded-xl` |
| Border radius botones | 12px | `rounded-xl` |
| Border radius pills | Full | `rounded-full` |

---

## 12. 📱 BREAKPOINTS

| Nombre | Ancho |
|--------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

---

## 13. ✨ EFECTOS

### Hover Cards
- Transform: `translateY(-4px)`
- Shadow: `0 20px 40px -12px rgba(0, 0, 0, 0.4)`

### Glassmorphism
- Fondo: `bg-white/20 backdrop-blur-sm`
- O: `bg-black/20 backdrop-blur-sm`

### Glow Effect (Hero)
```css
animation: pulse-glow 4s ease-in-out infinite alternate;
```

### Selection
- Color: `rgba(99, 102, 241, 0.3)` (Indigo con opacidad)
