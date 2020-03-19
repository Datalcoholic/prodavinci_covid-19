import React, { useContext, useState, useEffect } from 'react';
import { WorldDataContext } from '../contexts/WorldDataContext';
import * as d3 from 'd3';
import XAxis from './XAxis';
import YAxis from './YAxis';

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

		data.forEach(country => {
			return country.values.map((d, i) => ((d.dia_numero = i), d));
		});

		setNestWorldData(data);
	}, [worldData]);

	console.log(nestWorldData);
	//  const bar =
	return (
		<div className='linear-container'>
			<div className='tabs-container'>
				<button className='tc'>Total Casos</button>
				<button className='tcn'>total Casos nuevos</button>
			</div>
			<div className='tools-container'>
				<div>busqueda</div>
				<div>barra</div>
			</div>
			<div className='lin-graph-container'>
				<svg
					width={900}
					height={300}
					viewBox='0 0 100 100'
					style={{ backgroundColor: '#e0e0e0', borderRadius: 10 }}
				>
					<XAxis />
					<YAxis />
				</svg>
			</div>
		</div>
	);
}
