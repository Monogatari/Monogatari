import type { Properties } from '@aegis-framework/pandora';
import Component from './Component';
import type { MenuButton } from './types';
/**
 * MenuComponent is a base class for menu-type components.
 * Menus manage a collection of buttons that can be dynamically added, removed, or reordered.
 *
 * @class MenuComponent
 * @template P - The type of the component's props (must extend Properties)
 * @template S - The type of the component's state (must extend Properties)
 */
declare class MenuComponent<P extends Properties = Properties, S extends Properties = Properties> extends Component<P, S> {
    static tag: string;
    /**
     * Add a button to the menu
     */
    static addButton(button: MenuButton): void;
    /**
     * Add a button after another button
     */
    static addButtonAfter(after: string, button: MenuButton): void;
    /**
     * Add a button before another button
     */
    static addButtonBefore(before: string, button: MenuButton): void;
    /**
     * Remove a button by its string identifier
     */
    static removeButton(string: string): void;
    /**
     * Get all buttons
     */
    static buttons(): MenuButton[];
    /**
     * Find a button by its string identifier
     */
    static button(string: string): MenuButton | undefined;
    /**
     * Called when configuration is updated - re-renders all instances
     */
    static onConfigurationUpdate(): Promise<void>;
    /**
     * Render the menu buttons
     */
    render(): string;
}
export { MenuComponent };
//# sourceMappingURL=MenuComponent.d.ts.map