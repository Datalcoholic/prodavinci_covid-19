import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';

const MyObject = {
	total: 0
};

export default function Cards(props) {
	const [totalVal, setTotalVal] = useState(props.total);

	useEffect(() => {
		gsap.to(MyObject, {
			duration: 1,
			total: props.total,
			roundProps: 'total',
			onUpdate: () => {
				setTotalVal(MyObject.total);
			}
		});
	}, [props.total]);

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
				{totalVal}
			</div>
		</div>
	);
}
