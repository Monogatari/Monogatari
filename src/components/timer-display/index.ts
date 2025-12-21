import { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
import { Util } from '@aegis-framework/artemis';

export interface TimerDisplayProps extends Properties {
	callback: () => void;
	time: number;
	step: number;
	timer: ReturnType<typeof setTimeout> | null;
	tick: (() => void) | null;
}

export interface TimerDisplayState extends Properties {
	elapsed: number;
	remaining: number;
	value: number;
}

class TimerDisplay extends Component<TimerDisplayProps, TimerDisplayState> {
	static override tag: string = 'timer-display';

	constructor () {
		super ();

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

	override async willMount () {
    const { time } = this.props;

		this.setProps ({ step: time / 100 });
		this.setState ({ remaining: time });
	}

	override async didMount () {
    const tick = () => {
      this.setProps({
        timer: setTimeout (async () => {
          if (this.state.elapsed >= this.props.time) {
            await Util.callAsync (this.props.callback, this.engine);

            if (this.props.timer) {
              clearTimeout (this.props.timer);
            }

            if (this.parentNode) {
              this.element ().remove ();
            }

            return;
          }

          this.setState ({
            elapsed: this.state.elapsed + this.props.step,
            remaining: this.state.remaining - this.props.step,
            value: (1 - (this.state.elapsed / this.props.time)) * 100
          });

          this.forceRender ();
          this.props.tick?.();


        }, this.props.step)
      });
    };


		this.setProps ({ tick });

		this.props.tick?.();
	}

	override async willUnmount () {
		// Clean up timer to prevent memory leaks
		if (this.props.timer) {
			clearTimeout(this.props.timer);
		}

		return Promise.resolve ();
	}

	override async render () {
		return `
			<div style="width: ${this.state.value}%;"></div>
		`;
	}
}

export default TimerDisplay;