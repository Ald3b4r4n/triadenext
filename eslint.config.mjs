import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".agents/**",
      ".amazonq/**",
      ".claude/**",
      ".codex/**",
      ".github/hooks/**",
      ".github/skills/**",
      ".kiro/**",
      ".next/**",
      "drizzle/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**"
    ]
  }
];

export default eslintConfig;
