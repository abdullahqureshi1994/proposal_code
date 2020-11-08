import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { DateTimePicker,DatePicker } from '@material-ui/pickers';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDeepCompareEffect, useForm } from '@fuse/hooks';
import FuseUtils from '@fuse/utils';
import * as Actions from './store/actions';
import './CalendarApp.css';
import { showMessage } from '../../store/actions/fuse';
import EventDialog from './EventDialog';
import _ from '@lodash';
import Alert from '@material-ui/lab/Alert';
import { Link } from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import Box from '@material-ui/core/Box';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import sessionNotes from './store/reducers/sessionNotes.reducer';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
	root: {
		width: '100%'
	},
	button: {
		marginTop: theme.spacing(1),
		marginRight: theme.spacing(1)
	},
	actionsContainer: {
		marginBottom: theme.spacing(2)
	},
	resetContainer: {
		padding: theme.spacing(3)
	},
	dot: {
		height: '20px',
		width: '20px',
		backgroundColor: '#bbb',
		borderRadius: '50%',
		display: 'inline-block',
		paddingLeft: '20px',
		textTransform: 'capitalize'
	},
	bgRed: {
		backgroundColor: 'red'
	},
	bgOrange: {
		backgroundColor: 'orange'
	},
	bgGreen: {
		backgroundColor: 'green'
	},
	bgBlack: {
		backgroundColor: '#000000'
	},
	bgYellow: {
		backgroundColor: '#ffeb3b'
	},
	bgGoldenrod: {
		backgroundColor: 'goldenrod'
	},
	formControl: {
		width: '100%'
	},
	prefLabel: {
		margin: '10px 0px 10px 0px'
	}
}));

function getSteps() {
	return ['Select campaign settings', 'Create an ad group', 'Create an ad'];
}

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
	tags: [],
	pref_date_1: moment(new Date(), 'MM/DD/YYYY'),
	pref_slot_1: moment(new Date(),'HH:mm'),
	pref_date_2: moment(new Date(), 'MM/DD/YYYY'),
	pref_slot_2: moment(new Date(),'HH:mm'),
	pref_date_3: moment(new Date(), 'MM/DD/YYYY'),
	pref_slot_3: moment(new Date(),'HH:mm')
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

