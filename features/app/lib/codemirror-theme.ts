import { tags as t } from '@lezer/highlight'
import { createTheme } from 'thememirror'

// Based on Ayu Light and ThemeMirror - using colorful Tailwind colors for light mode
export const lightTheme = createTheme({
  variant: 'light',
  settings: {
    background: '#FFFFFF',
    foreground: '#0F172A',
    caret: '#7c3aed', // violet-600
    selection: '#F1F5F9',
    gutterBackground: '#FFFFFF',
    gutterForeground: '#8a919966',
    lineHighlight: '#8a91991a',
  },
  styles: [
    {
      tag: t.comment,
      color: '#64748b', // slate-500 - muted gray
    },
    {
      tag: t.string,
      color: '#16a34a', // green-600 - vibrant green for strings
    },
    {
      tag: t.regexp,
      color: '#0891b2', // cyan-600 - cyan for regex
    },
    {
      tag: [t.number, t.bool, t.null],
      color: '#dc2626', // red-600 - red for numbers/booleans
    },
    {
      tag: t.variableName,
      color: '#475569', // slate-600 - darker gray for variables
    },
    {
      tag: [t.definitionKeyword, t.modifier],
      color: '#c026d3', // fuchsia-600 - bright pink for modifiers
    },
    {
      tag: [t.keyword, t.special(t.brace)],
      color: '#7c3aed', // violet-600 - purple for keywords
    },
    {
      tag: t.operator,
      color: '#ea580c', // orange-600 - orange for operators
    },
    {
      tag: t.separator,
      color: '#64748b', // slate-500
    },
    {
      tag: t.punctuation,
      color: '#64748b', // slate-500
    },
    {
      tag: [t.definition(t.propertyName), t.function(t.variableName)],
      color: '#0284c7', // sky-600 - blue for functions
    },
    {
      tag: [t.className, t.definition(t.typeName)],
      color: '#0891b2', // cyan-600 - cyan for class names
    },
    {
      tag: [t.tagName, t.typeName, t.self, t.labelName],
      color: '#0d9488', // teal-600 - teal for types
    },
    {
      tag: t.angleBracket,
      color: '#64748b', // slate-500
    },
    {
      tag: t.attributeName,
      color: '#ca8a04', // yellow-600 - yellow for attributes
    },
  ],
})

// Based on Cool Glow and ThemeMirror - updated to match shadcn/ui dark theme
export const darkTheme = createTheme({
  variant: 'dark',
  settings: {
    background: '#0a0a0a', // oklch(0.145 0 0) - shadcn dark background
    foreground: '#fafafa', // oklch(0.985 0 0) - shadcn dark foreground
    caret: '#fafafa',
    selection: '#27272a', // darker selection
    gutterBackground: '#0a0a0a',
    gutterForeground: '#71717a', // oklch(0.708 0 0) - muted foreground
    lineHighlight: '#18181b', // subtle line highlight
  },
  styles: [
    {
      tag: t.comment,
      color: '#71717a', // muted foreground
    },
    {
      tag: [t.string, t.special(t.brace), t.regexp],
      color: '#4ade80', // green-400 for strings
    },
    {
      tag: [
        t.className,
        t.definition(t.propertyName),
        t.function(t.variableName),
        t.function(t.definition(t.variableName)),
        t.definition(t.typeName),
      ],
      color: '#60a5fa', // blue-400 for functions/classes
    },
    {
      tag: [t.number, t.bool, t.null],
      color: '#f59e0b', // amber-500 for numbers
    },
    {
      tag: [t.keyword, t.operator],
      color: '#a78bfa', // violet-400 for keywords
    },
    {
      tag: [t.definitionKeyword, t.modifier],
      color: '#f472b6', // pink-400 for definition keywords
    },
    {
      tag: [t.variableName, t.self],
      color: '#fafafa', // foreground for variables
    },
    {
      tag: [t.angleBracket, t.tagName, t.typeName, t.propertyName],
      color: '#fb923c', // orange-400 for tags
    },
    {
      tag: t.derefOperator,
      color: '#fafafa',
    },
    {
      tag: t.attributeName,
      color: '#22d3ee', // cyan-400 for attributes
    },
  ],
})
