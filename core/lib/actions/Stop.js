import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { particlesJS } from 'particles.js';

export class Stop extends Action {

	static matchString ([ action ]) {
		return action === 'play';
	}

	constructor ([ action, type ]) {
		super ();

		this.type = type;

		if (this.type == 'music') {
			this.player = Monogatari.musicPlayer;
		} else if (this.type == 'sound') {
			this.player = Monogatari.soundPlayer;
		} else if (this.type == 'voice') {
			this.player = Monogatari.voicePlayer;
		} else if (this.type == 'video') {
			this.player = Monogatari.videoPlayer;
		}
	}

	willApply () {
		this.player.removeAttribute ('loop');
		return Promise.resolve ();
	}

	apply (advance) {
		if (this.type === 'particles') {
			Monogatari.action ('Particles').stop ();
		} else {
			this.player.pause ();
			this.player.removeAttribute ('loop');
			this.player.setAttribute ('src', '');
			this.player.currentTime = 0;

			if (this.type === 'music') {
				Monogatari.setting ('Song', '');
			} else if (this.type === 'sound') {
				Monogatari.setting ('Sound', '');
			}
		}

		if (advance) {
			Monogatari.next ();
		}

		return Promise.resolve ();
	}

	willRevert () {
		this.player.removeAttribute ('loop');
		return Promise.resolve ();
	}

	revert () {
		if (this.type === 'particles') {
			if (Monogatari.setting ('ParticlesHistory').length > 0) {
				const last_particles = Monogatari.setting ('ParticlesHistory').pop ();
				if (typeof Monogatari.action ('Particles').settings.particles[last_particles] !== 'undefined') {
					particlesJS (Monogatari.action ('Particles').settings.particles[last_particles]);
					Monogatari.setting ('Particles', last_particles);
				}
			}
		} else {

			let last;
			if (this.type === 'music') {
				Monogatari.setting ('Song', '');
				last = Monogatari.setting ('MusicHistory').pop ().split (' ');
			} else if (this.type === 'sound') {
				Monogatari.setting ('Sound', '');
				last = Monogatari.setting ('SoundHistory').pop ().split (' ');
			}

			if ('loop' in this.props) {
				this.player.setAttribute ('loop', '');
			}

			if (typeof  Monogatari.asset (this.type, last[2]) !== 'undefined') {
				Monogatari.musicPlayer.setAttribute('src', `assets/${this.type}/${Monogatari.asset (this.type, last[2])}`);
			} else {
				Monogatari.musicPlayer.setAttribute('src', `assets/${this.type}/` + last[2]);
			}

			if (this.type == 'music') {
				Monogatari.setting ('Song', last.join (' '));
			} else if (this.type == 'sound') {
				Monogatari.setting ('Sound', last.join (' '));
			}

			this.player.play ();
		}
		return Promise.resolve ();
	}
}

Stop.id = 'Stop';

Monogatari.registerAction (Stop);