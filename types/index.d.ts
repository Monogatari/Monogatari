export class Monogatari {
	constructor();

	init(selector: string): Promise<void>;

	on(event: string, target: string | (() => void), callback?: () => void): void;
}

export as namespace monogatari;