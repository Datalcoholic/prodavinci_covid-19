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

		return yScale.ticks(numberOfTicksTarget).map(value => ({
			value,
			yOffset: yScale(value)
		}));
	}, []);

	console.log('ticks', ticks);
	return <div></div>;
}
