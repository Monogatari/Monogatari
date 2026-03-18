export interface DesktopBridge {
	send(channel: string, data?: unknown): void;
	on(channel: string, callback: (args: unknown) => void): void;
}

export function getDesktopBridge(): DesktopBridge | null {
	if (typeof window.electron === 'object') return window.electron as DesktopBridge;
	if (typeof window.electrobun === 'object') return window.electrobun as DesktopBridge;
	return null;
}
