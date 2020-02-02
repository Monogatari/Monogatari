import { Component } from './../../lib/Component';
import { Util } from '@aegis-framework/artemis';

class TimerDisplay extends Component {

	constructor (...args) {
		super (...args);

		this.props = {
			callback: () => {},
			time: 0,
			step: 0,
			timer: null,
			tick: null
		};

		this.state = {
			elapsed: 0,
			remaining: 0,
			value: 100
		};
	}

	willMount () {
		this.setProps ({
			step: this.props.time / 100
		});

		this.setState ({
			remaining: this.props.time
		});

		return Promise.resolve ();
	}

	didMount () {
		this.setProps ({
			tick: () => {
				this.setProps({
					timer: setTimeout (() => {
						if (this.state.elapsed >= this.props.time) {
							Util.callAsync (this.props.callback, this.engine).then (() => {
								clearTimeout (this.props.timer);
								if (this.parentNode) {
									this.element ().remove ();
								}
							});
						} else {
							this.setState ({
								elapsed: this.state.elapsed + this.props.step,
								remaining: this.state.remaining - this.props.step,
								value: (1 - (this.state.elapsed / this.props.time)) * 100
							});

							this.forceRender ();
							this.props.tick ();
						}


					}, this.props.step)
				});
			}
		});

		this.props.tick ();

		return Promise.resolve ();
	}

	render () {
		return `
			<div style="width: ${this.state.value}%;"></div>
		`;
	}
}

TimerDisplay.tag = 'timer-display';


export default TimerDisplay;