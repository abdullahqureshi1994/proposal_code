import _ from '@lodash';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import withReducer from 'app/store/withReducer';
import clsx from 'clsx';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as ReactDOM from 'react-dom';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import * as Actions from './store/actions';
import reducer from './store/reducers';
import { useForm } from '../../../@fuse/hooks';
import { closeDialog, openDialog, showMessage } from '../../store/actions/fuse';
import EventDialog from './EventDialog';
import CalendarHeader from './CalendarHeader';
import './CalendarApp.css';
import Alert from '@material-ui/lab/Alert';
import { Link } from '@material-ui/core';
import Stepper from '@material-ui/core/Stepper';
import EventComponent from './EventComponent';

const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

delete Views['AGENDA'];
delete Views['MONTH'];

const allViews = Object.keys(Views).map(k => Views[k]);

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
		'& .rbc-header': {
			padding: '12px 6px',
			fontWeight: 600,
			fontSize: 14
		},
		'& .rbc-label': {
			padding: '8px 6px'
		},
		'& .rbc-today': {
			backgroundColor: 'transparent'
		},
		'& .rbc-header.rbc-today, & .rbc-month-view .rbc-day-bg.rbc-today': {
			borderBottom: `2px solid ${theme.palette.secondary.main}!important`
		},
		'& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view': {
			padding: 24,
			[theme.breakpoints.down('sm')]: {
				padding: 16
			},
			...theme.mixins.border(0)
		},
		'& .rbc-agenda-view table': {
			...theme.mixins.border(1),
			'& thead > tr > th': {
				...theme.mixins.borderBottom(0)
			},
			'& tbody > tr > td': {
				padding: '12px 6px',
				'& + td': {
					...theme.mixins.borderLeft(1)
				}
			}
		},
		'& .rbc-time-view': {
			'& .rbc-time-header': {
				...theme.mixins.border(1)
			},
			'& .rbc-time-content': {
				flex: '0 1 auto',
				...theme.mixins.border(1)
			}
		},
		'& .rbc-month-view': {
			'& > .rbc-row': {
				...theme.mixins.border(1)
			},
			'& .rbc-month-row': {
				...theme.mixins.border(1),
				borderWidth: '0 1px 1px 1px!important',
				minHeight: 128
			},
			'& .rbc-header + .rbc-header': {
				...theme.mixins.borderLeft(1)
			},
			'& .rbc-header': {
				...theme.mixins.borderBottom(0)
			},
			'& .rbc-day-bg + .rbc-day-bg': {
				...theme.mixins.borderLeft(1)
			}
		},
		'& .rbc-day-slot .rbc-time-slot': {
			...theme.mixins.borderTop(1),
			opacity: 0.5
		},
		'& .rbc-time-header > .rbc-row > * + *': {
			...theme.mixins.borderLeft(1)
		},
		'& .rbc-time-content > * + * > *': {
			...theme.mixins.borderLeft(1)
		},
		'& .rbc-day-bg + .rbc-day-bg': {
			...theme.mixins.borderLeft(1)
		},
		'& .rbc-time-header > .rbc-row:first-child': {
			...theme.mixins.borderBottom(1)
		},
		'& .rbc-timeslot-group': {
			minHeight: 64,
			...theme.mixins.borderBottom(1)
		},
		'& .rbc-date-cell': {
			padding: 8,
			fontSize: 16,
			fontWeight: 400,
			opacity: 0.5,
			'& > a': {
				color: 'inherit'
			}
		},
		'& .rbc-event': {
			borderRadius: 4,
			padding: '4px 8px',
			backgroundColor: theme.palette.primary.dark,
			color: theme.palette.primary.contrastText,
			boxShadow: theme.shadows[0],
			transitionProperty: 'box-shadow',
			transitionDuration: theme.transitions.duration.short,
			transitionTimingFunction: theme.transitions.easing.easeInOut,
			position: 'relative',
			'&:hover': {
				boxShadow: theme.shadows[2]
			}
		},
		'& .rbc-row-segment': {
			padding: '0 4px 4px 4px'
		},
		'& .rbc-off-range-bg': {
			backgroundColor: theme.palette.type === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.16)'
		},
		'& .rbc-show-more': {
			color: theme.palette.secondary.main,
			background: 'transparent'
		},
		'& .rbc-addons-dnd .rbc-addons-dnd-resizable-month-event': {
			position: 'static'
		},
		'& .rbc-addons-dnd .rbc-addons-dnd-resizable-month-event .rbc-addons-dnd-resize-month-event-anchor:first-child': {
			left: 0,
			top: 0,
			bottom: 0,
			height: 'auto'
		},
		'& .rbc-addons-dnd .rbc-addons-dnd-resizable-month-event .rbc-addons-dnd-resize-month-event-anchor:last-child': {
			right: 0,
			top: 0,
			bottom: 0,
			height: 'auto'
		}
	},
	addButton: {
		position: 'absolute',
		right: 12,
		top: 172,
		zIndex: 99
	},
	dateSwitch: {
		float: 'left'
	},
	dateCheckBox: {
		float: 'left',
		padding: '3px'
	},
	dateColor: {
		color: '#8c8c8c !important'
	},
	px_t_42: {
		paddingTop: '42px !important'
	},
	req_btn: {
		paddingTop: '30px !important',
		textAlign: 'right',
		paddingRight: '32px !important'
	},
	bookedSlot: {
		height: '6px',
		backgroundColor: 'red',
		width: '100%',
		position: 'absolute',
		borderRadius: '5px'
	}
}));

