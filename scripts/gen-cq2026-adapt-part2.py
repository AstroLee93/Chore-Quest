"""Second half of the generated map: dark-first colourful panels & buttons."""
import sys

root = sys.argv[1]
S = 'html.cq2026.dark'
hues = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
        'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
semantic = {'green': 'var(--cq-done)', 'emerald': 'var(--cq-done)', 'lime': 'var(--cq-done)', 'teal': 'var(--cq-done)',
            'amber': 'var(--cq-due)', 'orange': 'var(--cq-due)', 'yellow': 'var(--cq-due)',
            'red': 'var(--cq-danger)', 'rose': 'var(--cq-danger)'}
accent_hues = ['blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'sky', 'cyan']
secondary_hues = ['amber', 'yellow', 'orange']
out = ['\n/* ── Generated (part 2): colourful dark-first panels, borders, text, buttons ── */']

# 1. Big gradient containers → surface (not buttons, not thin bars)
out.append(f'''{S} :is(div, section, header, aside)[class*="bg-gradient-to-"]:is([class*=" p-"], [class^="p-"], [class*=" px-"], [class*=" py-"]):not([class*=" h-1"]):not([class*=" h-2"]):not([class*=" h-3"]),
{S} :is(div, section, header, aside)[class*="bg-linear-to-"]:is([class*=" p-"], [class^="p-"]) {{
  background-image: none;
  background-color: var(--cq-surface);
  border-color: var(--cq-line);
  box-shadow: none;
}}''')

# 2. Dark tinted panels → surfaces
deep = ',\n'.join(f'{S} :is(div, section, header, aside, li)[class*="dark:bg-{h}-9"]' for h in hues)
out.append(deep + ' { background-color: var(--cq-surface); background-image: none; }')
mid = ',\n'.join(f'{S} :is(div, section, header, aside, li)[class*="dark:bg-{h}-8"]' for h in hues)
out.append(mid + ' { background-color: var(--cq-surface-2); background-image: none; }')
# light-tint panels whose dark variant is a translucent hue
plain = ',\n'.join(f'{S} :is(div, section, nav)[class*="bg-{h}-200"], {S} :is(div, section, nav)[class*="bg-{h}-100"]' for h in secondary_hues)
out.append(plain + ' { background-color: var(--cq-surface-2); }')

# 3. Coloured container borders → hairline
b = ',\n'.join(f'{S} :is(div, section, aside, li, header)[class*="border-{h}-"]' for h in hues)
out.append(b + ' { border-color: var(--cq-line); }')

# 4. Light coloured text (dark-first designs) → label tones / semantic
for h in hues:
    cls = ', '.join(f'{S} [class*="text-{h}-{n}"]:not(button):not([class*="bg-{h}-"])' for n in (100, 200, 300))
    colour = semantic.get(h, 'var(--cq-label)')
    if h in ('amber', 'yellow', 'orange'):
        colour = 'var(--cq-label)'  # headings were often amber/yellow on dark
    out.append(f'{cls} {{ color: {colour}; }}')
for h in hues:
    if h in semantic:
        continue
    cls = ', '.join(f'{S} [class*="text-{h}-{n}"]:not(button):not(button *)' for n in (400, 500))
    out.append(f'{cls} {{ color: var(--cq-label-2); }}')

# 5. Buttons by role
acc = ',\n'.join(
    f'{S} :is(button, a):is([class*=" bg-{h}-5"], [class*=" bg-{h}-6"], [class^="bg-{h}-5"], [class^="bg-{h}-6"], [class*="from-{h}-"])' for h in accent_hues)
out.append(acc + ''' {
  background: var(--cq-accent);
  background-image: none;
  color: var(--cq-on-accent);
  border-color: transparent;
  box-shadow: none;
}''')
sec = ',\n'.join(
    f'{S} :is(button, a):is([class*=" bg-{h}-4"], [class*=" bg-{h}-5"], [class^="bg-{h}-4"], [class*="from-{h}-"])' for h in secondary_hues)
out.append(sec + ''' {
  background: var(--cq-surface-2);
  background-image: none;
  color: var(--cq-label);
  border: 1px solid var(--cq-line);
  box-shadow: none;
}''')
out.append(f'''{S} :is(button, a):is([class*="from-"], [class*=" bg-"]) :is(svg, span) {{ color: inherit; }}''')

p = root + '/src/styles/cq2026-adapt.css'
s = open(p).read()
marker = '\n/* ── Generated (part 2)'
if marker in s:
    s = s[:s.index(marker)]
open(p, 'w').write(s + '\n\n'.join(out) + '\n')
print('ok')
