/**
 * =============================================================================
 * Monogatari Core Engine
 * =============================================================================
 */

/**
 * =============================================================================
 * Global Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that must be globally imported in order for
 * Monogatari to work correctly.
 * =============================================================================
 */

import '@fortawesome/fontawesome-free/js/all';

/**
 * =============================================================================
 * Exported Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that Monogatari uses for certain functions
 * and may be helpful for the developers.
 * =============================================================================
 */

export * from '@aegis-framework/artemis';

export { tsParticles } from '@tsparticles/engine';

export * from '@tsparticles/slim';

export * as RandomJS from 'random-js';

export * as Luxon from 'luxon';

import Monogatari from './monogatari';
import type { StaticComponent } from './lib/types/Component';
import type { StaticAction } from './lib/types/Action';

/**
 * =============================================================================
 * Translations
 * -----------------------------------------------------------------------------
 * Import all the translations available for the UI
 * =============================================================================
 */

import arabic from './translations/العربية';
import belarusian from './translations/Беларуская';
import brazilianPortuguese from './translations/Portugues_Brasil';
import chineseTraditional from './translations/繁體中文';
import chineseSimplified from './translations/简体中文';
import dutch from './translations/Nederlands';
import english from './translations/English';
import french from './translations/Francais';
import german from './translations/Deutsch';
import hungarian from './translations/Hungarian';
import indonesian from './translations/Bahasa_Indonesia';
import japanese from './translations/日本語';
import korean from './translations/한국어';
import portuguese from './translations/Portugues';
import russian from './translations/Russian';
import spanish from './translations/Espanol';
import tokipona from './translations/tokipona';
import bulgarian from './translations/Bulgarian';

Monogatari._translations = {
	'Bahasa Indonesia': indonesian,
	'Български': bulgarian,
	'Беларуская': belarusian,
	'Deutsch': german,
	'English': english,
	'Español': spanish,
	'Français': french,
	'Magyar': hungarian,
	'Nederlands': dutch,
	'Português': portuguese,
	'Português do Brasil': brazilianPortuguese,
	'Русский': russian,
	'اللغه العربية': arabic,
	'한국어': korean,
	'日本語': japanese,
	'繁體中文': chineseTraditional,
	'简体中文': chineseSimplified,
	'toki pona': tokipona,
};

Monogatari._languageMetadata = {
	'Bahasa Indonesia':{
		code: 'id',
		icon: '🇮🇩',
	},
	'Беларуская': {
		code: 'be',
		icon: '🇧🇾'
	},
	'Български': {
		code: 'bg',
		icon: '🇧🇬'
	},
	'Deutsch': {
		code: 'de',
		icon: '🇩🇪'
	},
	'English': {
		code: 'en',
		icon: '🇺🇸'
	},
	'Español': {
		code: 'es',
		icon: '🇲🇽'
	},
	'Français': {
		code: 'fr',
		icon: '🇫🇷'
	},
	'Magyar': {
		code: 'hu',
		icon: '🇭🇺'
	},
	'Nederlands': {
		code: 'nl',
		icon: '🇳🇱'
	},
	'Português': {
		code: 'pt',
		icon: '🇵🇹'
	},
	'Português do Brasil': {
		code: 'pt-br',
		icon: '🇧🇷'
	},
	'Русский': {
		code: 'ru',
		icon: '🇷🇺'
	},
	'اللغه العربية': {
		code: 'ar',
		icon: '🇦🇪'
	},
	'한국어': {
		code: 'ko',
		icon: '🇰🇷'
	},
	'日本語': {
		code: 'ja',
		icon: '🇯🇵'
	},
	'繁體中文': {
		code: 'zh-hant',
		icon: '🇹🇼'
	},
	'简体中文': {
		code: 'zh-hans',
		icon: '🇨🇳'
	},
	'toki pona': {
		code: 'en',
		icon: '🕮'
	},
};

/**
 * =============================================================================
 * Components
 * -----------------------------------------------------------------------------
 * Import all the core components used by Monogatari. These components are the
 * ones that describe the behavior and appearance of all the custom elements.
 * =============================================================================
 */

