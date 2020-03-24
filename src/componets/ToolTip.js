import React, { useContext } from 'react';
import { ToolTipsContext } from '../contexts/ToolTipsContext';

export default function ToolTip() {
	const { isShow, x, y, value, color } = useContext(ToolTipsContext);

	console.log('tips :', isShow, x, y, value, color);

	return (
		<foreignObject
			transform={`translate(${x} ${y - 30})`}
			width={50}
			height={20}
		>
			<g className='tooltip'>
				<div
					className='tool-tip-value'
					// height={15}
					// width={60}
					style={{ textAlign: 'center', color: color }}
				>
					{value}
				</div>
				<div className='triangle' />
			</g>
		</foreignObject>
	);
}
