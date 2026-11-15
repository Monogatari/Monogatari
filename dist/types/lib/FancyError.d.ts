import type { FancyErrorProps, QueuedError, ErrorTemplate, ErrorContext } from './types';
/**
 * FancyError provides a visual error display for development environments.
 * It shows detailed error information in a modal overlay with syntax highlighting.
 */
export declare class FancyError {
    static queue: QueuedError[];
    static registry: Map<string, ErrorTemplate>;
    /**
     * Check if we're in a development environment (file:// protocol or localhost)
     */
    private static isDevEnvironment;
    /**
     * Escape HTML entities to prevent XSS
     */
    private static escapeHtml;
    /**
     * Generate the modal HTML for an error
     */
    private static generateModalHtml;
    /**
     * Attach click handler to dismiss an error modal
     */
    private static attachDismissHandler;
    /**
     * Register an error template by ID.
     * IDs follow the convention: type:identifier:error_id (snake_case)
     * Examples:
     *   - action:jump:label_not_found
     *   - component:language_selection_screen:metadata_not_found
     *   - engine:translation:key_not_found
     */
    static register(id: string, template: ErrorTemplate): void;
    /**
     * Interpolate placeholders in a string with context values.
     * Placeholders use the format: {{key}}
     */
    private static interpolate;
    /**
     * Deep interpolate an object, replacing all string placeholders with context values.
     */
    private static interpolateProps;
    static pop(): void;
    /**
     * Show an error by registered ID with context, or with explicit title/message/props.
     *
     * Usage with registered error ID:
     *   FancyError.show('action:jump:label_not_found', { label: 'my_label', step: 5 });
     *
     * Usage with explicit parameters (legacy):
     *   FancyError.show('Error Title', 'Error message', { prop: 'value' });
     */
    static show(idOrTitle: string, contextOrMessage?: ErrorContext | string, propsArg?: FancyErrorProps): void;
    static render(props?: FancyErrorProps): string;
}
//# sourceMappingURL=FancyError.d.ts.map