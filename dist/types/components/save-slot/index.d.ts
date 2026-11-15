import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
interface SaveSlotData {
    name?: string;
    date: string;
    image?: string;
    screenshot?: string;
    Engine?: {
        Scene: string;
    };
    Name?: string;
    Date?: string;
    game?: {
        state: {
            background?: string;
            scene?: string;
        };
    };
}
interface SaveSlotProps extends Properties {
    slot?: string;
    name: string;
    date: string;
    screenshot: string;
    image: string;
}
declare class SaveSlot extends Component<SaveSlotProps, Properties> {
    static tag: string;
    data: SaveSlotData | null;
    private _screenshotObjectUrl;
    static bind(): Promise<void>;
    constructor();
    willMount(): Promise<void>;
    willUnmount(): Promise<void>;
    render(): string;
}
export default SaveSlot;
//# sourceMappingURL=index.d.ts.map