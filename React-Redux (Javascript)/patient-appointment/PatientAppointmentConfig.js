import React from 'react';
import {authRoles} from '../../auth';

const PatientAppointmentConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	auth: authRoles.user,
	routes: [
		{
			path: '/appointments1',
			component: React.lazy(() => import('./PatientAppointment'))
		},
		{
			path: '/patient-appointments',
			component: React.lazy(() => import('./MainAppointmentPage'))
		}
	]
};

export default PatientAppointmentConfig;
