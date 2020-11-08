import * as Actions from '../actions';

const initialState = {
	data: null
};

const sessionNotesReducer = (state = initialState, action) => {
	switch (action.type) {

		case Actions.SESSION_NOTES: {
			console.log('Session_notes---',action)
			return {
				...state,
				data: action.payload
			};
		}
		default: {
			return state;
		}
	}
};

export default sessionNotesReducer;
