import React, { useState, useEffect } from 'react';
import useGetTopoJson from '../hooks/useGetTopoJson';
import * as d3 from 'd3';
import { geoPath, style } from 'd3';
import { feature } from 'topojson-client';
import useGetEstados from '../hooks/useGetEstados';

export default function BaseMap() {
	const [venBase, setVenBase] = useGetTopoJson('/data/Ven_base.json');
	const [edos, setEdos] = useGetEstados('/data/venezuela-estados.json');
	const [WH, setWH] = useState({
		width: window.innerWidth * 0.98,
		height: window.innerHeight * 0.98
	});

	console.log(edos);
	const projection = d3
		.geoMercator()
		.scale(3000)
		.center([-68, 8.1]);

	const geoGenerator = geoPath().projection(projection);

	return (
		<div className='mapContainer'>
			<svg
				viewBox={`0 0 ${WH.width} ${WH.height}`}
				style={{ backgroundColor: '#f2f2f2' }}
			>
				<g className='edos'>
					{edos.map(d => (
						<path
							key={`${d.properties.NAME_1}`}
							className={`${d.properties.NAME_1}`}
							d={geoGenerator(d)}
							style={{ fill: '#928d92', stroke: '#fff', strokeWidth: 0.5 }}
						/>
					))}
				</g>

				<g className='basemap'>
					<path
						d={geoGenerator(venBase)}
						className='country'
						style={{ stroke: '#5c5c5c', strokeWidth: 1.2, fill: 'none' }}
					/>
				</g>
			</svg>
		</div>
	);
}
