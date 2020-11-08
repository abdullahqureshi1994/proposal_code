import React  from 'react';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from './store/actions';
import { useDispatch } from 'react-redux';

function EventComponent(props) {

	let myRef = React.createRef();

	const useStyles = makeStyles(theme => ({
		cancelIcon : {
			float:'right',
			marginTop: '-2.0px',
			fontSize: '21px',
			marginRight: '-5px',
			"&:hover":{
				color: 'red'
			}
		}
	}));

	const classes = useStyles(props);

	console.log('Evt Comp props......',props);

	return (
		<div ref={myRef} ><span>{`${(props.evt && props.evt.title)?props.evt.title:''}`}</span></div>
	);

}
export default EventComponent;
