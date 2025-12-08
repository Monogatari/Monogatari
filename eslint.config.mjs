import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import cypress from 'eslint-plugin-cypress';
import globals from 'globals';

export default [
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: [
			'lib/**/*',
			'dist/**/*',
			'**/*.min.js',
			'.yarn/**/*',
			'.pnp.loader.mjs',
			'.pnp.cjs',
		],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				project: ['tsconfig.json'],
			},
		},
	},
	{
		files: ['**/*.js', '**/*.ts'],
		plugins: {
			cypress,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				Bun: 'readonly',
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
		},
	},
];
