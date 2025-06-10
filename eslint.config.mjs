import cypress from "eslint-plugin-cypress";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
	...compat.extends("eslint:recommended"),
	{
		ignores: [
			"./lib/vendor/**/*",
			"**/*.min.js"
		]
	},
	{
		files: [
			"**/*.js"
		],

		plugins: {
			cypress,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...cypress.environments.globals.globals,
			},

			ecmaVersion: "latest",
			sourceType: "module",
		},

		rules: {
			"dot-notation": [2],

			indent: [2, "tab", {
				SwitchCase: 1,
				ObjectExpression: "first",
			}],

			quotes: [2, "single"],
			"linebreak-style": [2, "unix"],

			"no-console": [2, {
				allow: ["warn", "error"],
			}],

			"no-eq-null": [2],
			"no-eval": [2],
			"no-implied-eval": [2],

			"no-redeclare": [2, {
				builtinGlobals: true,
			}],

			"one-var": [2, "never"],
			"prefer-const": [2],
			semi: [2, "always"],

			"keyword-spacing": [2, {
				before: true,
				after: true,

				overrides: {
					if: {
						before: false,
					},

					for: {
						before: false,
					},

					while: {
						before: false,
					},
				},
			}],

			"space-before-blocks": [2, "always"],
			"space-before-function-paren": [2, "always"],
			strict: [0, "global"],

			"no-unused-vars": [1, {
				args: "after-used",
			}],
		},
	}
];