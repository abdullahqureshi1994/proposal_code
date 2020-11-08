import axios from 'axios';
import moment from 'moment';
import { showMessage } from 'app/store/actions/fuse';
import * as Actions from '../../../sessions/store/actions/sessions.actions';

export const GET_EVENTS = '[CALENDAR APP] GET EVENTS';
export const OPEN_RSCH_APP_DIALOG = '[CALENDAR APP] OPEN RSCH APP DIALOG';
export const OPEN_NEW_EVENT_DIALOG = '[CALENDAR APP] OPEN NEW EVENT DIALOG';
export const CLOSE_NEW_EVENT_DIALOG = '[CALENDAR APP] CLOSE NEW EVENT DIALOG';
export const OPEN_EDIT_EVENT_DIALOG = '[CALENDAR APP] OPEN EDIT EVENT DIALOG';
export const CLOSE_EDIT_EVENT_DIALOG = '[CALENDAR APP] CLOSE EDIT EVENT DIALOG';
export const ADD_EVENT = '[CALENDAR APP] ADD EVENT';
export const UPDATE_EVENT = '[CALENDAR APP] UPDATE EVENT';
export const REMOVE_EVENT = '[CALENDAR APP] REMOVE EVENT';
export const OPEN_MULTI_SLOTS_NEW_EVENT_DIALOG = '[CALENDAR APP] OPEN MULTI SLOTS NEW EVENT DIALOG';
export const CAN_SEND_NEW_REQUEST = '[CALENDAR APP] CAN SEND NEW REQUEST';
export const SESSION_RATING = 'SESSION RATING';
export const SESSION_NOTES = 'SESSION NOTES';



