import { useForm } from '@fuse/hooks';
import _ from '@lodash';
import FuseUtils from '@fuse/utils/FuseUtils';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { DateTimePicker } from '@material-ui/pickers';
import moment from 'moment';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import * as Actions from './store/actions';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Chip from '@material-ui/core/Chip';

const defaultFormState = {
	id: FuseUtils.generateGUID(),
	patient_notes: '',
	practitioner_notes: '',
	status: 'pending',
	start: moment(new Date(), 'MM/DD/YYYY'),
	end: moment(new Date(), 'MM/DD/YYYY'),
	desc: '',
	practitioner: {},
	patient_id: '',
	preferences:[]

};

const defaultMultiSlotsFormState = {
	id: FuseUtils.generateGUID(),
	patient_notes: '',
	practitioner_notes: '',
	status: 'pending',
	desc: '',
	practitioner: {},
	patient_id: '',
	preferences:[]

};

function EventDialog(props) {
	const dispatch = useDispatch();
	const eventDialog = useSelector(({ patientAppointment }) => patientAppointment.events.eventDialog);

	console.log('eventDialog.........',eventDialog);

	const patients = useSelector(({ patientAppointment }) => patientAppointment.events.patients);
	const user = useSelector(({ auth }) => auth.user);

	const { form, handleChange, setForm, setInForm } = useForm(defaultFormState);
	const start = moment(form.start, 'MM/DD/YYYY');
	const end = moment(form.end, 'MM/DD/YYYY');
	const [value, setValue] = React.useState('');
	let bgColor = '';
	let color = '';

	// console.log
	const handleRadioChange = (event) => {
		setValue(event.target.value);
		console.log('event.target.value>...............',event.target.value);
		setForm({
			...form,
			start:form.preferences[Number(event.target.value) - 1].start,
			end:form.preferences[Number(event.target.value) - 1].end
		});
	};

	const initDialog = useCallback(() => {
		/**
		 * Dialog type: 'edit'
		 */
		console.log('type.......',eventDialog.type);

		if (eventDialog.type === 'edit' && eventDialog.data) {
			setForm({ ...eventDialog.data });
			console.log('form..........',form,eventDialog.data);
		}
		/**
		 * Dialog type: 'new'
		 */
		if (eventDialog.type === 'new') {
			setForm({
				...defaultFormState,
				...eventDialog.data,
				id: FuseUtils.generateGUID()
			});
		}

		if (eventDialog.type === 'multi-slots') {
			const { slots } = eventDialog.data;
			const form_data = {};
			for (let i = 0; i < slots.length; i++) {
				form_data[`start_${i}`] = slots[i].start;
				form_data[`end_${i}`] = slots[i].end;
			}
			console.log('form_data============>', form_data);
			setForm({
				...defaultMultiSlotsFormState,
				...form_data,
				id: FuseUtils.generateGUID()
			});
		}
	}, [eventDialog.data, eventDialog.type, setForm]);

	console.log('[form..........',form,eventDialog.data);
	console.log('bgColor....',bgColor,color);

	useEffect(() => {
		/**
		 * After Dialog Open
		 */
		if (eventDialog.props.open) {
			initDialog();
		}
	}, [eventDialog.props.open, initDialog]);

	function closeComposeDialog() {
		return eventDialog.type === 'edit'
			? dispatch(Actions.closeEditEventDialog())
			: dispatch(Actions.closeNewEventDialog());
	}

	function canBeSubmitted() {
		return true;
	}

	function canBeReschedule() {
		return eventDialog.type === 'edit' && !_.isEqual(eventDialog.data, form);
	}

	function handleSubmit(event) {
		event.preventDefault();
		let dispatchPromise;
		if (eventDialog.type === 'new') {
			dispatchPromise = dispatch(Actions.addEvent(form));
		} else if (eventDialog.type === 'multi-slots') {
			const temp_data = form;
			temp_data.slots_length = eventDialog.data.slots.length;
			dispatchPromise =dispatch(Actions.addMultiSlotEvent(temp_data));
		} else {
			dispatchPromise = dispatch(Actions.updateEvent(form));
		}
		closeComposeDialog();
	}

	function handleReschedule() {
		if (eventDialog.type === 'edit') {
			dispatch(Actions.rescheduleAppointment(form));
		}
		dispatch(Actions.getEvents());

		closeComposeDialog();
	}

	function handleRemove() {
		dispatch(Actions.removeEvent(form.id));
		closeComposeDialog();
	}

	if (!patients || !eventDialog) {
		return <FuseLoading />;
	}

	return (
		<Dialog {...eventDialog.props} onClose={closeComposeDialog} fullWidth maxWidth="xs" component="form">
			<AppBar position="static">
				<Toolbar className="flex w-full">
					<Typography variant="subtitle1" color="inherit">
						{eventDialog.type === 'new' ? 'New Appointment' : 'Appointment Request'}
					</Typography>
				</Toolbar>
			</AppBar>

			<form noValidate onSubmit={handleSubmit}>
				<DialogContent classes={{ root: 'p-16 pb-0 sm:p-24 sm:pb-0' }}>
					{eventDialog.type === 'multi-slots' && (
						<Typography variant="body1" gutterBottom>{ user.user_setting.new_appointment_request.replace("{pref_count}", eventDialog.data.slots.length ) }</Typography>
					)}
					{user && user.role !== 'patient' && (
						<TextField
							className="mt-8 mb-16"
							// id="patient_id"
							error={form.patient_id === ''}
							name="patient_id"
							autoFocus
							required
							onChange={handleChange}
							label="Patient"
							type="text"
							value={form.patient_id}
							variant="outlined"
							fullWidth
							select
						>
							{patients.map(item => (
								<MenuItem key={`patient_${item.id}`} value={item.id}>
									{item.name}
								</MenuItem>
							))}
						</TextField>
					)}
					{user && user.role !== 'patient' && (
						<TextField
							className="mt-8 mb-16"
							// id="patient_id"
							name="status"
							autoFocus
							required
							onChange={handleChange}
							label="Status"
							type="text"
							value={form.status}
							variant="outlined"
							fullWidth
							select
						>
							<MenuItem value="pending">Pending</MenuItem>
							<MenuItem value="approved">Approved</MenuItem>
							<MenuItem value="unapproved">Unapproved</MenuItem>
							<MenuItem value="reschedule">Reschedule</MenuItem>
							<MenuItem value="cancel">Cancel</MenuItem>
							<MenuItem value="canceled">Canceled</MenuItem>
							<MenuItem value="completed">Completed</MenuItem>
						</TextField>
					)}

					{/* {user && user.role != 'patient' && form.preferences && ( */}
					{/*	*/}
					{/* )} */}

					{eventDialog.type === 'multi-slots' &&
						eventDialog.data.slots.map((item, index) => {
							const counter = index + 1;
							return (
								<div>
									<Typography variant="subtitle1" gutterBottom>
										{`${`(${counter})` + '  '}${moment(form[`start_${index}`]).format(
											'ddd, DD MMM YYYY, HH:mm'
										)}-${moment(form[`end_${index}`]).format('HH:mm')}`}
									</Typography>
								</div>
							);
						})
					}

					{/*{(form.status === 'reschedule' || form.status == 'pending') && user.role !== 'patient' &&*/}
					{/*(JSON.parse(form.preferences)).map((item, index) => {*/}
					{/*		const counter = index + 1;*/}
					{/*		return (*/}
					{/*			<div>*/}
					{/*				<Typography variant="subtitle1" gutterBottom>*/}
					{/*					{`${`(${counter})` + '  '}${moment(item.start).format(*/}
					{/*						'ddd, DD MMM YYYY, HH:mm'*/}
					{/*					)}-${moment(item.end).format('HH:mm')}`}*/}
					{/*				</Typography>*/}
					{/*			</div>*/}
					{/*		);*/}
					{/*	})*/}
					{/*}*/}

					{eventDialog.type !== 'multi-slots' && user.role == 'patient' &&(
						<div>
							<Typography variant="subtitle1" gutterBottom>Status:  <span className={'badge '+form.status} >{form.status}</span></Typography>
							{(form.status === 'approved' || form.status === 'completed') && (
								<div>
									<Typography variant="subtitle1" gutterBottom>Approved Slot:</Typography>
									<Typography variant="body1" gutterBottom>
										{(form.start && form.end) ? moment(form.start).format(
											'ddd, DD MMM YYYY, HH:mm'
										) + " - " + moment(form.end).format('HH:mm') : 'N/A'}
									</Typography>
								</div>
							)}

							{form.preferences && (
								<div>
									<Typography variant="subtitle1" gutterBottom>Preferences:</Typography>
									{Array.isArray(form.preferences) ? form.preferences.map((item,key)=>(
										<Typography variant="body1" gutterBottom>
											{`(${key+1})` + '  '+moment(item.start).format(
												'ddd, DD MMM YYYY, HH:mm'
											) +" - "+ moment(item.end).format('HH:mm')}
										</Typography>
									)):
									(JSON.parse(form.preferences)).map((item,key)=>(
										<Typography variant="body1" gutterBottom>
											{`(${key+1})` + '  '+moment(item.start).format(
												'ddd, DD MMM YYYY, HH:mm'
											) +" - "+ moment(item.end).format('HH:mm')}
										</Typography>
									))
									}
									<br/>
								</div>
							)}
						</div>
					)}

					{eventDialog.type !== 'multi-slots' && user.role !== 'patient' && (
						<div>
							<DateTimePicker
								label="Start"
								inputVariant="outlined"
								value={moment(form.start).toLocaleString()}
								onChange={date => setInForm('start', date)}
								className="mt-8 mb-16 w-full"
								maxDate={form.end}
							/>
							<DateTimePicker
								label="End"
								inputVariant="outlined"
								value={moment(form.end).toLocaleString()}
								onChange={date => setInForm('end', date)}
								className="mt-8 mb-16 w-full"
								minDate={form.start}
							/>
						</div>
					)}
					{eventDialog.type !== 'multi-slots' && user.role != 'patient' && form.preferences &&
						(
							<div>
								<Typography variant="subtitle1" gutterBottom>Select suitable time slot:</Typography>
								<RadioGroup aria-label="quiz" name="quiz" value={value} onChange={handleRadioChange} >
									{form.preferences.map((item, index) => {
										const counter = index + 1;
										return (
											<FormControlLabel value={`${counter}`} control={<Radio/>}
															  label={`${`(${counter})` + '  '}${moment(item.start).format(
																  'ddd, DD MMM YYYY, HH:mm'
															  )}-${moment(item.end).format('HH:mm')}`}/>
										);
									})}
								</RadioGroup>
							</div>
						)
					}
					<TextField
						className="mt-8 mb-16"
						id="patient_notes"
						label="Patient Notes"
						type="text"
						name="patient_notes"
						value={form.patient_notes ? form.patient_notes : ''}
						onChange={handleChange}
						multiline
						rows={5}
						variant="outlined"
						fullWidth
						disabled={user.role === 'practitioner'}
					/>
					{/*<TextField*/}
					{/*	className="mt-8 mb-16"*/}
					{/*	id="practitioner_notes"*/}
					{/*	label="Practitioner Notes"*/}
					{/*	type="text"*/}
					{/*	name="practitioner_notes"*/}
					{/*	value={form.practitioner_notes ? form.practitioner_notes : ''}*/}
					{/*	onChange={handleChange}*/}
					{/*	multiline*/}
					{/*	rows={5}*/}
					{/*	variant="outlined"*/}
					{/*	fullWidth*/}
					{/*	disabled={user.role === 'patient'}*/}
					{/*/>*/}
					{/*<FormControlLabel*/}
					{/*	className="ml-0"*/}
					{/*	value="start"*/}
					{/*	control={*/}
					{/*		<div>*/}
					{/*			<Checkbox*/}
					{/*				color="primary"*/}
					{/*				size="small"*/}
					{/*				inputProps={{ 'aria-label': 'checkbox with small size' }}*/}
					{/*			/>*/}
					{/*			<Typography>Schedule slot for future consultations</Typography>*/}
					{/*			<Select*/}
					{/*				labelId="demo-simple-select-label"*/}
					{/*				id="demo-simple-select"*/}
					{/*				value=""*/}
					{/*			>*/}
					{/*				<MenuItem value={10}>Ten</MenuItem>*/}
					{/*				<MenuItem value={20}>Twenty</MenuItem>*/}
					{/*				<MenuItem value={30}>Thirty</MenuItem>*/}
					{/*			</Select>*/}
					{/*		</div>*/}
					{/*	}*/}
					{/*	label="Schedule slot for future consultations"*/}
					{/*	labelPlacement="start"*/}
					{/*/>*/}
					<Typography variant="body1" >Schedule slot for future consultations.</Typography>
					<br/>
				</DialogContent>

				{eventDialog.type === 'new' ? (
					<DialogActions className="justify-between px-8 sm:px-16">
						<Button variant="contained" color="primary" type="submit" disabled={!canBeSubmitted()}>
							Add
						</Button>
					</DialogActions>
				) : (
					<DialogActions className="justify-between px-8 sm:px-16">
						<Button variant="contained" color="primary" type="submit" disabled={!canBeSubmitted()}>
							Send
						</Button>
					</DialogActions>
				)}
			</form>
		</Dialog>
	);
}

export default EventDialog;
