import Component from '../../lib/Component';
declare class AlertDialog extends Component {
    constructor();
    onPropsUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void>;
    willMount(): Promise<void>;
    render(): string;
}
export default AlertDialog;
//# sourceMappingURL=index.d.ts.map