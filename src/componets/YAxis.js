import React, { useMemo } from 'react';
import * as d3 from 'd3';

export default function YAxis({ domain = [0, 60], range = [0, 300] }) {
	const ticks = useMemo(() => {
		const yScale = d3
			.scaleLinear()
			.domain(domain)
			.range(range);

		const scaleHeigt = range[1] - range[0];
		const pixelsPerTick = 30;
		const numberOfTicksTarget = Math.max(
			1,
			Math.floor(scaleHeigt / pixelsPerTick)
		);

		const arrValues = yScale.ticks(numberOfTicksTarget);
		//Invertir el orden
		const arrYOffset = arrValues
			// .sort((a, b) => {
			// 	return b - a;
			// })
			.reverse()
			.map(d => {
				return yScale(d);
			});

		const res = arrValues.map((d, i) => ({
			value: d,
			yOffset: arrYOffset[arrYOffset.length - 1 - i]
		}));

		console.log(arrValues);
		return res;
		// return yScale.ticks(numberOfTicksTarget).map(value => ({
		// 	value,
		// 	yOffset: yScale(value)
		// }));
	}, [domain, range]);
	return (
		<svg
			style={{ overflow: 'visible' }}
			//viewBox='160 70 370 200'
		>
			<g className='y-axis-container'>
				{ticks.map(({ value, yOffset }) =>
					value !== 0 ? (
						<g key={value} transform={`translate(0, ${yOffset})`}>
							{/* <line
								key={value}
								x1={10}
								x2={900}
								stroke='black'
								style={{ strokeLinecap: 'round' }}
							/> */}

							<text style={{ fontSize: '9px', textAnchor: 'middle' }}>
								{value}
							</text>
						</g>
					) : (
						''
					)
				)}
				{ticks.map(({ value, yOffset }) =>
					value % 2 === 0 && value !== 0 ? (
						<g key={value} transform={`translate(0, ${yOffset})`}>
							<line
								key={value}
								x1={10}
								y1={-3}
								x2={900}
								y2={-3}
								stroke='black'
								style={{ strokeLinecap: 'round' }}
							/>
						</g>
					) : (
						''
					)
				)}
			</g>
		</svg>
	);
}
