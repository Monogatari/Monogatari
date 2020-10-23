/* global require */
const { contextBridge, ipcRenderer } = require('electron');

const allow = [
	'window-info-request',
	'window-info-reply',
	'resize-request',
	'resize-reply',
	'quit-request'
];

contextBridge.exposeInMainWorld ('electron', {
	send: (channel, data) => {
		if (allow.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	on: (channel, callback) => {
		if (allow.includes(channel)) {
			ipcRenderer.on(channel, (event, args) => {
				callback.call (null, args);
			});
		}
	},
});