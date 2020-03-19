import React, { useMemo } from 'react';
import * as d3 from 'd3';

export default function XAxis({ domain = [0, 1000], range = [0, 585] }) {
	const ticks = useMemo(() => {
		const xScale = d3
			.scaleLinear()
			.domain(domain)
			.range(range);

		const width = range[1] - range[0];
		const pixelsPerTick = 30;
		const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));

		return xScale.ticks(numberOfTicksTarget).map(value => ({
			value,
			xOffset: xScale(value)
		}));
	}, [domain.join('-'), range.join('-')]);

	return (
		<svg viewBox='0 -5 200 50' style={{ overflow: 'visible' }} height={50}>
			<g
				className='xaxis-container'
				style={{
					transform: 'translate(-195px, 150px)',
					strokeLinecap: 'round'
				}}
			>
				<path
					d={['M', range[0], 6, 'v', -6, 'H', range[1], 'v', 6].join(' ')}
					fill='none'
					stroke='currentColor'
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
								fontSize: '7px',
								textAnchor: 'middle',
								transform: 'translateY(15px)'
							}}
						>
							{value}
						</text>
					</g>
				))}
			</g>
		</svg>
	);
}
