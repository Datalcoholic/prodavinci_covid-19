import React, { useState, useEffect } from 'react';
import useGetTopoJson from '../hooks/useGetTopoJson';
import * as d3 from 'd3';
import { geoPath, style, geoCentroid, scaleSqrt } from 'd3';
import { feature } from 'topojson-client';
import useGetEstados from '../hooks/useGetEstados';
import useGetInfected from '../hooks/useGetInfected';

export default function BaseMap() {
	const [venBase, setVenBase] = useGetTopoJson('/data/Ven_base.json');
	const [edos, setEdos] = useGetEstados('/data/venezuela-estados.json');
	const [WH, setWH] = useState({
		width: window.innerWidth * 1.2,
		height: window.innerHeight * 1.2
	});
	const [infected, setInfected] = useGetInfected(
		'/data/cov-19 ven - Sheet1 (2).csv'
	);

	const [infectedPerDay, setInfectedPerDay] = useState([]);
	const [infectedPerState, setInfectedPerState] = useState([]);
	const [centroids, setCentroids] = useState([]);

	// añadir no informados

	// useEffect(() => {
	// 	const ed =
	edos.push({
		type: 'Feature',
		properties: { NAME_1: 'no informado' },
		geometry: {
			type: 'Polygon',
			coordinates: [
				[
					[-60.09521484375, 10.293301000109102],
					[-59.78759765625, 10.293301000109102],
					[-59.78759765625, 10.595820834654047],
					[-60.09521484375, 10.595820834654047],
					[-60.09521484375, 10.293301000109102]
				]
			]
		}
	});
	// 	setEdos(ed);
	// }, [centroids]);

	//Infected per day total
	console.log('edos', edos);
	useEffect(() => {
		const infectedPerDay = d3
			.nest()
			.key(d => {
				return d.fecha;
			})
			.entries(infected);

		infectedPerDay.map(d => ((d.totalEdo = d.values.length), d));
		setInfectedPerDay(infectedPerDay);
	}, [infected]);

	//Infected per States
	useEffect(() => {
		const infectedPerstate = d3
			.nest()
			.key(d => {
				return d.edo;
			})
			.entries(infected);

		infectedPerstate.map(d => ((d.totalEdo = d.values.length), d));
		setInfectedPerState(infectedPerstate);
	}, [infected]);

	//console.log(infectedPerState, 'edit');
	// const [infected, setInfected] = useGetInfected(
	// 	'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlgeMhqUh54XaVfI8pRQeZ-DL-yhLqVIGM0EG5tf2wafHjyT_aONzQ4I8pXLiXBjKvQardOZ9S_fJp/pub?gid=0&single=true&output=csv'
	// );

	const projection = d3
		.geoMercator()
		.scale(3000)
		.center([-68, 8.1]);

	const geoGenerator = geoPath().projection(projection);

	const infectedPerStateMax = d3.max(infectedPerState, d => d.totalEdo);
	console.log(infectedPerStateMax);

	const radius = d3
		.scaleSqrt()
		.domain([0, infectedPerStateMax])
		.range([0, 15]);

	//Establecer centroids
	useEffect(() => {
		const filt = edos.filter(d => {
			return infectedPerState.some(f => {
				return f.key === d.properties.NAME_1.toLowerCase();
			});
		});

		// Join los poligonos filtrados con los los infectados por dias
		const test = filt.map(d =>
			Object.assign(
				d,
				infectedPerState.find(f => f.key === d.properties.NAME_1.toLowerCase())
			)
		);

		test.map(d => ((d.centroid = projection(geoCentroid(d))), d));
		setCentroids(test);
	}, [infectedPerState]);

	//console.log('centroids', centroids);

	return (
		<div className='mapContainer'>
			<svg
				viewBox={`0 0 ${WH.width} ${WH.height}`}
				style={{ backgroundColor: '#f2f2f2' }}
			>
				<g className='edos'>
					{edos.map(d => {
						if (d.properties.NAME_1 === 'no informado') {
							return <div></div>;
						} else {
							return (
								<path
									key={`${d.properties.NAME_1}`}
									className={`${d.properties.NAME_1}`}
									d={geoGenerator(d)}
									style={{ fill: '#928d92', stroke: '#fff', strokeWidth: 0.5 }}
								/>
							);
						}
					})}
				</g>

				<g className='basemap'>
					<path
						d={geoGenerator(venBase)}
						className='country'
						style={{ stroke: '#5c5c5c', strokeWidth: 1.2, fill: 'none' }}
					/>
				</g>

				<g className='bubbles'>
					{centroids.map((d, i) => {
						return d.properties.NAME_1 === 'no informado' ? (
							<g key={`${d.edo}-${i}`}>
								<circle
									key={`${d.edo}_circle`}
									//	className={`${d.key}_circle`}
									cx={350}
									cy={450}
									r={radius(d.totalEdo)}
									fill='#cf29be'
									stroke='#990e8b'
									opacity={0.7}
								></circle>
								<text
									key={`${d.key}_text`}
									x={350}
									y={450 + 4.5}
									className='text'
									style={{ fill: '#fdfdfd' }}
								>
									{d.totalEdo}
								</text>
								<text
									key={`${d.key}_text`}
									x={350}
									y={450 + 35}
									className='text'
									style={{ fill: '#black' }}
								>
									{d.key}
								</text>
							</g>
						) : (
							<g key={`${d.edo}-${i}`}>
								<circle
									key={`${d.edo}_circle`}
									//	className={`${d.key}_circle`}
									cx={d.centroid[0]}
									cy={d.centroid[1]}
									r={radius(d.totalEdo)}
									fill='#cf29be'
									stroke='#990e8b'
									opacity={0.7}
								></circle>
								<text
									key={`${d.key}_text`}
									x={d.centroid[0]}
									y={d.centroid[1] + 4}
									className='text'
									style={{ fill: '#fdfdfd' }}
								>
									{d.totalEdo}
								</text>
							</g>
						);
					})}
				</g>
			</svg>
		</div>
	);
}
