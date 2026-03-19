import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { LegacySaveData, HistoryMap, StateMap } from '../lib/types';
import { $_, Space, SpaceAdapter, Platform, Text } from '@aegis-framework/artemis';
import { DateTime } from 'luxon';
import migrate from '../migrations';

// ============================================================================
// Game Object / State Snapshot
// ============================================================================

/**
 * Get all the relevant information of the game state.
 * Named `gameObject` to avoid collision with JS `Object`.
 *
 * @returns An object containing the current histories, state and storage variables.
 */
export function gameObject (engine: VisualNovelEngine): { history: HistoryMap; state: StateMap; storage: unknown } {
	return {
		history: engine.history (),
		state: engine.state (),
		storage: engine.storage ()
	};
}

// ============================================================================
// Save
// ============================================================================

export async function saveTo (engine: VisualNovelEngine, prefix = 'SaveLabel', id: number | null = null, name: string | null = null): Promise<unknown> {
	// Check if the player is actually playing
	if (!engine.global ('playing')) {
		return;
	}

	const now = DateTime.now();
	const date = now.toISO();
	const timestamp = now.toMillis();
	const gameData = gameObject(engine);

	if (name === null || name.trim () === '') {
		name = date;
	}

	let image = '';

	const backgroundState = engine.state ('background');
	const sceneState = engine.state ('scene');

	if (backgroundState) {
		image = backgroundState.split (' ')[2];
	} else if (sceneState) {
		image = sceneState.split (' ')[2];
	}

	const response = await engine.Storage.set (`${engine.setting (prefix)}_${id || timestamp}`, {
		name,
		date,
		image,
		game: gameData
	});

	if (response instanceof Response) {
		return Promise.resolve (response.json ());
	}

	return Promise.resolve (response);
}

// ============================================================================
// Reset
// ============================================================================

export function resetGame (engine: VisualNovelEngine): Promise<unknown[]> {
	// Stop autoplay
	engine.autoPlay (false);

	const skipSetting = engine.setting ('Skip');

	if (skipSetting > 0) {
		engine.skip (false);
	}

	// Reset Storage
	const storageStructure = engine.global ('storageStructure');

	engine.storage (JSON.parse(storageStructure));

	// Reset Conditions
	engine.state ({
		step: 0,
		label: engine.setting ('Label')
	});

	engine.global ('block', false);

	// Reset History
	for (const history of Object.keys (engine._history)) {
		engine._history[history] = [];
	}

	// Run the reset method of all the actions so each of them can reset
	// their own elements correctly
	const promises: Promise<unknown>[] = [];

	for (const action of engine.actions ()) {
		promises.push (action.reset ());
	}

	for (const component of engine.components ()) {
		promises.push (component.onReset ());
	}

	return Promise.all (promises);
}

// ============================================================================
// Upgrade
// ============================================================================

export function upgrade (engine: VisualNovelEngine, oldVersion: string, newVersion: string, callbacks: { storage?: (oldData: unknown) => unknown; replaceStorage?: boolean }): void {
	engine._upgrade[`${oldVersion}::${newVersion}`] = callbacks;
}

// ============================================================================
// Storage Setup
// ============================================================================

