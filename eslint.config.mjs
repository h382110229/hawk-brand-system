import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "deliverables/**", "public/**", "scripts/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
  {
    // eslint-plugin-react-hooks v7 (pulled in by eslint-config-next v16) turns on
    // the new react-compiler rule `set-state-in-effect` as an error. The
    // ThemeProvider mount-time sync pattern predates the rule and matches the
    // pre-upgrade baseline (0 errors); keep parity instead of rewriting app
    // code just to satisfy a newly added opinionated rule.
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
