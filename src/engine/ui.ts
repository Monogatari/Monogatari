import type { VisualNovelEngine } from '../lib/types/Monogatari';
import { $_ } from '@aegis-framework/artemis';
import { FancyError } from '../lib/FancyError';
import type Component from '../lib/Component';

// ============================================================================
// Alert Management
// ============================================================================

export function showAlert (engine: VisualNovelEngine, id: string, options: Record<string, unknown>): void {
	const alert = document.createElement ('alert-modal') as HTMLElement & { setProps: (options: Record<string, unknown>) => void };

	alert.setAttribute ('data-alert-id', id);
	alert.setProps (options);

	engine.element ().prepend (alert);
}

export function dismissAlert (engine: VisualNovelEngine, id: string | null = null): void {
	if (typeof id === 'string') {
		engine.element ().find (`alert-modal[data-alert-id="${id}"]`).remove ();
	} else {
		engine.element ().find ('alert-modal').remove ();
	}
}

// ============================================================================
// Ambient Audio
// ============================================================================

export function playAmbient (engine: VisualNovelEngine): void {
	// Check if a menu music was defined
	if (engine.setting ('MainScreenMusic') !== '' && engine.ambientPlayer) {
		const mainScreenMusic = engine.setting ('MainScreenMusic') as string;
		const assetsPath = engine.setting ('AssetsPath') as { root: string; music: string };
		const volumePref = engine.preference ('Volume') as { Music: number | string };

		// Make the ambient player loop
		engine.ambientPlayer.loop = true;

		let ambientVolume = volumePref.Music;

		if (typeof ambientVolume === 'string') {
			ambientVolume = parseFloat(ambientVolume);
		}

		engine.ambientPlayer.volume = ambientVolume;

		// Check if the music was defined in the music assets object
		const musicAsset = engine.asset ('music', mainScreenMusic) as string | undefined;

		if (typeof musicAsset === 'undefined') {
			const musicAssets = engine.assets ('music') as Record<string, unknown> | undefined;

			FancyError.show ('engine:music:not_defined', {
				music: mainScreenMusic,
				availableMusic: Object.keys (musicAssets ?? {})
			});

      return;
		}

    // Check if the player is already playing music
    if (!engine.ambientPlayer.paused && !engine.ambientPlayer.ended) {
      return;
    }

    // Get the full path to the asset and set the src to the ambient player
    engine.ambientPlayer.src =  `${assetsPath.root}/${assetsPath.music}/${musicAsset}`;

    // Play the music but catch any errors. Error catching is necessary
    // since some browsers like chrome, have added some protections to
    // avoid media from being autoplayed. Because of these protections,
    // the user needs to interact with the page first before the media
    // is able to play.
    engine.ambientPlayer.play ().catch ((e) => {
      console.warn(e);
      // Create a broadcast message
      const element = `
        <div data-ui="broadcast" data-content="allow-playback">
          <p data-string="AllowPlayback">${engine.string ('AllowPlayback')}.</p>
        </div>
      `;

      // Add it to the main menu and game screens
      engine.element ().prepend (element);

      // Try to play the media again once the element has been clicked
      // and remove it.
      engine.element ().on ('click', '[data-ui="broadcast"][data-content="allow-playback"]', () => {
        playAmbient (engine);
        engine.element ().find ('[data-ui="broadcast"][data-content="allow-playback"]').remove ();
      });
    });
	}
}

// Stop the main menu's music
export function stopAmbient (engine: VisualNovelEngine): void {
	const player = engine.ambientPlayer;

	if (player && !player.paused) {
		player.pause ();
	}
}

// ============================================================================
// Screen Management
// ============================================================================

// Start game automatically without going trough the main menu
export function showMainScreen (engine: VisualNovelEngine): void {
	engine.global ('on_splash_screen', false);

	if (engine.setting ('ShowMainScreen')) {
		showScreen (engine, 'main');
		return;
	}

	const currentLabel = engine.label () as unknown[];
	const step = engine.state ('step') as number;

	engine.global ('playing', true);
	showScreen (engine, 'game');

	engine.run (currentLabel[step]);
}

export function showSplashScreen (engine: VisualNovelEngine): void {
	const labelName = engine.setting ('SplashScreenLabel');

	if (typeof labelName === 'string' && labelName !== '') {
		const labelContent = engine.label (labelName);

		if (typeof labelContent !== 'undefined') {
			engine.global ('on_splash_screen', true);

			engine.state ({
				label: labelName
			});

			engine.element ().find ('[data-component="game-screen"]').addClass ('splash-screen');

			engine.element ().find ('[data-component="quick-menu"]').addClass ('splash-screen');

			showScreen (engine, 'game');

			const currentLabel = engine.label () as unknown[];
			const step = engine.state ('step') as number;

			engine.run (currentLabel[step]);

			return;
		}
	}

	showMainScreen (engine);
}