export function setupStorage (engine: VisualNovelEngine): void {
	// Check if an Adapter has been set or else, the global local storage
	// object will be used
	const storageSetting = engine.setting ('Storage');

	if (storageSetting.Adapter.trim () !== '') {
		let adapter;
		const props: Record<string, unknown> = {};

		switch (storageSetting.Adapter) {
			case 'LocalStorage':
				adapter = SpaceAdapter.LocalStorage;
				break;

			case 'SessionStorage':
				adapter = SpaceAdapter.SessionStorage;
				break;

			case 'IndexedDB':
				adapter = SpaceAdapter.IndexedDB;
				props.keyPath = 'id';
				break;

			case 'RemoteStorage':
				adapter = SpaceAdapter.RemoteStorage;
				props.headers = {
					'Content-Type': 'application/json',
				};
				break;

			default:
				adapter = SpaceAdapter.LocalStorage;
				break;
		}

		if (window.navigator && !Platform.desktopApp && !Platform.cordova) {
			if (window.navigator.storage && window.navigator.storage.persist) {
				window.navigator.storage.persist ().then ((persisted) => {
					if (persisted !== true) {
						console.warn ('Persistent Storage permission has been denied. When your device gets low on storage, it may choose to delete your game files.');
					}
				}).catch ((error) => {
					console.error (error);
				});
			}
		}

		engine.Storage = new Space (adapter, {
			name: Text.friendly (engine.setting ('Name') as string),
			version: engine.setting ('Version') as string,
			store: storageSetting.Store,
			endpoint: storageSetting.Endpoint,
			props,
		} as ConstructorParameters<typeof Space>[1]);
	}

	// Setup all the upgrade functions
	for (const upgrade of Object.keys (engine._upgrade)) {
		const [oldVersion, newVersion] = upgrade.split ('::');
		const upgradeEntry = engine._upgrade[upgrade];
		const callback = upgradeEntry?.storage;

		if (callback) {
			const replace = upgradeEntry?.replaceStorage === true;

			engine.Storage.upgrade (oldVersion, newVersion, async () => {
				const oldData = await engine.Storage.getAll ();
				const newData = callback (oldData);
				if (typeof newData === 'object' && newData !== null) {
					const newEntries = Object.entries (newData as Record<string, unknown>);

					if (replace) {
						// Full replacement: remove keys absent from newData so
						// migrations that rename or delete fields take effect.
						const newKeys = new Set (newEntries.map (([k]) => k));
						for (const key of Object.keys (oldData)) {
							if (!newKeys.has (key)) {
								await engine.Storage.remove (key);
							}
						}
					}

					for (const [key, value] of newEntries) {
						await engine.Storage.set (key, value);
					}
				}
			});
		}
	}
}

// ============================================================================
// Load from Slot
// ============================================================================

/**
 * Load a slot from the storage. This will recover the state of the game
 * from what was saved in it.
 *
 * @param slot - The key with which the slot was saved on the storage
 */
