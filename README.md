# Tanmay's BM Ecosystem Builder

A Claude Code skill that builds an interactive isometric 3D world (campus, office, factory, city block, process map…) as a zero-build Three.js page, in the style of the [GCL Campus](https://tanmay7264.github.io/gcl-campus/).

It interviews you, reads your reference images (site plan, aerial photo, sketch), shows a layout spec for approval, builds the world from `template/`, and checks it in the browser.

## Install

```bash
git clone https://github.com/tanmay7264/tanmays-bm-ecosystem-builder ~/.claude/skills/tanmays-bm-ecosystem-builder
```

Then in Claude Code: `/tanmays-bm-ecosystem-builder`, or just ask "create a 3D world of my campus".

## Try the template

```bash
python3 -m http.server 8790 --directory template
```

Edit `template/world.config.js` and reload. All content lives there.

Designed and built by [Tanmay](https://www.tanmayportfolio.me/).
