# Design Tokens — Hub Conexão

Referência rápida de cores e tipografia para geração de materiais visuais (páginas HTML, banners, e-mails).

---

## Paleta Principal

| Token | Hex | Uso |
|-------|-----|-----|
| **Marinho (Background)** | `#0f172a` | Fundo principal, áreas escuras |
| **Marinho Superfície** | `#1e293b` | Cards, painéis, inputs |
| **Marinho Hover** | `#334155` | Estados hover, bordas sutis |
| **Dourado (Accent)** | `#c9a655` | Botões primários, ícones, destaques |
| **Dourado Hover** | `#d4b366` | Estado hover do accent |
| **Dourado Claro** | `#e8d48b` | Gradientes, brilhos |
| **Dourado Escuro** | `#a8873a` | Gradientes, sombras douradas |

## Texto

| Token | Hex | Uso |
|-------|-----|-----|
| **Principal** | `#f8fafc` | Títulos, corpo de texto |
| **Secundário** | `#94a3b8` | Legendas, placeholders |
| **Invertido** | `#0f172a` | Texto sobre botões dourados |

## Feedback

| Token | Hex | Uso |
|-------|-----|-----|
| **Sucesso** | `#22c55e` | Confirmações, status ativo |
| **Alerta** | `#eab308` | Avisos, pendências |
| **Erro** | `#ef4444` | Erros, ações destrutivas |

## Gradiente Padrão

```css
background: linear-gradient(135deg, #c9a655, #e8d48b, #a8873a);
```

## Tipografia

| Elemento | Font | Peso | Tamanho |
|----------|------|------|---------|
| Títulos (H1) | System sans-serif | 700 (Bold) | 2rem+ |
| Subtítulos (H2/H3) | System sans-serif | 600 (Semibold) | 1.25–1.5rem |
| Corpo | System sans-serif | 400 (Regular) | 0.875–1rem |
| Labels/Captions | System sans-serif | 500 (Medium) | 0.75rem |

## Efeitos

- **Border radius:** `0.5rem` (padrão), `0.75rem` (cards), `9999px` (badges/pills)
- **Glass effect:** `backdrop-filter: blur(20px) saturate(180%)`
- **Sombra padrão:** `0 8px 32px rgba(0, 0, 0, 0.3)`
- **Sombra dourada:** `0 4px 20px rgba(201, 166, 85, 0.15)`

## Exemplo HTML

```html
<body style="background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif;">
  <div style="background: #1e293b; border-radius: 0.75rem; padding: 2rem; border: 1px solid rgba(201,166,85,0.2);">
    <h1 style="color: #c9a655;">Título Dourado</h1>
    <p style="color: #94a3b8;">Texto secundário</p>
    <button style="background: #c9a655; color: #0f172a; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;">
      Ação Principal
    </button>
  </div>
</body>
```
