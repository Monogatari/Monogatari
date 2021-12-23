import AddPreviousStatementToShowHistory from './20211223-add-previous-statement-to-show-history';
import AddPauseStateToMediaState from './20200310-add-pause-state-to-media-state';

const migrations = [
	AddPauseStateToMediaState,
	AddPreviousStatementToShowHistory
];

const migrate = (save) => {
	migrations.forEach((migration) => {
		save = migration.apply(null, [save]);
	});

	return save;
};

export default migrate;