export function loadFromSlot (engine: VisualNovelEngine, slot: string): Promise<void> {
	document.body.style.cursor = 'wait';
	engine.global ('playing', true);

	engine.trigger ('willLoadGame');

	return resetGame (engine).then (() => {
		engine.hideScreens ();

		return engine.Storage.get (slot).then ((rawData) => {
			const data = rawData as LegacySaveData;
			// @Compatibility [<= v1.4.1]
			// Check if an older save format was used so we can transform
			// that information into the new format.
			if (typeof data.Engine !== 'undefined') {

				// Set the game state
				engine.state ({
					step: data.Engine.Step,
					label: data.Engine.Label,
					scene: `show scene ${data.Engine.Scene}`,
				});

				// Retrieve if a song was playing so we can set it to the state
				if (data.Engine.Song !== '' && typeof data.Engine.Song !== 'undefined') {
					engine.state ({
						music: [{ statement: data.Engine.Song, paused: false }],
					});
				}

				// Retrieve if a sound was playing so we can set it to the state
				if (data.Engine.Sound !== '' && typeof data.Engine.Sound !== 'undefined') {
					engine.state ({
						sound: [{ statement: data.Engine.Sound, paused: false }],
					});
				}

				// Retrieve if particles were shown so we can set it to the state
				if (data.Engine.Particles !== '' && typeof data.Engine.Particles !== 'undefined') {
					engine.state ({
						particles: `show particles ${data.Engine.Particles}`
					});
				}

				// Check if there are images to be shown
				if (data.Show !== '' && typeof data.Show !== 'undefined') {
					const show = data.Show.split (',');

					// For every image saved, add their element to the game
					for (const element of show) {
						if (element.trim () !== '') {
							const div = document.createElement ('div');
							div.innerHTML =  element.replace ('img/', 'assets/');
							if (div.firstChild) {
								const item = $_(div.firstChild as HTMLElement);
								const firstElement = item.get(0);
								if (firstElement) {
									if (element.indexOf ('data-character') > -1) {
										(engine.state ('characters') as string[]).push (`show character ${item.data ('character')} ${item.data ('sprite')} ${firstElement.className}`);
									} else if (element.indexOf ('data-image') > -1) {
										(engine.state ('characters') as string[]).push (`show image ${item.data ('image')} ${firstElement.className}`);
									}
								}
							}
						}

					}
				}

				const sceneElements = data.Engine!.SceneElementsHistory.map ((elements: string[]) => {
					return elements.map ((element: string) => element.replace ('img/', 'assets/'));
				});

				// Set all the history variables with the ones from the old
				// format
				engine.history ({
					music: data.Engine!.MusicHistory,
					sound: data.Engine!.SoundHistory,
					image: data.Engine!.ImageHistory,
					character: data.Engine!.CharacterHistory.map ((character: string) => {
						const div = document.createElement ('div');
						div.innerHTML = character.replace ('img/', 'assets/');
						if (!div.firstChild) return { statement: '', previous: null };
						const item = $_(div.firstChild as HTMLElement);
						const firstEl = item.get (0);
						if (!firstEl) return { statement: '', previous: null };
						const classes = firstEl.classList;
						classes.remove ('animated');
						return {
							statement: `show character ${item.data ('character')} ${item.data ('sprite')} with ${classes.toString ()}`,
							previous: null
						};
					}).filter((c) => c.statement !== ''),
					scene: data.Engine!.SceneHistory.map ((scene: string) => {
						return `show scene ${scene}`;
					}),
					sceneElements: sceneElements,
					sceneState: sceneElements.map ((elements: string[]) => {
						if (elements.length > 0) {
							return {
								characters: elements.filter((element: string) => element.indexOf ('data-character=') > -1).map ((element: string) => {
									const div = document.createElement ('div');
									div.innerHTML =  element;
									if (!div.firstChild) return '';
									const image = $_(div.firstChild as HTMLElement);
									const firstEl = image.get(0);
									if (!firstEl) return '';
									const classes = firstEl.classList.toString ().replace ('animated', '').trim ();
									return `show character ${image.data('character')} ${image.data('sprite')}${ classes.length > 0 ? ` with ${classes}`: ''}`;
								}).filter((c: string) => c !== ''),
								images: elements.filter((element: string) => element.indexOf ('data-image=') > -1).map ((element: string) => {
									const div = document.createElement ('div');
									div.innerHTML =  element;
									if (!div.firstChild) return '';
									const image = $_(div.firstChild as HTMLElement);
									const firstEl = image.get(0);
									if (!firstEl) return '';
									const classes = firstEl.classList.toString ().replace ('animated', '').trim ();
									return `show image ${image.data('image')}${ classes.length > 0 ? ` with ${classes}`: ''}`;
								}).filter((c: string) => c !== ''),
							};
						}

						return {
							characters: [],
							images: []
						};
					}),
					particle: data.Engine!.ParticlesHistory.map ((particles: string) => {
						return `show particles ${particles}`;
					}),
				});
				engine.storage (data.Storage ?? {});

			} else {
				// If the new format is being used, things are a lot more simple
				const migratedData = migrate((data.game ?? {}) as unknown as Record<string, unknown>) as { state: Record<string, unknown>; history: Record<string, unknown[]>; storage: Record<string, unknown> };

				engine.state (migratedData.state);
				engine.history (migratedData.history);
				engine.storage (migratedData.storage);
			}


			const currentStep = engine.state ('step') as number;
			const labelLength = (engine.label () as unknown[]).length;
			if (currentStep > labelLength - 1) {
				let step = currentStep;
				while (step > labelLength - 1) {
					step = step - 1;
				}
				engine.state ({ step });
			}

			return engine.onLoad ().then (() => {
				// Finally show the game and start playing
				engine.showScreen ('game');
				document.body.style.cursor = 'auto';
				engine.trigger ('didLoadGame');
				return Promise.resolve ();
			});
		});
	});
}
