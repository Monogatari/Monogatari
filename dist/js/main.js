/**
 * ==============================
 * Your Javascript Code Goes Here
 * ==============================
 **/

'use strict';
/* global Monogatari */
/* global monogatari */

const { $_ready } = Monogatari;

monogatari.debug ().level (5);

$_ready (() => {
	monogatari.init ('#monogatari');
});