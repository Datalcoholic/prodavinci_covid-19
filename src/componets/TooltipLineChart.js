import React from 'react';
import * as d3 from 'd3';

export default function TooltipLineChart(props) {
	// console.log('props', props[0][0].attributes);
	const formatNum = d3.format(',d');

	try {
		return (
			<svg>
				<foreignObject
					className='tooltip-linechart'
					transform={`translate(${props[0][0].attributes.xpos.value - 85} 50)`}
				>
					{props[0].map((circle, i) => (
						<g className='tooltipLine-container' key={i}>
							<div
								key={circle.attributes.circleid.value}
								className='tool-tip-value-linechart'
								style={{ color: `${circle.attributes.fill.value}` }}
							>
								{`${formatNum(+circle.attributes.val.value)} pers`}
							</div>
							<div
								key={`${circle.attributes.circleid.value}-${i}`}
								className='tool-tip-value-linechart'
								style={{ color: `${circle.attributes.fill.value}` }}
							>
								{circle.attributes.pais.value}
							</div>
						</g>
					))}
				</foreignObject>
				<line
					x1={props[0][0].attributes.xpos.value - 85}
					y1={50}
					x2={props[0][0].attributes.xpos.value - 85}
					y2={300}
					style={{ stroke: '#818181', strokeDasharray: 2.5 }}
				/>
			</svg>
		);
	} catch (error) {
		console.log('erro :', error);
		return <div></div>;
	}
}
