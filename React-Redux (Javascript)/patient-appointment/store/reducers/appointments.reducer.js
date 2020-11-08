import * as Actions from '../actions';
import { SESSION_RATING } from '../actions';

const initialState = {
	entities: [],
	patients: [],
	bookedSlots: null,
	eventDialog: {
		type: 'new',
		props: {
			open: false
		},
		reschProps: {
			open: false
		},
		data: null
	},
	sessionRatting: null,
	canSendNewRequest: true,
	patientSessionRating: null,
	cannot_send_request_msg:null,
	is_profile_completed:null
};

const appointmentsReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_EVENTS: {
			const entities = action.payload.appointments.map(event => {
				console.log('events.....',event);
				const preferences = (isJSON(event.preferences) ? JSON.parse(event.preferences) : null );
				if (event.preferences && !event.start && !event.end) {
					// const preferences = JSON.parse(event.preferences);
					if (preferences.length > 0) {
						event.preferences = preferences;
						return {
							...event,
							start: preferences[0].start ? new Date(preferences[0].start) : null,
							end: preferences[0].end ? new Date(preferences[0].end) : null,
							title: (event.practitioner)?event.practitioner.user.name: 'N/A'

						};
					}
				}
				else{
					return {
						...event,
						start: event.start ? new Date(event.start) : null,
						end: event.end ? new Date(event.end) : null,
						title: (event.practitioner)?event.practitioner.user.name: 'N/A'
					};
				}
			});

			console.log('entities.....',entities);

			const patients = action.payload.patients.map(patient => ({
				...patient
			}));

			const bookedSlots = action.payload.booked_slots.map(slots => ({
				...slots
			}));

			const canSendNewRequest = (Number(action.payload.can_send_request)) ? true : false;
			const is_profile_completed = (Number(action.payload.is_profile_completed)) ? true : false;
			const cannot_send_request_msg = action.payload.cannot_send_request_msg ? action.payload.cannot_send_request_msg : null;
			const patientSessionRating = action.payload.session_rating;
			return {
				...state,
				// ...action.payload,
				entities,
				patients,
				bookedSlots,
				canSendNewRequest,
				cannot_send_request_msg,
				patientSessionRating,
				is_profile_completed
			};
		}
		case Actions.CAN_SEND_NEW_REQUEST: {
			if(Number(action.data))
			return {
				...state,
				canSendNewRequest: (Number(action.data))?true:false
			};
		}
		case Actions.OPEN_NEW_EVENT_DIALOG: {
			return {
				...state,
				eventDialog: {
					type: 'new',
					props: {
						open: true
					},
					reschProps: {
						open: false
					},
					data: {
						...action.data
					}
				}
			};
		}
		case Actions.OPEN_RSCH_APP_DIALOG: {
			return {
				...state,
				eventDialog: {
					type: 'new',
					props: {
						open: false
					},
					reschProps: {
						open: true
					},
					data: {
						...action.data
					}
				}
			}
		}
		case Actions.OPEN_MULTI_SLOTS_NEW_EVENT_DIALOG: {
			return {
				...state,
				eventDialog: {
					type: 'multi-slots',
					props: {
						open: true
					},
					reschProps: {
						open: false
					},
					data: {
						...action.data
					}
				}
			};
		}
		case Actions.SESSION_RATING: {
			if(!(action.payload)){
				return {
					...state,
					sessionRatting: null
				}
			}
			else{
				return {
					...state,
					sessionRatting: {
						...action.payload
					}
				}
			}

		}
		case Actions.CLOSE_NEW_EVENT_DIALOG: {
			return {
				...state,
				eventDialog: {
					type: 'new',
					props: {
						open: false
					},
					reschProps: {
						open: false
					},
					data: null
				}
			};
		}
		case Actions.OPEN_EDIT_EVENT_DIALOG: {
			return {
				...state,
				eventDialog: {
					type: 'edit',
					props: {
						open: true
					},
					reschProps: {
						open: false
					},
					data: {
						...action.data,
						start: action.data.start ? new Date(action.data.start) : null,
						end: action.data.end ? new Date(action.data.end) : null
					}
				}
			};
		}
		case Actions.CLOSE_EDIT_EVENT_DIALOG: {
			return {
				...state,
				eventDialog: {
					type: 'edit',
					props: {
						open: false
					},
					reschProps: {
						open: false
					},
					data: null
				}
			};
		}
		case Actions.SESSION_NOTES: {
			return {
				...state,
				eventDialog: {
					type: 'edit',
					props: {
						open: false
					},
					reschProps: {
						open: false
					},
					data: null
				}
			};
		}
		default: {
			return state;
		}
	}
};

function isJSON(str) {
	try {
		var obj = JSON.parse(str);
		if (obj && typeof obj === 'object' && obj !== null) {
			return true;
		}
	} catch (err) {}
	return false;
}

export default appointmentsReducer;
