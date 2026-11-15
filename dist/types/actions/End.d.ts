import Action from './../lib/Action';
export declare class End extends Action {
    static id: string;
    static bind(): Promise<void>;
    static matchString([action]: string[]): boolean;
    willApply(): Promise<void>;
    apply(): Promise<void>;
    willRevert(): Promise<void>;
}
export default End;
//# sourceMappingURL=End.d.ts.map