export function getEvents() {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/appointment`);

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_EVENTS,
				payload: response.data
			});
		});
}
export function openMultiSlotsNewEventDialog(data) {
	return {
		type: OPEN_MULTI_SLOTS_NEW_EVENT_DIALOG,
		data
	};
}

export function openRescheduleAppointmentDialog(data) {
	return {
		type: OPEN_RSCH_APP_DIALOG,
		data
	};
}

export function openNewEventDialog(data) {
	return {
		type: OPEN_NEW_EVENT_DIALOG,
		data
	};
}

export function closeNewEventDialog() {
	return {
		type: CLOSE_NEW_EVENT_DIALOG
	};
}

export function openEditEventDialog(data) {
	return {
		type: OPEN_EDIT_EVENT_DIALOG,
		data
	};
}

export function closeEditEventDialog() {
	return {
		type: CLOSE_EDIT_EVENT_DIALOG
	};
}

export function addEvent(newEvent) {
	newEvent.start = moment(newEvent.start).format();
	newEvent.end = moment(newEvent.end).format();
	return (dispatch, getState) => {
		const request = axios.post(`${process.env.REACT_APP_API_URL}/api/appointment`, newEvent);

		return request.then(response =>
			Promise.all([
				dispatch({
					type: ADD_EVENT
				})
			]).then(() => dispatch(getEvents()).then(()=> {
				console.log('Response===',response);
				return dispatch(showMessage({ message: response.data, variant: 'info' }))
			}))
		);
	};
}
export function addMultiSlotEvent(newMultiSlotEvents, slot_length) {
	const temp = newMultiSlotEvents;
	for (let i = 0; i < newMultiSlotEvents.slots_length; i++) {
		temp[`start_${i}`] = moment(temp[`start_${i}`]).format();
		temp[`end_${i}`] = moment(temp[`end_${i}`]).format();
	}
	return (dispatch, getState) => {
		const request = axios.post(`${process.env.REACT_APP_API_URL}/api/multi-slots-appointment`, temp);

		return request.then(response =>
			Promise.all([
				dispatch({
					type: ADD_EVENT
				})
			]).then(() => dispatch(getEvents()).then(()=> {
				console.log('Response===',response);
				return dispatch(showMessage({ message: response.data, variant: 'info' }))
			}))
		).catch(error => {
			console.log('error===',error,error.response);
			if(error.response && error.response.data && typeof error.response.data == "string" ) {
				return dispatch(showMessage({ message: error.response.data, variant: 'error' }));
			}
			else if(error.response && error.response.data && error.response.data.message && typeof error.response.data.message == "string" ){
				return dispatch(showMessage({ message: error.response.data.message, variant: 'error' }));
			}
			else{
				// throw error.message;
				return dispatch(showMessage({ message: error.message, variant: 'error' }));
			}
		});
	};
}
export function updateEvent(event) {
	event.start = moment(event.start).format();
	event.end = moment(event.end).format();
	return (dispatch, getState) => {
		const request = axios.put(`${process.env.REACT_APP_API_URL}/api/appointment/${event.id}`, event);
		return request.then(response =>
			Promise.all([
				dispatch({
					type: UPDATE_EVENT
				})
			]).then(() => dispatch(getEvents()).then(()=> {
				console.log('Response===',response);
				return dispatch(showMessage({ message: response.data, variant: 'info' }))
			}))
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}

export function canSendNewRequest(patient_id=null) {
	return (dispatch, getState) => {
		const request = axios.get(process.env.REACT_APP_API_URL+`/api/can_send_request/${patient_id}`);

		return request.then(response =>
			Promise.all([
				dispatch({
					type: CAN_SEND_NEW_REQUEST
				})
			]).then(() => {
				return dispatch(getEvents());
			})
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}

export function isProfileCompleted(patient_id=null) {
	return (dispatch, getState) => {
		const request = axios.get(process.env.REACT_APP_API_URL+`/api/is_profile_completed/${patient_id}`);

		return request.then(response =>
			Promise.all([
				dispatch({
					type: CAN_SEND_NEW_REQUEST
				})
			]).then(() => {
				return dispatch(getEvents());
			})
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}

export function rescheduleAppointment(event) {
	event.status = 'reschedule';
	return (dispatch, getState) => {
		const request = axios.put(`${process.env.REACT_APP_API_URL}/api/reschedule_appointment/${event.appointmentId}`, event);
		return request.then(response =>
			Promise.all([
				dispatch({
					type: UPDATE_EVENT
				})
			]).then(() => dispatch(getEvents()).then(()=> {
				console.log('Response===',response);
				return dispatch(showMessage({ message: response.data, variant: 'info' }))
			}))
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}

export function removeAppointment(eventId,cancelComment) {
	return (dispatch, getState) => {
		const request = axios.get(`${process.env.REACT_APP_API_URL}/api/appointment_cancel_request/${eventId}?cancel_reason=${cancelComment}`);
		return request.then(response =>
			Promise.all([
				dispatch({
					type: REMOVE_EVENT
				})
			]).then(() => dispatch(getEvents()).then(()=> {
				console.log('Response===',response);
				return dispatch(showMessage({ message: response.data, variant: 'info' }))
			}))
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}
export function removeEvent(eventId) {
	return (dispatch, getState) => {
		const request = axios.delete(`${process.env.REACT_APP_API_URL}/api/appointment/${eventId}`);
		return request.then(response =>
			Promise.all([
				dispatch({
					type: REMOVE_EVENT
				})
			]).then(() => (
				Promise.all([
					dispatch(showMessage({ message: 'Appointment removed successfully.',variant:'success' })),
					dispatch(getEvents())
				])
				// dispatch(showMessage({ message: 'Appointment removed successfully.',variant:'success' }));
				// return dispatch(getEvents());
			)
		)
	).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}


export function saveSessionReviews(appointmentId,sessionReviews,value) {

	return (dispatch, getState) => {
		const request = axios.get(`${process.env.REACT_APP_API_URL}/api/save_session_reviews/${appointmentId}?review=${sessionReviews}&rating=${value}`);
		return request.then(response =>
			Promise.all([
				dispatch({
					type: UPDATE_EVENT
				})
			]).then(() => dispatch(getEvents()).then(()=> {
				console.log('Response===',response);
				return dispatch(showMessage({ message: response.data, variant: 'info' }))
			}))
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}

export function getSessionRating(appointmentId) {

	return (dispatch, getState) => {
		const request = axios.get(`${process.env.REACT_APP_API_URL}/api/get_session_rating/${appointmentId}`);
		return request.then(response =>
			Promise.all([
				dispatch({
					type: SESSION_RATING,
					payload: response.data
				})
			])
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}

export function getSessionNotes(appointmentId) {

	return (dispatch, getState) => {
		const request = axios.get(`${process.env.REACT_APP_API_URL}/api/get_session_notes/${appointmentId}`);
		return request.then(response =>
			Promise.all([
				dispatch({
					type: SESSION_NOTES,
					payload: response.data
				})
			])
		).catch(error => {
			if(error.response && error.response.status && error.response.status == 401){
				window.location.reload();
			}
		});
	};
}


