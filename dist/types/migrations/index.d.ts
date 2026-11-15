/**
 * Migration function type - transforms save data from old format to new format
 */
export type Migration = (save: Record<string, unknown>) => Record<string, unknown>;
/**
 * Apply all migrations to a save object
 * @param save - The save data to migrate
 * @returns The migrated save data
 */
declare const migrate: (save: Record<string, unknown>) => Record<string, unknown>;
export default migrate;
//# sourceMappingURL=index.d.ts.map