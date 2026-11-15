/**
 * TypeWriter Text Effect Types
 * ============================================================================
 * This module exports type definitions for TypeWriter text effects.
 * Effects are used in dialogue via the syntax: {/effect}text{/effect}
 */
/**
 * Shake effect variants for trembling/vibrating text
 */
export type ShakeEffect = 'shake' | 'shake-hard' | 'shake-slow' | 'shake-little' | 'shake-horizontal' | 'shake-vertical';
/**
 * Wave effect variants for bouncing/flowing text
 */
export type WaveEffect = 'wave' | 'wave-slow' | 'wave-fast';
/**
 * Fade/Scale reveal variations for character appearance
 */
export type RevealEffect = 'fade' | 'fade-slow' | 'blur' | 'scale' | 'scale-bounce' | 'slide-up' | 'slide-down';
/**
 * Glitch effects for digital/horror aesthetics
 */
export type GlitchEffect = 'glitch' | 'glitch-hard' | 'glitch-slow';
/**
 * Emphasis markers for text styling
 */
export type EmphasisEffect = 'bold' | 'italic' | 'big' | 'small' | 'impact';
/**
 * Reveal style effects for dramatic text appearance
 */
export type RevealStyleEffect = 'redacted' | 'invisible-ink' | 'handwriting' | 'strike' | 'flicker';
/**
 * Emotion preset effects combining multiple visual elements
 */
export type EmotionEffect = 'angry' | 'scared' | 'happy' | 'sad' | 'mysterious' | 'excited' | 'whisper' | 'shout' | 'dizzy' | 'dreamy' | 'robotic' | 'static';
/**
 * Color/visual effects
 */
export type ColorEffect = 'rainbow' | 'glow';
/**
 * All available TypeWriter text effects
 */
export type TextEffect = ShakeEffect | WaveEffect | RevealEffect | GlitchEffect | EmphasisEffect | RevealStyleEffect | EmotionEffect | ColorEffect;
/**
 * Effect categories for documentation and organization
 */
export declare const EFFECT_CATEGORIES: {
    readonly shake: readonly ["shake", "shake-hard", "shake-slow", "shake-little", "shake-horizontal", "shake-vertical"];
    readonly wave: readonly ["wave", "wave-slow", "wave-fast"];
    readonly reveal: readonly ["fade", "fade-slow", "blur", "scale", "scale-bounce", "slide-up", "slide-down"];
    readonly glitch: readonly ["glitch", "glitch-hard", "glitch-slow"];
    readonly emphasis: readonly ["bold", "italic", "big", "small", "impact"];
    readonly revealStyle: readonly ["redacted", "invisible-ink", "handwriting", "strike", "flicker"];
    readonly emotion: readonly ["angry", "scared", "happy", "sad", "mysterious", "excited", "whisper", "shout", "dizzy", "dreamy", "robotic", "static"];
    readonly color: readonly ["rainbow", "glow"];
};
/**
 * All available effects as a flat array
 */
export declare const ALL_EFFECTS: readonly ["shake", "shake-hard", "shake-slow", "shake-little", "shake-horizontal", "shake-vertical", "wave", "wave-slow", "wave-fast", "fade", "fade-slow", "blur", "scale", "scale-bounce", "slide-up", "slide-down", "glitch", "glitch-hard", "glitch-slow", "bold", "italic", "big", "small", "impact", "redacted", "invisible-ink", "handwriting", "strike", "flicker", "angry", "scared", "happy", "sad", "mysterious", "excited", "whisper", "shout", "dizzy", "dreamy", "robotic", "static", "rainbow", "glow"];
/**
 * Type guard to check if a string is a valid effect
 */
export declare function isValidEffect(effect: string): effect is TextEffect;
//# sourceMappingURL=TypeWriterEffects.d.ts.map