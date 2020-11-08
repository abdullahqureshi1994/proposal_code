import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import withReducer from 'app/store/withReducer';
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import reducer from './store/reducers';
import PatientAppointment from './PatientAppointment';
import ScheduledAppointments from './ScheduledAppointments';
import * as Actions from './store/actions';

const useStyles = makeStyles(theme => ({
	layoutHeader: {
		height: 320,
		minHeight: 320,
		[theme.breakpoints.down('md')]: {
			height: 240,
			minHeight: 240
		}
	}
}));
function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box p={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired
};

function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`
	};
}

function MainAppointmentPage(props) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [selectedTab, setSelectedTab] = useState(0);

	const [value, setValue] = React.useState(0);
	const [isFirstLoad, setIsFirstLoad] = React.useState(-1);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const user = useSelector(({ auth }) => auth.user);

	useEffect(() => {
		console.log('dispatch actions.................');
		dispatch(Actions.getEvents()).then((data, data2)=>{
			console.log('OOOOK',data, data2);
			setIsFirstLoad(0);
		});
	}, [dispatch]);

	const bookedSlots = useSelector(({ patientAppointment }) => {
		console.log('patientAppointment.events.entities.length>>>>>>>>>>>',patientAppointment.events.entities.length);
		if (isFirstLoad === 0 && patientAppointment.events.entities.length <= 0 && value !== 1) {
			setValue(1);
			setIsFirstLoad(1);
		}
		// else if(patientAppointment.events.entities.length > 0 && value === 1){
		// 	setValue(0);
		// }
		return patientAppointment.events.bookedSlots;
	});

	function handleTabChange(event, value) {
		setSelectedTab(value);
	}

	if (!user || !user.role) {
		return <FuseLoading />;
	}
	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
					<Tab label="Appointments" {...a11yProps(0)} />
					<Tab label="Request Appointment" {...a11yProps(1)} />
					{/*<Tab label="Request Another Practitioner" {...a11yProps(2)} />*/}
					{/*<Tab label="Extend Session Request" {...a11yProps(3)} />*/}
				</Tabs>
			</AppBar>
			<TabPanel value={value} index={0}>
				<ScheduledAppointments history={props.history} />
			</TabPanel>
			<TabPanel value={value} index={1}>
				<PatientAppointment history={props.history} />
			</TabPanel>
			<TabPanel value={value} index={2}>
				Item Three
			</TabPanel>
		</div>
	);
}

export default MainAppointmentPage;
