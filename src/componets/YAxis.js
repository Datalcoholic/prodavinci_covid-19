import React, { useMemo, useContext } from 'react';
import * as d3 from 'd3';
import { YDominioContext } from '../contexts/YDominioContext';

export default function YAxis({ domain = [0, 60], range = [0, 300] }) {
	const { totalMax, setTotalMax } = useContext(YDominioContext);

	const format = d3.format(',d');

	const ticks = useMemo(() => {
		const yScale = d3
			.scaleLinear()
			.domain([0, totalMax])
			.range(range);

		const scaleHeigt = range[1] - range[0];
		const pixelsPerTick = 40;
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
			width={20}
		>
			<g className='y-axis-container'>
				{ticks.map(({ value, yOffset }) =>
					value !== 0 ? (
						<g key={value} transform={`translate(0, ${yOffset})`}>
							<text style={{ fontSize: '10px', textAnchor: 'middle' }}>
								{format(value)}
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
								x1={20}
								y1={-3}
								x2={900}
								y2={-3}
								stroke='#a0a0a0'
								strokeWidth={0.5}
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
