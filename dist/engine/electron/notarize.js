/* eslint no-undef: off */

require ('dotenv').config ();

const { build: { appId }} = require('./../../package.json');

const { notarize } = require ('electron-notarize');

exports.default = async function notarizing (context) {
	const { electronPlatformName, appOutDir } = context;

	if (electronPlatformName !== 'darwin') {
		return;
	}

	const appName = context.packager.appInfo.productFilename;

	return await notarize({
		appBundleId: appId,
		appPath: `${appOutDir}/${appName}.app`,
		appleId: process.env.APPLEID,
		appleIdPassword: process.env.APPLEIDPASS,
		// ascProvider: process.env.APPLETEAM
	});
};