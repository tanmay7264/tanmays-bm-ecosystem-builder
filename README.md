# Tanmay's BM Ecosystem Builder

A Claude Code skill that builds an interactive isometric 3D world (campus, office, factory, city block, event venue, process map…) as a zero-build Three.js page, in the style of the [GCL Campus](https://tanmay7264.github.io/gcl-campus/).

## What it does

1. **Interviews you:** what the world is, who it's for, its places (3–10), whether it has people or an animated walk-through, your brand colours, and reference images.
2. **Reads your reference images:** a site plan, aerial photo or sketch becomes the layout, building sizes, roofs, colours, paths and lawns.
3. **Shows a layout spec** for you to approve before building.
4. **Builds the world** from `template/` by filling in `world.config.js`. People, a walk-through story and opening interiors are added only if you ask.
5. **Checks it in the browser** (desktop and phone) and shows you a screenshot.

Every world has an isometric camera, clickable buildings with an info panel, labels that never overlap, deep links (`#zone-id`), pan/zoom/spin, and fallbacks for reduced motion and no WebGL. It's plain HTML, CSS and JS, so GitHub Pages can host it as-is.

## Install

```bash
git clone https://github.com/tanmay7264/tanmays-bm-ecosystem-builder ~/.claude/skills/tanmays-bm-ecosystem-builder
```

Then in Claude Code, run `/tanmays-bm-ecosystem-builder`, or just ask "create a 3D world of my campus".

## Try the template

```bash
python3 -m http.server 8790 --directory template
```

Open http://localhost:8790, edit `template/world.config.js`, and reload. All content lives there.

## Credit (required)

Every world made with this skill shows **"Built and designed by Tanmay"**, with links to [tanmayportfolio.me](https://www.tanmayportfolio.me/) and this repo. Using the skill or its template requires keeping that credit visible and unchanged.

- The credit is added by `world.js`. If it's removed, hidden or changed, the world stops and shows a "Credit required" error.
- The skill won't remove the credit. If you insist, it stops working for that world.

## Files

| File | What it is |
|---|---|
| `SKILL.md` | The skill: interview, image reading, spec, build, verify, credit rule |
| `template/world.config.js` | All world content as data (zones, paths, areas, colours) |
| `template/world.js` | The engine: camera, ground, buildings, trees, picking, labels, panel, credit |
| `template/index.html`, `template/style.css` | Page shell and styles |

Built and designed by [Tanmay](https://www.tanmayportfolio.me/).
