/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        sheet: 'rgb(var(--sheet) / <alpha-value>)',
        'sheet-2': 'rgb(var(--sheet-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--ink-3) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        teal: 'rgb(var(--teal) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        bar: 'rgb(var(--bar) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        pane: '0 0 0 1px rgb(24 21 17 / 0.07), 0 1px 2px -1px rgb(24 21 17 / 0.08), 0 12px 32px -18px rgb(24 21 17 / 0.35)',
        lift: '0 0 0 1px rgb(24 21 17 / 0.07), 0 8px 24px -10px rgb(24 21 17 / 0.28), 0 24px 60px -32px rgb(24 21 17 / 0.4)',
        page: '0 1px 1px rgb(24 21 17 / 0.12), 0 12px 28px -14px rgb(24 21 17 / 0.35)',
        pop: '0 0 0 1px rgb(24 21 17 / 0.08), 0 12px 32px -8px rgb(24 21 17 / 0.3), 0 32px 64px -24px rgb(24 21 17 / 0.35)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
};
