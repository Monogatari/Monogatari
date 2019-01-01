import './vendor/prism.js';
import { FancyError } from '../core/lib/FancyError';
import { $_ready } from '@aegis-framework/artemis';

/* global window */

window.addEventListener('error', (event) => {
	const { message, lineno, filename } = event;

	// Once the DOM is ready, a Fancy Error will be shown providing more information
	$_ready (() => {
		FancyError.show (
			'An Unknown Error Occurred',
			message,
			{
				'File': filename,
				'Line': lineno,
				'Help': {
					'_': 'This is most likely a scripting error, please check your script and JavaScript code for missing commas or incorrect syntax.',
					'_1': 'There may be additional information on your browser’s console.'
				}
			}
		);
	});
});
