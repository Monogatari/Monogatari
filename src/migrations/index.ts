import AddPreviousStatementToShowHistory from './20211223-add-previous-statement-to-show-history';
import AddPauseStateToMediaState from './20200310-add-pause-state-to-media-state';

/**
 * Migration function type - transforms save data from old format to new format
 */
export type Migration = (save: Record<string, unknown>) => Record<string, unknown>;

/**
 * List of migrations to apply in order
 */
const migrations: Migration[] = [
	AddPauseStateToMediaState as unknown as Migration,
	AddPreviousStatementToShowHistory as unknown as Migration
];

/**
 * Apply all migrations to a save object
 * @param save - The save data to migrate
 * @returns The migrated save data
 */
const migrate = (save: Record<string, unknown>): Record<string, unknown> => {
	migrations.forEach((migration) => {
		save = migration(save);
	});

	return save;
};

export default migrate;

