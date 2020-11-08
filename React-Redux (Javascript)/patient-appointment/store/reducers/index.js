import { combineReducers } from 'redux';
import events from './appointments.reducer';
import sessionNotes from './sessionNotes.reducer';

const reducer = combineReducers({
	events,
	sessionNotes
});

export default reducer;