function ScheduledAppointments(props) {

	const dispatch = useDispatch();
	const classes = useStyles();
	const [activeStep, setActiveStep] = React.useState(2);
	const steps = getSteps();
	const eventDialog = useSelector(({ patientAppointment }) => patientAppointment.events.eventDialog);
	const { form, handleChange, setForm, setInForm } = useForm(defaultFormState);
	const [open, setOpen] = React.useState(false);
	const [notAvailSlot, setNotAvailSlot] = React.useState({});
	const [appointmentId, setAppointmentId] = React.useState(0);
	const [cancelComment, setCancelComment] = React.useState('');
	const user = useSelector(({ auth }) => auth.user);
	const [openRatingForm, setOpenRatingForm] = React.useState(0);
	const [sessionReviews, setSsessionReviews] = React.useState('');
	const [value, setValue] = React.useState(0);

	const [openSessionNotesForm, setOpenSessionNotesForm] = React.useState(0);
	const [appSessionNotes, setAppSessionNotes] = React.useState(0);

	const [openViewRatingForm, setOpenViewRatingForm] = React.useState(0);
	const [sessionShowReviews, setSessionShowReviews] = React.useState('');
	const [showValue, setShowValue] = React.useState(0);

	const sessionRating = useSelector(({ patientAppointment }) => patientAppointment.events.sessionRatting);
	const patientSessionRating = useSelector(({ patientAppointment }) => patientAppointment.events.patientSessionRating);

	console.log('patientSessionRating.........',patientSessionRating);
	console.log('sessionRating.........',sessionRating);
	console.log('eventDialog.........',eventDialog);

	const handleCancelComment = (event) =>{
		setCancelComment(event.target.value);
	};

	const handleSessionReviews = (event) =>{
		setSsessionReviews(event.target.value);
	};

	const handleSessionNotesFormClose = () => {
		setOpenSessionNotesForm(0);
	}

	const handleClickOpen = (id) => {
		setAppointmentId(id);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const slotOptions = ['Sea', 'Sky', 'Forest', 'Aerial', 'Art'].map(item => ({
		value: item,
		label: item
	}));

	const bookedSlots = useSelector(({ patientAppointment }) => {
		return patientAppointment.events.bookedSlots;
	});

	const cannot_send_request_msg = useSelector(({ patientAppointment }) => {
		return patientAppointment.events.cannot_send_request_msg;
	});

	const is_profile_completed = useSelector(({ patientAppointment }) => {
		return patientAppointment.events.is_profile_completed;
	});

	const sessionNotes = useSelector(({ patientAppointment }) => {
		return patientAppointment.sessionNotes.data;
	});

	console.log('sessionNotes--------', sessionNotes);
	console.log('eventDialog............', eventDialog);

	const events = useSelector(({ patientAppointment }) => {
		console.log('patientAppointment......',patientAppointment);
		patientAppointment.events.entities.map(item => {
			if (item && item.practitioner && item.practitioner.user && item.practitioner.user.name) {
				item.practitioner = item.practitioner.user.name;
			}
			return item;
		});
		return patientAppointment.events.entities;
	});

	console.log('events............', events);

	function handleSubmit(event) {
		event.preventDefault();
		dispatch(Actions.rescheduleAppointment(form));
		closeComposeDialog();
	}

	const handleSelectChange = (event) => {
		let tags = form.tags;
		tags.push(event.target.value[0]);
		setForm({
			...form,
			tags: tags
		});
	};

	const initDialog = useCallback(() => {
		console.log('initDialog...........',eventDialog);
		if (eventDialog.type === 'edit' && eventDialog.data) {
			setForm({ ...eventDialog.data });
		}

		if (eventDialog.type === 'new') {
			setForm({
				...defaultFormState,
				...eventDialog.data,
				id: FuseUtils.generateGUID()
			});
		}
	}, [eventDialog.data, eventDialog.type, setForm]);

	function closeComposeDialog() {
		return eventDialog.type === 'edit'
			? dispatch(Actions.closeEditEventDialog())
			: dispatch(Actions.closeNewEventDialog());
	}
	const handleNext = () => {
		setActiveStep(prevActiveStep => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep(prevActiveStep => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	const handleRatingFormClose = () => {
		setOpenRatingForm(0);
	};

	const handleViewRatingFormClose = () => {
		setOpenViewRatingForm(0);
	}

	if(sessionRating){
		if(showValue !== sessionRating.rating)
			setShowValue(sessionRating.rating);

		if(sessionShowReviews !== sessionRating.reviews)
			setSessionShowReviews(sessionRating.reviews);
	}
	else{
		if(showValue !== 0)
			setShowValue(0);

		if(sessionShowReviews !== '')
			setSessionShowReviews('');
	}

	console.log('sessionRating value...',value);
	console.log('sessionRating sessionReviews...',sessionReviews);

	useDeepCompareEffect(() => {
		console.log('sessionRating----Deep');
		if(sessionRating){
			setValue(sessionRating.rating);
			setSsessionReviews(sessionRating.reviews);
		}
	}, [dispatch,]);

	useEffect(() => {
		dispatch(Actions.getEvents());
		if (eventDialog.reschProps.open) {
			initDialog();
		}
	}, [eventDialog.reschProps.open, initDialog]);

	useEffect(() => {
		console.log('Test_Session___',sessionNotes);
		setAppSessionNotes(sessionNotes);
	},[sessionNotes])

	function handleSlot(event) {

		handleChange(event);
		console.log('event_______',event.target.name,event.target.value);
		let temp_val = JSON.parse(event.target.value);

		let tmp = {};
		let temp = notAvailSlot;
		temp[event.target.name] = moment(temp_val.start,'HH:mm DD-MM-YYYY').toLocaleString();
		setNotAvailSlot(temp);
		return true;
	}


	const get_slots = (date = new Date()) => {
		console.log('date.............',date);
		date = new Date(date);
		let initialDate = {};
		var diff = moment.duration(moment((new Date()).toLocaleString()).add(1, 'hour').diff((date).toLocaleString()));
		if(diff.asHours() <= 0){
			initialDate = moment((date).toLocaleString());
		}
		else{
			let minutes_left = 60 - Number(moment((new Date()).toLocaleString()).format('mm'));
			initialDate = moment((new Date()).toLocaleString()).add(minutes_left,'minutes');
		}

		let from = moment(initialDate).toLocaleString();
		let to = moment(initialDate).add(1,'hours').toLocaleString();
		let slots = [];

		while (true){
			let bookStatus = (bookedSlots && bookedSlots.find(slot => {
				return moment(from).diff(moment(slot.start), 'seconds') === 0;
			}));

			if(!bookStatus) {
				slots.push({
					value: moment(from).format('DD MMM, YYYY HH:mm') + ' - ' + moment(to).format('HH:mm'),
					start: moment(from).format('HH:mm DD-MM-YYYY'),
					end: moment(to).format('HH:mm DD-MM-YYYY'),
				});
			}
			let to_var = moment(to);
			let diff = moment.duration(moment((date).toDateString()).add(1, 'day').diff(to_var.add(1, 'hour')));
			if (diff.asSeconds() < -60) {
				break;
			}
			from = moment(to);
			to = moment(to).add(1, 'hours');

		}
		return slots;
	}
	let prevStatus = '';

	if(!patientSessionRating){
		return <FuseLoading />;
	}
	return (
		<div className={classes.root}>
			<Stepper orientation="vertical">
				{cannot_send_request_msg && (
					<div>
						<Alert severity="warning">
							{is_profile_completed ?
							(
								<>
									{cannot_send_request_msg+' Go to '}
									<Link href="javascript:void(0)" onClick={()=>props.history.push('/patient-forms')}>Pre-Counselling Form</Link>
								</>
							) :
							(
								<>
									{cannot_send_request_msg+' Go to '}
									<Link href="javascript:void(0)" onClick={()=>props.history.push('/profile')}>Profile</Link>
								</>
							)}
						</Alert>
						<br/>
					</div>)}
				{events.map((item, index) => {
					if(prevStatus === 'pending' || prevStatus === 'reschedule'){
						return;
					}
					console.log('prevStatus.......',prevStatus);
					console.log('event_item.....',events);
					let bgColor = '';
					switch (item.status) {
						case 'completed':
							bgColor = classes.bgGreen;
							break;
						case 'pending':
							bgColor = classes.bgYellow;
							break;
						case 'reschedule':
							bgColor = classes.bgOrange;
							break;
						case 'unapproved':
							bgColor = classes.bgRed;
							break;
						case 'approved':
							bgColor = classes.bgGreen;
							break;
						case 'cancel':
							bgColor = classes.bgGoldenrod;
							break;
						default:
							break;
					}
					prevStatus = item.status;

					return (
						<Step key={index}>
							<StepLabel>
								<Grid container spacing={3} direction="row" justify="space-between" alignItems="center">
									<Grid item xs align="center">
										<Button
											onClick={()=> dispatch(Actions.openEditEventDialog(item))}
										>
											{`${moment(item.start).format('HH:mm')} - ${moment(item.end).format(
												'HH:mm DD MMM, YYYY'
											)}`}
										</Button>
									</Grid>
									<Grid item xs align="left">
										<div style={{display:'inline-flex'}}>
											<span className={`${classes.dot} ${bgColor}`}></span>
											<span style={{textTransform:'capitalize'}} >
												&nbsp;&nbsp;&nbsp;{`${(item.status === 'reschedule' || item.status === 'cancel')?item.status + ' Request':item.status}`}
												{(item.status == 'canceled' && item.canceled_by_user_id && item.canceled_by)? ` [${item.canceled_by.name} (${(item.canceled_by.roles)?item.canceled_by.roles[0].name:''})]` : ''}
											</span>
										</div>
									</Grid>
									<Grid item xs align="center">
										{item.status === 'completed' && patientSessionRating.indexOf(item.id) == -1  && (
											<Button
												size="small"
												color="primary"
												variant="contained"
												className={`${classes.button} m-0`}
												onClick={()=> {
													setAppointmentId(item.id);
													setOpenSessionNotesForm(1);
													dispatch(Actions.getSessionNotes(item.id)).then(()=>{
														console.log('Session__Notes....',sessionNotes);
													});
												} }
											>
												View Session Notes
											</Button>
										)}
									</Grid>
									<Grid item xs align="center">
										{(item.status === 'reschedule' || item.status === 'pending' || item.status === 'approved') && (
											<Button
												size="small"
												variant="contained"
												className={`${classes.button} m-0`}
												onClick={()=> (handleClickOpen(item.id))}
											>
												Cancel Request
											</Button>
										)}
										&nbsp;&nbsp;&nbsp;&nbsp;
										{(item.status === 'reschedule' || item.status === 'pending' || item.status === 'approved') && (
											<Button
													size="small"
													variant="contained"
													color="primary"
													className={`${classes.button} m-0`}
													onClick={()=> dispatch(
																Actions.openRescheduleAppointmentDialog({appointmentId:item.id})
														)}
												>
													Reschedule
											</Button>
										)}
										{item.status === 'completed' && patientSessionRating.indexOf(item.id) == -1  && (
											<Button
												size="small"
												color="secondary"
												variant="contained"
												className={`${classes.button} m-0`}
												onClick={()=> {
													setAppointmentId(item.id);
													setOpenRatingForm(1);
													dispatch(Actions.getSessionRating(item.id)).then(()=>{
														console.log('Session__Rating....',sessionRating);
													});
												} }
											>
												Fill Session Ratting Form
											</Button>
										)}
										{item.status === 'completed' && patientSessionRating.indexOf(item.id) != -1  && (
											<Button
												size="small"
												color="secondary"
												variant="contained"
												className={`${classes.button} m-0`}
												onClick={()=> {
													setAppointmentId(item.id);
													setOpenViewRatingForm(1);
													dispatch(Actions.getSessionRating(item.id)).then(()=>{
														console.log('Session__Rating....',sessionRating);
													});
												}}
											>
												View Session Ratting Form
											</Button>
										)}
									</Grid>
								</Grid>
							</StepLabel>
						</Step>
					);
				})}
			</Stepper>
			<EventDialog />
			{/* Reschedule Appointment */}
			<Dialog {...eventDialog.reschProps} onClose={closeComposeDialog} fullWidth maxWidth="xs" component="form" >
				<AppBar position="static">
					<Toolbar className="flex w-full">
						<Typography variant="subtitle1" color="inherit">
							{'Reschedule Appointment'}
						</Typography>
					</Toolbar>
				</AppBar>
				<form onSubmit={handleSubmit} >
					<DialogContent classes={{ root: 'p-16 pb-0 sm:p-24 sm:pb-0' }}>
						{eventDialog.type === 'multi-slots' && (
							<Typography variant="body1" gutterBottom>
								You're about to send your {eventDialog.data.slots.length} preferred slot(s) with Dr.
								Tabinda. Your slot(s) in order of preferences are:
							</Typography>
						)}
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
							})}
						{/*{eventDialog.type !== 'multi-slots' && (
							<div>
								<DateTimePicker
									label="Start"
									inputVariant="outlined"
									value={form.start}
									onChange={date => setInForm('start', date)}
									className="mt-8 mb-16 w-full"
									maxDate={form.end}
								/>
								<DateTimePicker
									label="End"
									inputVariant="outlined"
									value={form.end}
									onChange={date => setInForm('end', date)}
									className="mt-8 mb-16 w-full"
									minDate={form.start}
								/>
							</div>
						)}*/}
						{/*{[1, 2, 3].map((item) => (*/}
						{ _.times(Number(user.user_setting.patient_min_app_pref_req), (i) => {
							let item = i+1;
							return (
							<div>
								<InputLabel className={classes.prefLabel}>Preferences {item}</InputLabel>
								<DatePicker
									label="Date"
									format="DD MMM, YYYY"
									inputVariant="outlined"
									name={`pref_date_${item}`}
									value={form[`pref_date_${item}`]}
									onChange={date => {
										console.log('date_on Change....',date);
										return setInForm(`pref_date_${item}`, date.format('DD MMM, YYYY'));
									}}
									className="mt-8 mb-16 w-full"
									required
								/>
								<FormControl required variant="outlined" className={classes.formControl}>
									<InputLabel id="demo-simple-select-outlined-label">Slot</InputLabel>
									<Select
										labelId="demo-simple-select-outlined-label"
										id="demo-simple-select-outlined"
										value={form[`pref_slot_${item}`]}
										name={`pref_slot_${item}`}
										onChange={handleSlot}
										label="Slot"
									>
										<MenuItem value="">
											<em>None</em>
										</MenuItem>
										{/*form[`pref_date_${item}`]*/}
										{get_slots(form[`pref_date_${item}`]).length && get_slots(form[`pref_date_${item}`]).map(slot => {
											console.log('___________slot------',slot);
											return (<MenuItem value={JSON.stringify(slot)}>{slot.value}</MenuItem>);
										})}
										{/*<MenuItem value={10}>Ten</MenuItem>*/}
										{/*<MenuItem value={20}>Twenty</MenuItem>*/}
										{/*<MenuItem value={30}>Thirty</MenuItem>*/}
									</Select>
								</FormControl>
							</div>
						)})}
						<br/>
						<TextField
							className="mt-8 mb-16"
							id="reschedule_reason"
							label="Reschedule Reason"
							type="text"
							name="rescheduleReason"
							value={form.rescheduleReason}
							onChange={handleChange}
							multiline
							rows={5}
							variant="outlined"
							fullWidth
							required
						/>
					</DialogContent>
					<DialogActions className="justify-between px-8 sm:px-16">
						<Button variant="contained" color="primary" type="submit">
							Send
						</Button>
					</DialogActions>
				</form>
			</Dialog>
			{/* Reschedule Form */}
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{"Are you sure you want to remove this appointment?"}
					<Typography>If you want to reschedule it in future click Reschedule button.</Typography>
				</DialogTitle>
				<DialogContent>
					<TextField
						className="mt-8 mb-16"
						id="practitioner_notes"
						label="Cancellation Reason"
						type="text"
						name="cancelComment"
						value={cancelComment}
						onChange={handleCancelComment}
						multiline
						rows={5}
						variant="outlined"
						fullWidth
						required
					/>
				</DialogContent>
				<DialogActions>
					<Button
						style={{float:"left"}}
						size="small"
						color="primary"
						className={`${classes.button} m-0`}
						onClick={()=> dispatch(
							Actions.openRescheduleAppointmentDialog(appointmentId)
						).then(()=> dispatch(showMessage({ message: 'Appointment reschedule request sent successfully.',variant:'success' })) )}
					>
						Reschedule
					</Button>
					<Button onClick={handleClose} color="primary">
						No
					</Button>
					<Button
						disabled={!cancelComment}
						onClick={()=>{
						handleClose();
						return dispatch(Actions.removeAppointment(appointmentId,cancelComment)) }} color="primary" autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>

			{/* Session Notes */}
			<Dialog
				open={openSessionNotesForm}
				onClose={handleSessionNotesFormClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title" style={{width:"450px"}}>
					{"Session Notes"}
				</DialogTitle>
				<DialogContent>
					<Box component="fieldset" mb={3} borderColor="transparent">
						<Typography component="h6">{appSessionNotes}</Typography>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSessionNotesFormClose} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={openViewRatingForm}
				onClose={handleViewRatingFormClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{"Session Rating"}
					<Typography>Please rate how was your session with the practitoner and give reviews as well.</Typography>
				</DialogTitle>
				<DialogContent>
					<Box component="fieldset" mb={3} borderColor="transparent">
						<Typography component="legend">Session Rating</Typography>
						<Rating
							name="simple-controlled"
							value={showValue}
						/>
					</Box>
					<Typography component="legenb"><b>Reviews:</b></Typography>
					<Typography component="legend">{(sessionShowReviews) ? sessionShowReviews : 'N/A'}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleViewRatingFormClose} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
			{/* Session Rating form */}
			<Dialog
				open={openRatingForm}
				onClose={handleRatingFormClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{"Session Rating Form"}
					<Typography>Please rate how was your session with the practitoner and give reviews as well.</Typography>
				</DialogTitle>
				<DialogContent>
					<Box component="fieldset" mb={3} borderColor="transparent">
						<Typography component="legend">Rate your Session</Typography>
						<Rating
							name="simple-controlled"
							value={value}
							onChange={(event, newValue) => {
								setValue(newValue);
							}}
						/>
					</Box>
					<TextField
						className="mt-8 mb-16"
						id="session_reviews"
						label="Reviews"
						type="textarea"
						name="sessionReviews"
						value={sessionReviews}
						onChange={handleSessionReviews}
						multiline
						rows={5}
						variant="outlined"
						fullWidth
						required
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleRatingFormClose} color="primary">
						Cancel
					</Button>
					<Button
						disabled={!value}
						onClick={()=>{
							handleClose();
							return dispatch(Actions.saveSessionReviews(appointmentId,sessionReviews,value)).then(()=> dispatch(handleRatingFormClose)) }} color="primary" autoFocus>
						Submit
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
export default ScheduledAppointments;