import AlertModal from './components/alert-modal/index';
import CanvasContainer from './components/canvas-container/index';
import CenteredDialog from './components/centered-dialog/index';
import CharacterSprite from './components/character-sprite/index';
import ChoiceContainer from './components/choice-container/index';
import CreditsScreen from './components/credits-screen/index';
import DialogLog from './components/dialog-log/index';
import GalleryScreen from './components/gallery-screen/index';
import GameScreen from './components/game-screen/index';
import HelpScreen from './components/help-screen/index';
import LanguageSelectionScreen from './components/language-selection-screen/index';
import LoadScreen from './components/load-screen/index';
import LoadingScreen from './components/loading-screen/index';
import MainMenu from './components/main-menu/index';
import MainScreen from './components/main-screen/index';
import MessageModal from './components/message-modal/index';
import QuickMenu from './components/quick-menu/index';
import SaveScreen from './components/save-screen/index';
import SaveSlot from './components/save-slot/index';
import SettingsScreen from './components/settings-screen/index';
import SlotContainer from './components/slot-container/index';
import TextBox from './components/text-box/index';
import TextInput from './components/text-input/index';
import TimerDisplay from './components/timer-display/index';
import VisualNovel from './components/visual-novel/index';
import TypeWriter from './components/type-writer/index';
import TypeCharacter from './components/type-character/index';

// Type cast needed as components extend Component but TypeScript has trouble with the complex static interfaces
Monogatari._components = [
	AlertModal,
	CanvasContainer,
	CenteredDialog,
	CharacterSprite,
	ChoiceContainer,
	CreditsScreen,
	DialogLog,
	GalleryScreen,
	GameScreen,
	HelpScreen,
	LanguageSelectionScreen,
	LoadScreen,
	LoadingScreen,
	MainMenu,
	MainScreen,
	MessageModal,
	QuickMenu,
	SaveScreen,
	SaveSlot,
	SettingsScreen,
	SlotContainer,
	TextBox,
	TextInput,
	TimerDisplay,
	VisualNovel,
	TypeWriter,
	TypeCharacter
] as unknown as StaticComponent[];


/**
 * =============================================================================
 * Actions
 * -----------------------------------------------------------------------------
 * Import all the core actions available. These actions are the ones that define
 * the allowed statements on a script and what they do.
 * =============================================================================
 */

import Canvas from './actions/Canvas';
import Choice from './actions/Choice';
import Clear from './actions/Clear';
import Conditional from './actions/Conditional';
import Dialog from './actions/Dialog';
import End from './actions/End';
import Function from './actions/Function';
import Gallery from './actions/Gallery';
import HideCanvas from './actions/HideCanvas';
import HideCharacter from './actions/HideCharacter';
import HideCharacterLayer from './actions/HideCharacterLayer';
import HideImage from './actions/HideImage';
import HideParticles from './actions/HideParticles';
import HideTextBox from './actions/HideTextBox';
import HideVideo from './actions/HideVideo';
import InputModal from './actions/InputModal';
import Jump from './actions/Jump';
import Message from './actions/Message';
import Next from './actions/Next';
import Notify from './actions/Notify';
import Particles from './actions/Particles';
import Pause from './actions/Pause';
import Placeholder from './actions/Placeholder';
import Play from './actions/Play';
import Preload from './actions/Preload';
import Scene from './actions/Scene';
import ShowBackground from './actions/ShowBackground';
import ShowCharacter from './actions/ShowCharacter';
import ShowCharacterLayer from './actions/ShowCharacterLayer';
import ShowImage from './actions/ShowImage';
import ShowTextBox from './actions/ShowTextBox';
import Stop from './actions/Stop';
import Unload from './actions/Unload';
import Vibrate from './actions/Vibrate';
import Video from './actions/Video';
import Wait from './actions/Wait';

// The order in which actions are registered is important.
// Type cast needed as actions extend Action but TypeScript has trouble with the complex static interfaces
Monogatari._actions = [
	Canvas,
	Choice,
	Clear,
	Conditional,
	End,
	Function,
	Gallery,
	HideCanvas,
	HideCharacter,
	HideCharacterLayer,
	HideImage,
	HideParticles,
	HideTextBox,
	HideVideo,
	InputModal,
	Jump,
	Message,
	Next,
	Notify,
	Particles,
	Pause,
	Play,
	Placeholder,
	Preload,
	Scene,
	ShowBackground,
	ShowCharacter,
	ShowCharacterLayer,
	ShowImage,
	ShowTextBox,
	Stop,
	Unload,
	Vibrate,
	Video,
	Wait,

	// Dialog must always go last
	Dialog,
] as StaticAction[];

/**
 * Export Monogatari Core
 */
export { default as Action } from './lib/Action';
export { default as Component } from './lib/Component';
export { default as ShadowComponent } from './lib/ShadowComponent';
export * from './lib/ScreenComponent';
export * from './lib/MenuComponent';
export * from './lib/FancyError';

import AudioPlayer from './lib/AudioPlayer';
export { AudioPlayer };

export default Monogatari;
