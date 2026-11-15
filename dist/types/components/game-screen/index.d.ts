import ScreenComponent from '../../lib/ScreenComponent';
declare class GameScreen extends ScreenComponent {
    static shouldProceed(): Promise<void>;
    static bind(): Promise<void>;
    didMount(): Promise<void>;
    render(): string;
}
export default GameScreen;
//# sourceMappingURL=index.d.ts.map