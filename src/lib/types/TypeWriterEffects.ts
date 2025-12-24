/**
 * TypeWriter Text Effect Types
 * ============================================================================
 * This module exports type definitions for TypeWriter text effects.
 * Effects are used in dialogue via the syntax: {/effect}text{/effect}
 */

/**
 * Shake effect variants for trembling/vibrating text
 */
export type ShakeEffect =
	| 'shake'
	| 'shake-hard'
	| 'shake-slow'
	| 'shake-little'
	| 'shake-horizontal'
	| 'shake-vertical';

/**
 * Wave effect variants for bouncing/flowing text
 */
export type WaveEffect =
	| 'wave'
	| 'wave-slow'
	| 'wave-fast';

/**
 * Fade/Scale reveal variations for character appearance
 */
export type RevealEffect =
	| 'fade'
	| 'fade-slow'
	| 'blur'
	| 'scale'
	| 'scale-bounce'
	| 'slide-up'
	| 'slide-down';

/**
 * Glitch effects for digital/horror aesthetics
 */
export type GlitchEffect =
	| 'glitch'
	| 'glitch-hard'
	| 'glitch-slow';

/**
 * Emphasis markers for text styling
 */
export type EmphasisEffect =
	| 'bold'
	| 'italic'
	| 'big'
	| 'small'
	| 'impact';

/**
 * Reveal style effects for dramatic text appearance
 */
export type RevealStyleEffect =
	| 'redacted'
	| 'invisible-ink'
	| 'handwriting'
	| 'strike'
	| 'flicker';

/**
 * Emotion preset effects combining multiple visual elements
 */
export type EmotionEffect =
	| 'angry'
	| 'scared'
	| 'happy'
	| 'sad'
	| 'mysterious'
	| 'excited'
	| 'whisper'
	| 'shout'
	| 'dizzy'
	| 'dreamy'
	| 'robotic'
	| 'static';

/**
 * Color/visual effects
 */
export type ColorEffect =
	| 'rainbow'
	| 'glow';

/**
 * All available TypeWriter text effects
 */
export type TextEffect =
	| ShakeEffect
	| WaveEffect
	| RevealEffect
	| GlitchEffect
	| EmphasisEffect
	| RevealStyleEffect
	| EmotionEffect
	| ColorEffect;

/**
 * Effect categories for documentation and organization
 */
export const EFFECT_CATEGORIES = {
	shake: ['shake', 'shake-hard', 'shake-slow', 'shake-little', 'shake-horizontal', 'shake-vertical'] as const,
	wave: ['wave', 'wave-slow', 'wave-fast'] as const,
	reveal: ['fade', 'fade-slow', 'blur', 'scale', 'scale-bounce', 'slide-up', 'slide-down'] as const,
	glitch: ['glitch', 'glitch-hard', 'glitch-slow'] as const,
	emphasis: ['bold', 'italic', 'big', 'small', 'impact'] as const,
	revealStyle: ['redacted', 'invisible-ink', 'handwriting', 'strike', 'flicker'] as const,
	emotion: ['angry', 'scared', 'happy', 'sad', 'mysterious', 'excited', 'whisper', 'shout', 'dizzy', 'dreamy', 'robotic', 'static'] as const,
	color: ['rainbow', 'glow'] as const,
} as const;

/**
 * All available effects as a flat array
 */
export const ALL_EFFECTS = [
	...EFFECT_CATEGORIES.shake,
	...EFFECT_CATEGORIES.wave,
	...EFFECT_CATEGORIES.reveal,
	...EFFECT_CATEGORIES.glitch,
	...EFFECT_CATEGORIES.emphasis,
	...EFFECT_CATEGORIES.revealStyle,
	...EFFECT_CATEGORIES.emotion,
	...EFFECT_CATEGORIES.color,
] as const;

/**
 * Type guard to check if a string is a valid effect
 */
export function isValidEffect(effect: string): effect is TextEffect {
	return (ALL_EFFECTS as readonly string[]).includes(effect);
}