function PatientAppointment(props) {

	const dispatch = useDispatch();
	const [currentView, setCurrentView] = useState('week');
	const { form, handleChange, setForm } = useForm({});
	const [slots, setSlots] = useState(null);
	const user = useSelector(({ auth }) => auth.user);

	const events = useSelector(({ patientAppointment }) => {
		console.log('patientAppointment..........',patientAppointment);
		return patientAppointment.events.entities.map(item => {
			if (item.practitioner && item.practitioner.user && item.practitioner.user.name) {
				item.practitioner = item.practitioner.user.name;
			}
			return item;
		});
		// return user.role !== 'patient' ? patientAppointment.events.entities : [];
	});


	const canSendNewRequest = useSelector(({ patientAppointment }) => {
		return patientAppointment.events.canSendNewRequest;
	});

	const cannot_send_request_msg = useSelector(({ patientAppointment }) => {
		return patientAppointment.events.cannot_send_request_msg;
	});

	const is_profile_completed = useSelector(({ patientAppointment }) => {
		return patientAppointment.events.is_profile_completed;
	});


	const bookedSlots = useSelector(({ patientAppointment }) => {
		return patientAppointment.events.bookedSlots;
	});

	let slot_arr = {};
	const eventStyleGetter = (event, start, end, isSelected) => {
		console.log('eventStyleGetter...........',event);
		let hrs = moment(start).format('YYYY_MM_DD_HH');
		if(!slot_arr[hrs]){
			slot_arr[hrs] = [];
			slot_arr[hrs].push(event.id);
		}
		else if(slot_arr[hrs].length){
			if(!(slot_arr[hrs].some(item => item==event.id ))) {
				slot_arr[hrs].push(event.id);
			}
		}
		let backgroundColor = `#0934af`;
		let color = `#ffffff`;
		switch (event.status) {
			case 'approved':
				backgroundColor = `green`;
				color = `#ffffff`;
				break;
			case 'cancel':
				backgroundColor = `goldenrod`;
				color = `#000000`;
				break;
			case 'canceled':
				backgroundColor = `#bbb`;
				color = `#000000`;
				break;
			case 'unapproved':
				backgroundColor = `#bbb`;
				color = `#000000`;
				break;
			case 'pending':
				backgroundColor = `yellow`;
				color = `#000000`;
				break;
			case 'completed':
				backgroundColor = `green`;
				color = `#ffffff`;
				break;
			case 'reschedule':
				backgroundColor = `orange`;
				color = `#000000`;
				break;
			default:
				backgroundColor = `#0934af`;
				color = `#ffffff`;
		}
		console.log('slot_arr....',slot_arr);
		var count = (slot_arr[hrs].findIndex(item=> item == event.id));
		var style = {
			backgroundColor: backgroundColor,
			borderRadius: '4px',
			opacity: 0.8,
			color: color,
			border: '0px',
			display: 'block',
			marginTop: (28.5 * (count+1))+'px'
		};
		return {
			style: style
		};
	}

	let open_dialog = true;
	const classes = useStyles(props);
	const headerEl = useRef(null);

	useEffect(() => {
		dispatch(Actions.getEvents());
	}, [dispatch]);

	function moveEvent({ event, start, end }) {
		dispatch(
			Actions.updateEvent({
				...event,
				start,
				end
			})
		);
	}

	function resizeEvent({ event, start, end }) {
		delete event.type;
		dispatch(
			Actions.updateEvent({
				...event,
				start,
				end
			})
		);
	}

	function handleTestChange(event, value) {
		if (_.filter(form, v => v).length >= user.user_setting.patient_min_app_pref_req && value) {
			return dispatch(
				showMessage({
					message: `You can select only ${user.user_setting.patient_min_app_pref_req} no. of preferences.`,
					variant: 'error'
				})
			);
		}
		dispatch(Actions.getEvents());
		const temp_form = form;
		temp_form[event.target.name] = value;
		setForm(temp_form);

		if (_.filter(form, v => v).length >= user.user_setting.patient_min_app_pref_req) {
			return dispatch(Actions.getEvents());
		}
	}

	if (!bookedSlots) {
		return <FuseLoading />;
	}

	const uniq_key = 1;
	const data = {};

	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto relative')}>
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
							)
						}
					</Alert><br/>
				</div>
			)}
			<div ref={headerEl} />
			<Grid container spacing={3}>
				<Grid item xs={12} sm={6} className={classes.px_t_42}>
					<span className="request-note">
						* Please select any three (3) preferences for appointment request.
					</span>
				</Grid>
				<Grid item xs={12} sm={6} className={classes.req_btn}>
					<Button
						className="normal-case mx-r-20"
						variant="contained"
						color="default"
						aria-label="Clear"
						disabled={!slots }
						onClick={() => {
							props.history.go();
						}}
					>
						Clear
					</Button>
					{/*{canSendNewRequest ? (*/}
					{/*	<Button*/}
					{/*		title={cannot_send_request_msg}*/}
					{/*		className="normal-case"*/}
					{/*		variant="contained"*/}
					{/*		color="primary"*/}
					{/*		aria-label="Send Message"*/}
					{/*		disabled={!slots || !canSendNewRequest}*/}
					{/*		onClick={() => {*/}
					{/*			if (slots) {*/}
					{/*				return dispatch(Actions.openMultiSlotsNewEventDialog({ slots }));*/}
					{/*			}*/}
					{/*		}}*/}
					{/*	>*/}
					{/*		Send Request*/}
					{/*	</Button>*/}
					{/*):(*/}
						<Tooltip title="Cannot send Appointment Request Msg" >
							<Button
								style={(!canSendNewRequest)?{backgroundColor:'yellow'}:{}}
								className="normal-case"
								variant="contained"
								color="primary"
								aria-label="Send Message"
								disabled={!slots || !canSendNewRequest}
								onClick={() => {
									if (slots) {
										return dispatch(Actions.openMultiSlotsNewEventDialog({ slots }));
									}
								}}
							>
								Send Request
							</Button>
						</Tooltip>
					{/*)}*/}

				</Grid>
			</Grid>

			<DragAndDropCalendar
				dealy={5000}
				className="flex flex-1 container"
				selectable
				localizer={localizer}
				events={events}
				onEventDrop={moveEvent}
				// resizable
				// onEventResize={resizeEvent}
				defaultView={Views.WEEK}
				defaultDate={new Date()}
				startAccessor="start"
				endAccessor="end"
				views={allViews}
				// min={new Date(moment().set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toISOString())}
				// max={new Date(moment().set({ hour: 18, minute: 0, second: 0, millisecond: 0 }).toISOString())}
				step={Number(user.user_setting.slot_time)}
				titleAccessor={function(e){console.log(e);return e.title;}}
				timeslots={1}
				components={{
					event: evt => <EventComponent evt={evt} events={events} />,
					toolbar: _props => {
						return headerEl.current
							? ReactDOM.createPortal(<CalendarHeader {..._props} />, headerEl.current)
							: null;
					},
					timeSlotWrapper: (week_props, data) => {
						const label = moment(week_props.value).format('DD_HH_mm');
						const dateDiff = moment(week_props.value).diff(moment(), 'seconds');
						const book_status = bookedSlots.find(slot => {
							return moment(week_props.value).diff(moment(slot.start), 'seconds') === 0;
						});
						console.log('week_props...........',form,book_status,);
						if (
							week_props.children &&
							week_props.children.props &&
							week_props.children.props.children &&
							week_props.children.props.children.props &&
							week_props.children.props.children.props.children
						) {
							return (
								<div className="rbc-time-slot">
									<span className="rbc-label">
										{week_props.children.props.children.props.children}
									</span>
								</div>
							);
						}
						if (
							week_props.children &&
							week_props.children.props &&
							typeof week_props.children.props.children === 'undefined'
						) {
							return (
								<div className="rbc-time-slot">
									{dateDiff > 0 && (
										<div>
											<Tooltip title="Slot not available">
												<div className={book_status ? classes.bookedSlot : ''} />
											</Tooltip>
											<Checkbox
												onChange={handleTestChange}
												name={label}
												color="primary"
												size="small"
												disabled={
													book_status ||
													!!(
														_.filter(form, v => v).length >= user.user_setting.patient_min_app_pref_req && !form[label]
													)
												}
												inputProps={{ 'aria-label': 'checkbox with small size' }}
											/>
										</div>
									)}
								</div>
							);
						}
						return <div className="rbc-time-slot" />;
					},
					month: {
						dateHeader: date_props => {
							const { label } = date_props;
							if (!data[label]) {
								data[label] = false;
							}
							return (
								<div>
									<Checkbox
										className={classes.dateCheckBox}
										onChange={handleChange}
										name={label}
										color="primary"
										size="small"
										inputProps={{ 'aria-label': 'checkbox with small size' }}
									/>
									<a className={classes.dateColor} onClick={date_props.onDrillDown} color="secondary">
										{date_props.label}
									</a>
								</div>
							);
						}
					}
				}}
				onSelectEvent={event => {
					dispatch(Actions.openEditEventDialog(event));
				}}
				onSelectSlot={slotInfo => {
					setTimeout(() => {
						const wlabel = moment(slotInfo.start).format('DD_HH_mm');
						console.log("wlabel............",wlabel,form,slots);
						if (currentView === 'month') {
							const label = moment(slotInfo.start).format('DD');
							if (form && form[label]) {
								if (!slots) {
									var new_slot = [];
									new_slot.push({
										end:
											currentView === 'month'
												? moment(slotInfo.end).add(30, 'minute').toLocaleString()
												: slotInfo.end.toLocaleString(), // (slotInfo.end).toLocaleString(),
										start: slotInfo.start.toLocaleString()
									});
								} else {
									var new_slot = slots;
									new_slot.push({
										end:
											currentView === 'month'
												? moment(slotInfo.end).add(30, 'minute').toLocaleString()
												: slotInfo.end.toLocaleString(), // (slotInfo.end).toLocaleString(),
										start: slotInfo.start.toLocaleString()
									});
								}
								setSlots(new_slot);
							} else if (form && form[label] === false) {
								let form_exist = false;
								if (slots && slots.length > 0) {
									const temp_slot = slots;
									form_exist = slots.find((item, key) => {
										if (item.label === label) {
											temp_slot.splice(key, 1);
											setSlots(temp_slot);
											return true;
										}
									});
								}
								if (!form_exist) {
									return dispatch(
										Actions.openNewEventDialog({
											start: slotInfo.start.toLocaleString(),
											end:
												currentView === 'month'
													? moment(slotInfo.end).add(30, 'minute').toLocaleString()
													: slotInfo.end.toLocaleString()
										})
									);
								}
							} else {
								return dispatch(
										Actions.openNewEventDialog({
											start: slotInfo.start.toLocaleString(),
											end:
												currentView == 'month'
													? moment(slotInfo.end).add(30, 'minute').toLocaleString()
													: slotInfo.end.toLocaleString()
										})
									);
							}
						}
						else if (currentView === 'week') {
							const label = moment(slotInfo.start).format('DD_HH_mm');
							if (form && form[label]) {
								var new_slot = !slots ? [] : slots;
								let is_exist = false;
								is_exist = new_slot.find((item, key) => item.label === label);
								if (!is_exist) {
									new_slot.push({
										label,
										start: slotInfo.start.toLocaleString(),
										end: slotInfo.end.toLocaleString()
									});
								}
								setSlots(new_slot);
							} else if (form && form[label] === false) {
								let form_exist = false;
								if (slots && slots.length > 0) {
									const temp_slot = slots;
									form_exist = slots.find((item, key) => {
										if (item.label === label) {
											temp_slot.splice(key, 1);
											setSlots(temp_slot);
											return true;
										}
									});
									setSlots(temp_slot);
								}
							} else {
							}
						} else {
							return dispatch(
								Actions.openNewEventDialog({
									start: slotInfo.start.toLocaleString(),
									end: slotInfo.end.toLocaleString()
								})
							);
						}
					}, 300);
				}}
				onView={current_view => {
					setCurrentView(current_view);
				}}
				eventPropGetter={(eventStyleGetter)}
			/>
			<EventDialog />
		</div>
	);
}

export default withReducer('patientAppointment', reducer)(PatientAppointment);

/*
IE 11 Fix
*/
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = s => {
		let el = this;

		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1);
		return null;
	};
}
