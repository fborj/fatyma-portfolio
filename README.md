# Developer Portfolio

A single-file static portfolio built with HTML, CSS and JavaScript.

## Preview locally

1. Open this folder in VS Code.
2. Install the **Live Server** extension.
3. Open `index.html`.
4. Click **Go Live** in the VS Code status bar.

Live Server is for local preview only.

## Customize

Edit the `C` and `P` objects near the bottom of `index.html`:

- `C` contains name, role, bio, skills, photos, email and links.
- `P` contains project cards and project detail pages.
- Put photo and project screenshot files in this folder or an `assets` folder.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html` and all image folders to the repository root.
3. In GitHub, open **Settings** → **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions** or **Deploy from a branch**.
5. For branch deployment, select `main` and `/ (root)`, then save.
6. Open the Pages URL shown in GitHub.

The existing hash navigation works on GitHub Pages without extra routing files.

## Before launch

Replace every placeholder project and the `you@example.com` address. Add real photo, project, resume and social links. Keep the external Google Fonts and GSAP links, or remove them and use local assets.
