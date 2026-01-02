import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
    {
        rules: {
            // Disable strict purity checks - allow impure functions like Math.random()
            "react-hooks/purity": "off",
            // Disable setState in effect warning - allow it when needed
            "react-hooks/set-state-in-effect": "off",
            // Make other rules less strict or off
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "react/no-unescaped-entities": "off", // Turn off unescaped entities warning
        },
    },
])

export default eslintConfig
