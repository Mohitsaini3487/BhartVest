// CommonJS PostCSS config wrapper used by Turbopack/Next.js
// Keep minimal and explicit so Turbopack can statically read the exports.
module.exports = {
  plugins: {
    tailwindcss: {},
    // autoprefixer is optional but recommended for production builds.
  },
};