export function showScreen (engine: VisualNovelEngine, screen: string): void {
  // Capture a screenshot before hiding the game screen if we're opening the save screen.
	const shouldCapture = screen === 'save'
		&& engine.setting ('Screenshots') === true
		&& engine.global ('playing') === true
		&& engine.element ().find ('[data-screen="game"]').isVisible ();

	if (shouldCapture) {
		engine._pendingScreenshot = captureGameScreenshot (engine);
		engine._pendingScreenshot.finally (() => revealScreen (engine, screen));
		return;
	}

	// Leaving the save screen discards any pending capture
	if (screen !== 'save') {
		engine._pendingScreenshot = null;
	}

	revealScreen (engine, screen);
}

/**
 * Capture the current game screen as a JPEG Blob
 */
export async function captureGameScreenshot (engine: VisualNovelEngine): Promise<Blob | null> {
	const gameScreen = engine.element ().find ('[data-screen="game"]').get (0) as HTMLElement | undefined;

	if (!gameScreen || gameScreen.offsetWidth === 0) {
		return null;
	}

	// Ensure animations are settled before capturing the screenshot.
	const settleAnimations = document.createElement ('style');
	settleAnimations.textContent = '[data-screen="game"], [data-screen="game"] *, [data-screen="game"] *::before, [data-screen="game"] *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }';

	try {
		document.head.appendChild (settleAnimations);

		const { domToBlob } = await import ('modern-screenshot');

		return await domToBlob (gameScreen, {
			quality: 0.8,
			type: 'image/jpeg',
			scale: 400 / gameScreen.offsetWidth,
		});
	} catch (e) {
		engine.debug.warn ('Screenshot capture failed:', e);

		return null;
	} finally {
		settleAnimations.remove ();
	}
}

function revealScreen (engine: VisualNovelEngine, screen: string): void {
	hideScreens (engine);

	const screenElement = engine.element ().find (`[data-screen="${screen}"]`).get (0) as Component | undefined;
	screenElement?.setState ({
		open: true
	});

	// If auto play or skip were enabled, disable them.
	if (engine.global ('_auto_play_timer')) {
		autoPlay (engine, false);
	}

	if (engine.global ('skip')) {
		skip (engine, false);
	}
}

export function hideScreens (engine: VisualNovelEngine): void {
	const element = engine.element();

	element?.find ('[data-screen]').each ((screen) => {
		(screen as Component).setState ({ open: false });
	});
}

// ============================================================================
// Auto-play & Skip
// ============================================================================

/**
 * @static autoPlay - Enable or disable the autoplay feature which allows the
 * game to play itself (of sorts), it will go through the dialogs alone but
 * will wait when user interaction is needed.
 *
 * @param {boolean} enable - Wether the auto play feature will be enabled (true)
 * or disabled (false);
 */
export function autoPlay (engine: VisualNovelEngine, enable: boolean): void {
	if (enable === true) {
		// The interval for autoplay speed is measured in seconds
		const interval = (engine.preference ('AutoPlaySpeed') as number) * 1000;
		let expected = Date.now () + interval;

		const timerFn = () => {
			const now = Date.now () - expected; // the drift (positive for overshooting)
			if (now > interval) {
				// something really bad happened. Maybe the browser (tab) was inactive?
				// possibly special handling to avoid futile "catch up" run
			}
			engine.proceed ({ userInitiated: false, skip: false, autoPlay: true }).then (() => {
				expected += interval;
				setTimeout (engine.global ('_auto_play_timer') as () => void, Math.max (0, interval - now)); // take into account drift
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
				expected += interval;
				setTimeout (engine.global ('_auto_play_timer') as () => void, Math.max (0, interval - now)); // take into account drift
			});
		};

		engine.global ('_auto_play_timer', timerFn);
		setTimeout (timerFn, interval);

		engine.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-string]').text (engine.string ('Stop') || 'Stop');
		engine.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-icon]').replaceWith ('<span class="fas fa-stop-circle"></span>');
	} else {
		clearTimeout (engine.global ('_auto_play_timer') as ReturnType<typeof setTimeout>);
		engine.global ('_auto_play_timer', null);
		engine.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-string]').text (engine.string ('AutoPlay') || 'AutoPlay');
		engine.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-icon]').replaceWith ('<span class="fas fa-play-circle"></span>');
	}
}

/**
 * @static distractionFree - Enable or disable the distraction free mode
 * where the dialog box is hidden so that the player can look at the characters
 * and background with no other elements on the way. A 'transparent' class
 * is added to the quick menu when this mode is enabled.
 */
