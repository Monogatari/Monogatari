import type { DesktopBridge } from './DesktopBridge';
import type { StorageInterface } from './types/Monogatari';

let requestIdCounter = 0;

// We use requests IDs to track the requests and responses between the main process
// and the renderer process. This is a simple way to ensure that the requests and
// responses are matched correctly.
const nextRequestId = (): string => `fss_${++requestIdCounter}_${Date.now()}`;

export class FileSystemStorage implements StorageInterface {
	private bridge: DesktopBridge;
	private _config: Record<string, unknown> = {};

	private _callbacks = {
		create: [] as Array<(key: string, value: unknown) => void>,
		update: [] as Array<(key: string, value: unknown) => void>,
		delete: [] as Array<(key: string, value: unknown) => void>,
	};

	private _transformations: Record<string, { id: string; get?: ((key: string, value: unknown) => unknown) | null; set?: ((key: string, value: unknown) => unknown) | null }> = {};

	private _pendingRequests = new Map<string, { resolve: (data: unknown) => void; reject: (error: Error) => void }>();

	private _upgradeCallbacks: Array<{ oldVersion: string; newVersion: string; callback: (...args: unknown[]) => Promise<void> }> = [];

	constructor(bridge: DesktopBridge) {
		this.bridge = bridge;

		this.bridge.on('monogatari:storage-response', (raw: unknown) => {
			const response = raw as { requestId: string; data?: unknown; error?: string };
			const pending = this._pendingRequests.get(response.requestId);

			if (pending) {
				this._pendingRequests.delete(response.requestId);

				if (response.error) {
					pending.reject(new Error(response.error));
				} else {
					pending.resolve(response.data);
				}
			}
		});
	}

	private sendRequest(channel: string, payload: Record<string, unknown>): Promise<unknown> {
		const requestId = nextRequestId();

		return new Promise((resolve, reject) => {
			this._pendingRequests.set(requestId, { resolve, reject });
			this.bridge.send(channel, { ...payload, requestId });
		});
	}

	private applyGetTransformations(key: string, value: unknown): unknown {
		let result = value;

		for (const transformation of Object.values(this._transformations)) {
			if (transformation.get) {
				result = transformation.get(key, result);
			}
		}

		return result;
	}

	private applySetTransformations(key: string, value: unknown): unknown {
		let result = value;
		for (const transformation of Object.values(this._transformations)) {
			if (transformation.set) {
				result = transformation.set(key, result);
			}
		}
		return result;
	}

	async get(key: string): Promise<unknown> {
		const raw = await this.sendRequest('monogatari:storage-get', { key });

		return this.applyGetTransformations(key, raw);
	}

	async set(key: string, value: unknown): Promise<unknown> {
		const transformed = this.applySetTransformations(key, value);
		await this.sendRequest('monogatari:storage-set', { key, value: transformed });
		const result = { key, value: transformed };

		for (const callback of this._callbacks.create) {
			callback(key, transformed);
		}

		return result;
	}

	async update(key: string, value: unknown): Promise<unknown> {
		const transformed = this.applySetTransformations(key, value);
		await this.sendRequest('monogatari:storage-update', { key, value: transformed });
		const result = { key, value: transformed };

		for (const callback of this._callbacks.update) {
			callback(key, transformed);
		}

		return result;
	}

	async remove(key: string): Promise<void> {
		await this.sendRequest('monogatari:storage-remove', { key });
		for (const cb of this._callbacks.delete) {
			cb(key, undefined);
		}
	}

	async getAll(): Promise<Record<string, unknown>> {
		const raw = await this.sendRequest('monogatari:storage-get-all', {}) as Record<string, unknown>;
		const result: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(raw)) {
			result[k] = this.applyGetTransformations(k, v);
		}
		return result;
	}

	async each(callback: (key: string, value: unknown) => unknown): Promise<unknown[]> {
		const all = await this.getAll();
		const results: unknown[] = [];
		for (const [key, value] of Object.entries(all)) {
			results.push(await callback(key, value));
		}
		return results;
	}

	async clear(): Promise<void> {
		await this.sendRequest('monogatari:storage-clear', {});
	}

	async key(index: number, _full?: boolean): Promise<string> {
		const allKeys = await this.keys(_full);
		return allKeys[index] ?? '';
	}

	async keys(_full?: boolean): Promise<string[]> {
		return await this.sendRequest('monogatari:storage-keys', {}) as string[];
	}

	async contains(key: string): Promise<void> {
		// Resolves if key exists, rejects if not (matches Space convention)
		await this.sendRequest('monogatari:storage-contains', { key });
	}

	async open(): Promise<this> {
		return this;
	}

	configuration(object?: Record<string, unknown> | null): Record<string, unknown> | undefined {
		if (object) {
			Object.assign(this._config, object);
			return this._config;
		}
		if (object === null) {
			return undefined;
		}
		return this._config;
	}

	async rename(_name: string): Promise<void> {
		// Not applicable for filesystem storage
	}

	async upgrade(oldVersion: string, newVersion: string, callback: (...args: unknown[]) => Promise<void>): Promise<this> {
		this._upgradeCallbacks.push({ oldVersion, newVersion, callback });
		return this;
	}

	onCreate(callback: (key: string, value: unknown) => void): void {
		this._callbacks.create.push(callback);
	}

	onUpdate(callback: (key: string, value: unknown) => void): void {
		this._callbacks.update.push(callback);
	}

	onDelete(callback: (key: string, value: unknown) => void): void {
		this._callbacks.delete.push(callback);
	}

	addTransformation(transformation: { id: string; get?: ((key: string, value: unknown) => unknown) | null; set?: ((key: string, value: unknown) => unknown) | null }): void {
		this._transformations[transformation.id] = transformation;
	}

	removeTransformation(id: string): void {
		delete this._transformations[id];
	}
}
