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

import '@fortawesome/fontawesome-free/js/all.js';

/**
 * =============================================================================
 * Exported Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that Monogatari uses for certain functions
 * and may be helpful for the developers.
 * =============================================================================
 */

export * from '@aegis-framework/artemis';

export * from '@tsparticles/slim';

export * as RandomJS from 'random-js';

export * as Luxon from 'luxon';

import Monogatari from './monogatari.js';

/**
 * =============================================================================
 * Translations
 * -----------------------------------------------------------------------------
 * Import all the translations available for the UI
 * =============================================================================
 */

import arabic from './translations/العربية.js';
import belarusian from './translations/Беларуская.js';
import brazilianPortuguese from './translations/Portugues_Brasil.js';
import chineseTraditional from './translations/繁體中文.js';
import chineseSimplified from './translations/简体中文.js';
import dutch from './translations/Nederlands.js';
import english from './translations/English.js';
import french from './translations/Francais.js';
import german from './translations/Deutsch.js';
import hungarian from './translations/Hungarian.js';
import indonesian from './translations/Bahasa_Indonesia.js';
import japanese from './translations/日本語.js';
import korean from './translations/한국어.js';
import portuguese from './translations/Portugues.js';
import russian from './translations/Russian.js';
import spanish from './translations/Espanol.js';
import tokipona from './translations/tokipona.js';
import bulgarian from './translations/Bulgarian.js';

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

import AlertModal from './components/alert-modal/index.js';
import CanvasContainer from './components/canvas-container/index.js';
import CenteredDialog from './components/centered-dialog/index.js';
import CharacterSprite from './components/character-sprite/index.js';
import ChoiceContainer from './components/choice-container/index.js';
import CreditsScreen from './components/credits-screen/index.js';
import DialogLog from './components/dialog-log/index.js';
import GalleryScreen from './components/gallery-screen/index.js';
import GameScreen from './components/game-screen/index.js';
import HelpScreen from './components/help-screen/index.js';
import LanguageSelectionScreen from './components/language-selection-screen/index.js';
import LoadScreen from './components/load-screen/index.js';
import LoadingScreen from './components/loading-screen/index.js';
import MainMenu from './components/main-menu/index.js';
import MainScreen from './components/main-screen/index.js';
import MessageModal from './components/message-modal/index.js';
import QuickMenu from './components/quick-menu/index.js';
import SaveScreen from './components/save-screen/index.js';
import SaveSlot from './components/save-slot/index.js';
import SettingsScreen from './components/settings-screen/index.js';
import SlotContainer from './components/slot-container/index.js';
import TextBox from './components/text-box/index.js';
import TextInput from './components/text-input/index.js';
import TimerDisplay from './components/timer-display/index.js';
import VisualNovel from './components/visual-novel/index.js';
import TypeWriter from './components/type-writer/index.js';
import TypeCharacter from './components/type-character/index.js';

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
] as unknown as typeof Monogatari._components;

/**
 * =============================================================================
 * Actions
 * -----------------------------------------------------------------------------
 * Import all the core actions available. These actions are the ones that define
 * the allowed statements on a script and what they do.
 * =============================================================================
 */

import Canvas from './actions/Canvas.js';
import Choice from './actions/Choice.js';
import Clear from './actions/Clear.js';
import Conditional from './actions/Conditional.js';
import Dialog from './actions/Dialog.js';
import End from './actions/End.js';
import Function from './actions/Function.js';
import Gallery from './actions/Gallery.js';
import HideCanvas from './actions/HideCanvas.js';
import HideCharacter from './actions/HideCharacter.js';
import HideCharacterLayer from './actions/HideCharacterLayer.js';
import HideImage from './actions/HideImage.js';
import HideParticles from './actions/HideParticles.js';
import HideVideo from './actions/HideVideo.js';
import InputModal from './actions/InputModal.js';
import Jump from './actions/Jump.js';
import Message from './actions/Message.js';
import Next from './actions/Next.js';
import Notify from './actions/Notify.js';
import Particles from './actions/Particles.js';
import Pause from './actions/Pause.js';
import Placeholder from './actions/Placeholder.js';
import Play from './actions/Play.js';
import Scene from './actions/Scene.js';
import ShowBackground from './actions/ShowBackground.js';
import ShowCharacter from './actions/ShowCharacter.js';
import ShowCharacterLayer from './actions/ShowCharacterLayer.js';
import ShowImage from './actions/ShowImage.js';
import Stop from './actions/Stop.js';
import Vibrate from './actions/Vibrate.js';
import Video from './actions/Video.js';
import Wait from './actions/Wait.js';

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
	Scene,
	ShowBackground,
	ShowCharacter,
	ShowCharacterLayer,
	ShowImage,
	Stop,
	Vibrate,
	Video,
	Wait,

	// Dialog must always go last
	Dialog,
] as unknown as typeof Monogatari._actions;

/**
 * Export Monogatari Core
 */
export * from './lib/Action.js';
export * from './lib/Component.js';
export * from './lib/ShadowComponent.js';
export * from './lib/ScreenComponent.js';
export * from './lib/MenuComponent.js';
export * from './lib/FancyError.js';

import AudioPlayer from './lib/AudioPlayer.js';
export { AudioPlayer };

export default Monogatari;
