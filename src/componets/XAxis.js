import React, { useMemo, useContext } from 'react';
import * as d3 from 'd3';
import { XDominioContext } from '../contexts/XDominioContext';
import { SliderContext } from '../contexts/SliderContext';

export default function XAxis({ range = [0, 900] }) {
	const { maxD, setMaxD } = useContext(XDominioContext);
	const { sliderValue, setSliderValue } = useContext(SliderContext);

	const ticks = useMemo(() => {
		const xScale = d3
			.scaleLinear()
			.domain([0, maxD])
			.range(range);

		const width = range[1] - range[0];
		const pixelsPerTick = 100;
		const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));

		return xScale.ticks(numberOfTicksTarget).map(value => ({
			value,
			xOffset: xScale(value)
		}));
	}, [[0, maxD].join('-'), range.join('-')]);

	return (
		<g className='x-axis-container'>
			<svg
				//viewBox='0 -5 200 50'
				style={{ overflow: 'visible' }}
				height={50}
			>
				<text
					x={900 / 2}
					y={400 - 65}
					style={{
						fill: '#626263',
						fontFamily: 'Roboto Condensed',
						fontSize: '13px',
						textAnchor: 'center'
					}}
				>
					Dias desde el inicio
				</text>
				<g
					className='xaxis-container'
					style={{
						transform: 'translate(0px, 300px)',
						strokeLinecap: 'round'
					}}
				>
					<path
						d={['M', range[0], 6, 'v', -6, 'H', range[1], 'v', 6].join(' ')}
						fill='none'
						stroke='currentColor'
						strokeWidth={0.5}
					/>
					{ticks.map(({ value, xOffset }) => (
						<g key={value} transform={`translate(${xOffset}, 0)`}>
							<line
								y2='6'
								stroke='currentColor'
								style={{ strokeLinecap: 'round' }}
							/>
							<text
								key={value}
								style={{
									fontSize: '12px',
									textAnchor: 'middle',
									transform: 'translateY(20px)'
								}}
							>
								{value}
							</text>
						</g>
					))}
				</g>
			</svg>
		</g>
	);
}
