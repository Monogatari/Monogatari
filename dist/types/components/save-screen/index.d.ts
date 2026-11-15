import { ScreenComponent } from '../../lib/ScreenComponent';
declare class SaveScreen extends ScreenComponent {
    static tag: string;
    static bind(_selector?: string): Promise<void>;
    onStateUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void>;
    render(): string;
}
export default SaveScreen;
//# sourceMappingURL=index.d.ts.map