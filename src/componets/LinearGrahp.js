import React, { useContext, useState, useEffect } from 'react';
import { WorldDataContext } from '../contexts/WorldDataContext';
import * as d3 from 'd3';

export default function LinearGrahp() {
	const { worldData, setWorldData } = useContext(WorldDataContext);
	const [nestWorldData, setNestWorldData] = useState([]);

	// Nest world Data

	useEffect(() => {
		const data = d3
			.nest()
			.key(d => {
				return d.location;
			})
			.entries(worldData);

		setNestWorldData(data);
	}, [worldData]);

	console.log(nestWorldData);
	return (
		<div className='linear-container'>
			<h3>Total Casos por Dias</h3>
			<svg
				width={600}
				height={500}
				viewBox='0 0 100 100'
				// style={{ backgroundColor: '#1d2d5d' }}
			></svg>
		</div>
	);
}
