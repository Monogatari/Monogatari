/**
 * Monogatari Type Definitions
 */

import type { Component } from '@aegis-framework/pandora';

/**
 * Generic configuration object type
 */
export type Configuration = Record<string, unknown>;

/**
 * Error properties for FancyError display
 */
export interface FancyErrorProps {
	[key: string]: string | number | unknown[] | NodeList | FancyErrorProps;
}

/**
 * Queued error object
 */
export interface QueuedError {
	id: string;
	title: string;
	message: string;
	props: FancyErrorProps;
}

/**
 * Button definition for menu components
 */
export interface MenuButton {
	string: string;
	icon: string;
	element?: string;
	data?: Record<string, string>;
}

/**
 * Action application result
 */
export interface ActionApplyResult {
	advance: boolean;
}

/**
 * Action revert result
 */
export interface ActionRevertResult {
	advance: boolean;
	step: boolean;
}

/**
 * Action run context
 */
export interface ActionRunContext {
	advance: boolean;
}

/**
 * Action revert context
 */
export interface ActionRevertContext {
	advance: boolean;
	step: boolean;
}

/**
 * Save slot object
 */
export interface SaveSlot {
	key: string;
	value: Record<string, unknown>;
}

/**
 * Audio effect configuration
 */
export interface AudioEffectConfig {
	id: string;
	description: string;
	params: string[];
	create: (audioContext: AudioContext, params: Record<string, unknown>) => AudioNode | AudioEffectResult;
}

/**
 * Complex audio effect result
 */
export interface AudioEffectResult {
	node: AudioNode;
	stop?: () => void;
	disconnect?: () => void;
}

/**
 * Audio player options
 */
export interface AudioPlayerOptions {
	outputNode?: GainNode | null;
	effects?: Record<string, Record<string, unknown>>;
	loop?: boolean;
	paused?: boolean;
}

/**
 * Monogatari engine interface (forward declaration)
 * This will be fully typed when monogatari.js is converted
 */
export interface MonogatariEngine {
	configuration: (key?: string | Record<string, unknown>, value?: unknown) => unknown;
	element: () => { find: (selector: string) => unknown };
	on: (event: string, callback: (...args: unknown[]) => void) => unknown;
	off: (event: string, callback: unknown) => void;
  playAmbient: () => void;
  stopAmbient: () => void;
  global: (key: string) => unknown;
  _languageMetadata: Record<string, { code: string; icon: string }>;
}

/**
 * Mixin type helper for class mixins
 */
export type Constructor<T = object> = new (...args: unknown[]) => T;

/**
 * Base component constructor type for mixins
 */
export type ComponentConstructor = Constructor<Component> & {
	tag: string;
	engine: MonogatariEngine;
	_experimental: boolean;
	_configuration: Configuration;
	_priority: number;
};