export function distractionFree (engine: VisualNovelEngine): void {
	if (engine.global ('playing')) {
		const element = engine.element();
		// Check if the distraction free is currently enabled
		if (engine.global ('distraction_free') === true) {
			element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-string]').text (engine.string ('Hide') ?? '');
			element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-icon]').replaceWith ('<span class="fas fa-eye" data-action="distraction-free"></span>');
			element?.find ('[data-component="quick-menu"]').removeClass ('transparent');
			element?.find ('[data-component="text-box"]').show ('grid');
			engine.global ('distraction_free', false);
		} else {
			element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-string]').text (engine.string ('Show') ?? '');
			element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-icon]').replaceWith ('<span class="fas fa-eye-slash" data-action="distraction-free"></span>');
			element?.find ('[data-component="quick-menu"]').addClass ('transparent');
			element?.find ('[data-component="text-box"]').hide();
			engine.global ('distraction_free', true);
		}
	}
}

export function skip (engine: VisualNovelEngine, enable: boolean): void {
	const skipSetting = engine.setting ('Skip') as number;

	if (enable === true) {
		// Check if Skip was enabled on the settings, if it has a value greater
		// than 0, it represents the speed with which the game will skip through
		// statements. If it's lesser or equal to 0 then it's disabled.
		if (skipSetting > 0) {

			const button = engine.element ().find ('[data-component="quick-menu"] [data-action="skip"] [data-icon]');

			if (button.data ('icon') !== 'play-circle') {
				button.replaceWith ('<span class="far fa-play-circle"></span>');
			}

			// Start the timeout with the time specified on the settings. We
			// save it on a global variable so that we can disable later.
			engine.global ('skip', setTimeout (() => {
				if (engine.element ().find ('[data-screen="game"]').isVisible () && engine.global ('playing') === true) {
					engine.proceed ({ userInitiated: false, skip: true, autoPlay: false }).then (() => {
						// Nothing to do here
					}).catch ((e) => {
						engine.debug.log (`Proceed Prevented\nReason: ${e}`);
						// An action waiting for user interaction or something else
						// is blocking the game.
					});
				}
				// Start all over again
				skip (engine, true);
			}, skipSetting));
		}
	} else {
		clearTimeout (engine.global ('skip') as ReturnType<typeof setTimeout>);
		engine.global ('skip', null);
		const button = engine.element ().find ('[data-component="quick-menu"] [data-action="skip"] [data-icon]');

		if (button.data ('icon') !== 'fast-forward') {
			button.replaceWith ('<span class="fas fa-fast-forward"></span>');
		}
	}
}

// ============================================================================
// Resize & Navigation
// ============================================================================

export function resize (engine: VisualNovelEngine, _element: unknown, proportionWidth: number, proportionHeight: number): void {
	const parentElement = engine.parentElement();
	if (!parentElement) return;

	const mainWidth = parentElement.width();
	const mainHeight = parentElement.height();

	const h = Math.floor (mainWidth * (proportionHeight / proportionWidth));

	let widthCss = '100%';
	let heightCss = '100%';
	let marginTopCss: string | number = 0;

	if (h <= mainHeight) {
		const marginTop = Math.floor ((mainHeight - h)/2);
		marginTopCss = marginTop + 'px';
		heightCss = h + 'px';

	} else {
		const w = Math.floor (mainHeight * (proportionWidth/proportionHeight));
		widthCss = w + 'px';
	}

	$_('.forceAspectRatio').style ({
		'width': widthCss,
		'height': heightCss,
		'margin-top': marginTopCss
	});
}

export function goBack (engine: VisualNovelEngine, event: Event, selector: string): void {
	if (!$_(`${selector} [data-screen="game"]`).isVisible ()) {
		engine.debug.debug ('Registered Back Listener on Non-Game Screen');
		event.stopImmediatePropagation ();
		event.stopPropagation ();
		event.preventDefault ();
		hideScreens (engine);

		type ComponentWithState = HTMLElement & { setState: (state: Record<string, unknown>) => void };

		if (engine.global ('playing') || engine.global ('on_splash_screen')) {
			const gameScreen = engine.element ().find ('[data-screen="game"]').get (0) as ComponentWithState | undefined;
			gameScreen?.setState ({ open: true });
		} else {
			const mainScreen = engine.element ().find ('[data-screen="main"]').get (0) as ComponentWithState | undefined;
			mainScreen?.setState ({ open: true });
		}
	}
}

// ============================================================================
// Initial Screen
// ============================================================================

export function displayInitialScreen (engine: VisualNovelEngine): void {
	// Preload all the game assets
	engine.preload ().then (() => {

	}).catch ((e) => {
		console.error (e);
	}).finally (() => {
		if (engine.label ()) {
			showSplashScreen (engine);
		} else {
			const scriptData = engine.script () as Record<string, unknown> | undefined;
			FancyError.show ('engine:script:label_not_found', {
				startLabel: engine.setting ('Label'),
				availableLabels: Object.keys (scriptData ?? {})
			});
		}
	});
}
