import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // The vendored design system is linted upstream.
    ignores: ["packages/design-system/**", ".next/**", "out/**", "qa/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Template covers are plain <img>: the static export has no image optimizer.
      "@next/next/no-img-element": "off",
      // Copy is full of apostrophes; React renders them safely.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
