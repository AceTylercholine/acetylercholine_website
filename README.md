# acetylercholine_website

Built with [Eleventy](https://www.11ty.dev/) and deployed by Netlify (settings in `netlify.toml`).

- Pages that share the navbar/footer are `.njk` files (`index.njk`, `about/`, `blog/`, `404/`); the shared parts live in `_includes/`.
- Every other file is copied to the site unchanged.
- Preview locally: `npm install`, then `npm start` (http://localhost:8080). Build: `npm run build` (output in `_site/`).
