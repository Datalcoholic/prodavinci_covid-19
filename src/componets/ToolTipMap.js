import React from 'react';

export default function ToolTipMap(props) {
	return (
		<foreignObject
			transform={`translate(${props.x} ${props.y - 30})`}
			width={75}
			height={35}
			minHeight={25}
		>
			<g className='tooltipMap'>
				<div
					className='tool-tip-value'
					// width={60}

					style={{
						textAlign: 'center',
						color: 'black',
						backgroundColor: '#f6f6f6',
						display: 'inline-block',
						textTransform: 'capitalize',
						borderRadius: '5px',
						border: '1.2px solid #626263'
					}}
				>
					{props.edo}
				</div>
			</g>
		</foreignObject>
	);
}
