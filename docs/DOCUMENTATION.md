# AFRICA YOUTH ALIVE PROJECT — Documentation

This document explains the project structure, how to customize styles, add assets, and enable optional features (carousel, newsletter, icons).

## Project structure
- `index.html`, `about.html`, `programs.html`, etc. — Public HTML pages
- `css/sopot.css` — Theme and responsive utilities (loads fonts and base UI)
- `css/styles.css` — Project-specific styles and overrides
- `js/main.js` — Interaction scripts (hero, modal, newsletter, dynamic vendor loader)
- `assets/` — placeholder folders: `images/`, `videos/`, `icons/`
- `docs/DOCUMENTATION.md` — This file

## Fonts
- The site uses `Rubik` and `Fira Sans` loaded via `css/sopot.css`.
- To change fonts, edit the `@import` at the top of `css/sopot.css`.

## Icons
- FontAwesome is imported globally via `css/sopot.css`.
- Flaticons placeholders are under `assets/icons/flaticons/` — drop SVG files there and reference them with the `.flaticon` helper classes.

## Carousel (Owl Carousel)
- Owl Carousel JS and CSS are loaded dynamically by `js/main.js` when a page contains an element with class `owl-carousel`.
- To add a carousel, add markup like:

```html
<div class="owl-carousel">
  <div><img src="/assets/images/photo1.jpg" alt="..."></div>
  <div><img src="/assets/images/photo2.jpg" alt="..."></div>
</div>
```

- No manual script tags are needed; the loader will fetch jQuery and Owl from CDNs and initialize the carousel.

## Newsletter (Formspree)
- Footer newsletter forms use `name="email"` and have `data-formspree="YOUR_FORM_ID"`.
- To enable live submissions, sign up on Formspree, then replace `YOUR_FORM_ID` with the form ID. `js/main.js` will post to the Formspree endpoint and fall back to `localStorage` if offline.

## Accessibility & SEO
- Use semantic tags (`<main>`, `<header>`, `<nav>`, `<section>`, `<footer>`).
- Always add descriptive `alt` text to images and `aria-label` where appropriate.
- Title, meta description, and open graph tags can be added per page in the `<head>` for SEO.

## W3C Validation
- Pages start from valid HTML5 doctype. Run your pages through the W3C validator (https://validator.w3.org/) after replacing placeholder content.

## Customization
- Colors and spacing are defined in CSS variables inside `css/sopot.css`. Edit those to change the theme.
- Use the `.row` / `.col` utilities for responsive layouts.

## Development / Local test
- Serve the folder locally (Python or `npx http-server`) and open `http://localhost:8000`.

## Support
- This project includes basic, free quick support: open an issue or request changes and I'll help update the repo.

---

For any specific customization or adding your real assets, tell me which page and image/video to replace and I will update it.