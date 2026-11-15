import Component from '../../lib/Component';
declare class CenteredDialog extends Component {
    static tag: string;
    constructor();
    /**
     * Cleanup any running type-writer animation before removal
     */
    private _cleanupTypeWriter;
    willRollback(): Promise<void>;
    onReset(): Promise<void>;
    willUnmount(): Promise<void>;
    render(): string;
}
export default CenteredDialog;
//# sourceMappingURL=index.d.ts.map