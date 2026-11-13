"""Generate the global legacy-colour → 2026-theme map (dark 2026 themes)."""
import sys

root = sys.argv[1]
colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green',
          'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
neutral = {'slate', 'gray', 'zinc', 'neutral', 'stone'}
semantic = {
    'green': 'var(--cq-done)', 'emerald': 'var(--cq-done)', 'lime': 'var(--cq-done)', 'teal': 'var(--cq-done)',
    'amber': 'var(--cq-due)', 'orange': 'var(--cq-due)', 'yellow': 'var(--cq-due)',
    'red': 'var(--cq-danger)', 'rose': 'var(--cq-danger)',
}

S = 'html.cq2026.dark'


def sel(classes, guard):
    return ',\n'.join(f'{S} .{c}:not([class*="{guard}"])' for c in classes)


out = ['/* ── Generated: legacy light-only colours → theme roles (dark 2026 themes) ──',
       '   Only touches elements with no dark: style of their own. Do not edit by hand;',
       '   regenerate with the script noted in docs/design-2026/README.md. */']

# Backgrounds
surface = ['bg-white', 'bg-yellow-50', 'bg-amber-50', 'bg-slate-50', 'bg-gray-50', 'bg-white\\/80', 'bg-white\\/90', 'bg-white\\/95']
out.append(sel(surface, 'dark:bg-') + ' { background-color: var(--cq-surface); }')
tints = [f'bg-{c}-{n}' for c in colors for n in (50, 100, 200) if f'bg-{c}-{n}' not in surface]
out.append(sel(tints, 'dark:bg-') + ' { background-color: var(--cq-surface-2); }')

# Text: strong shades → label (neutral) or semantic colour
strong = [f'text-{c}-{n}' for c in colors for n in (700, 800, 900, 950) if c in neutral or c not in semantic]
out.append(sel(strong + ['text-black'], 'dark:text-') + ' { color: var(--cq-label); }')
for c, var in semantic.items():
    cls = [f'text-{c}-{n}' for n in (500, 600, 700, 800, 900, 950)]
    out.append(sel(cls, 'dark:text-') + f' {{ color: {var}; }}')
mid = [f'text-{c}-{n}' for c in colors if c not in semantic for n in (400, 500, 600)]
out.append(sel(mid, 'dark:text-') + ' { color: var(--cq-label-2); }')

# Borders: pale shades → hairline
borders = [f'border-{c}-{n}' for c in colors for n in (100, 200, 300, 400)]
out.append(sel(borders, 'dark:border-') + ' { border-color: var(--cq-line); }')

# Light-only sheets follow the theme on 2026 themes
out.append(f'''html.cq2026 .ios-sheet-light {{
  --sheet-bg: var(--cq-surface);
  --label: var(--cq-label);
  --label-secondary: var(--cq-label-2);
  --label-tertiary: var(--cq-label-3);
  --separator: var(--cq-line);
  color: var(--cq-label);
  color-scheme: inherit;
}}''')

p = root + '/src/styles/cq2026-adapt.css'
open(p, 'w').write('\n\n'.join(out) + '\n')

# Import it after cq2026.css
ip = root + '/src/index.css'
s = open(ip).read()
if 'cq2026-adapt.css' not in s:
    s = s.replace('@import "./styles/cq2026.css";', '@import "./styles/cq2026.css";\n@import "./styles/cq2026-adapt.css";', 1)
# Light islands only on older themes
old = '@custom-variant dark (&:where(.dark, .dark *):not(:where(.ios-sheet-light, .ios-sheet-light *)));'
new = '@custom-variant dark (&:where(.dark, .dark *):not(:where(html:not(.cq2026) .ios-sheet-light, html:not(.cq2026) .ios-sheet-light *)));'
assert old in s
s = s.replace(old, new, 1)
open(ip, 'w').write(s)

# Remove the earlier "islands stay white" override in cq2026.css
cp = root + '/src/styles/cq2026.css'
c = open(cp).read()
c = c.replace('''/* Light-sheet "islands" keep their own light tokens */
html.cq2026 .ios-sheet-light { --sheet-bg: #FFFFFF; --cq-surface: #FFFFFF; --cq-line: #E6E1D8; }
''', '')
open(cp, 'w').write(c)
print('lines', sum(x.count('\n') for x in out))
