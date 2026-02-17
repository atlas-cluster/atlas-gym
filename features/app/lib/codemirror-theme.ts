import { tags as t } from '@lezer/highlight'
import { createTheme } from 'thememirror'

// Based on Ayu Light and ThemeMirror - using shadcn/ui colors
export const lightTheme = createTheme({
  variant: 'light',
  settings: {
    background: '#FFFFFF',
    foreground: '#0F172A',
    caret: '#ffaa33',
    selection: '#F1F5F9',
    gutterBackground: '#FFFFFF',
    gutterForeground: '#8a919966',
    lineHighlight: '#8a91991a',
  },
  styles: [
    {
      tag: t.comment,
      color: '#787b8099',
    },
    {
      tag: t.string,
      color: '#86b300',
    },
    {
      tag: t.regexp,
      color: '#4cbf99',
    },
    {
      tag: [t.number, t.bool, t.null],
      color: '#ffaa33',
    },
    {
      tag: t.variableName,
      color: '#5c6166',
    },
    {
      tag: [t.definitionKeyword, t.modifier],
      color: '#fa8d3e',
    },
    {
      tag: [t.keyword, t.special(t.brace)],
      color: '#fa8d3e',
    },
    {
      tag: t.operator,
      color: '#ed9366',
    },
    {
      tag: t.separator,
      color: '#5c6166b3',
    },
    {
      tag: t.punctuation,
      color: '#5c6166',
    },
    {
      tag: [t.definition(t.propertyName), t.function(t.variableName)],
      color: '#f2ae49',
    },
    {
      tag: [t.className, t.definition(t.typeName)],
      color: '#22a4e6',
    },
    {
      tag: [t.tagName, t.typeName, t.self, t.labelName],
      color: '#55b4d4',
    },
    {
      tag: t.angleBracket,
      color: '#55b4d480',
    },
    {
      tag: t.attributeName,
      color: '#f2ae49',
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
