import React from 'react';

export default function Cards(props) {
	return (
		<div className='cards' id={props.id}>
			<h4>{props.title}</h4>
			<div
				className='counters'
				style={{
					fontSize: 50,
					color: props.color,
					WebkitTextStrokeColor: props.WebkitTextStrokeColor
				}}
			>
				{props.total}
			</div>
		</div>
	);
}
