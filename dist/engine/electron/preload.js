const { ipcRenderer } = require ('electron');

window.ipcRendererSend = function (...args) {
	return ipcRenderer.send (...args);
};

window.ipcRendererReceive = function (...args) {
	return ipcRenderer.on (...args);
};