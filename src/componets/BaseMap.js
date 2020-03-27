import React, { useState, useEffect, useContext } from 'react';
import useGetTopoJson from '../hooks/useGetTopoJson';
import * as d3 from 'd3';
import { geoPath, style, geoCentroid, scaleSqrt } from 'd3';
import { feature } from 'topojson-client';
import useGetEstados from '../hooks/useGetEstados';
import getInfected from '../utilities/getInfected';
import { InfectedContext } from '../contexts/InfectedContext';
import { ToolTipsContext } from '../contexts/ToolTipsContext';
import ToolTip from './ToolTip';

export default function BaseMap() {
	const [venBase, setVenBase] = useGetTopoJson('/data/Ven_base.json');
	const [edos, setEdos] = useGetEstados('/data/venezuela-estados.json');
	const [WH, setWH] = useState({
		width: window.innerWidth * 1.2,
		height: window.innerHeight * 1.2
	});
	const { infected, setInfected } = useContext(InfectedContext);
	const [infectedPerDay, setInfectedPerDay] = useState([]);
	const [infectedPerState, setInfectedPerState] = useState([]);
	const [centroids, setCentroids] = useState([]);
	const [itsHover, setItsHover] = useState(false);
	const [rad, setRad] = useState();
	const { toolTip, setToolTip } = useContext(ToolTipsContext);

	// añadir no informados
	useEffect(() => {
		//const ed =
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
	}, [edos]);

	//Infected per day total
	useEffect(() => {
		const infectedPerDay = d3
			.nest()
			.key(d => {
				return d.fecha;
			})
			.entries(infected);

		// eslint-disable-next-line no-sequences
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
		.center([-65.5, 7.5]);

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

	console.log('centroids', centroids);

	//bubles mouse events handler
	function mouseOverHandler2(d) {
		setItsHover(!itsHover);
		setToolTip({
			isShow: true,
			x: +d.target.attributes.cx.value,
			y: +d.target.attributes.cy.value,
			value: d.target.attributes.val.value,
			color: d.target.attributes.fill.value
		});

		setRad(d.target.attributes.circleId.value);
	}

	function mouseOutHandler(params) {
		setToolTip({ isShow: false });
		setRad(false);
	}

	return (
		<div className='map-container'>
			<svg
				viewBox={`0 0 ${WH.width} ${WH.height}`}
				//style={{ backgroundColor: '#f2f2f2' }}
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
									style={{
										fill: '#dbdbdb',
										stroke: '#626263',
										strokeWidth: 0.7
									}}
								/>
							);
						}
					})}
				</g>
				<g className='basemap'>
					<path
						d={geoGenerator(venBase)}
						className='country'
						style={{ stroke: '#626263', strokeWidth: 1.2, fill: 'none' }}
					/>
				</g>
				<g className='bubbles'>
					{centroids.map((d, i) => {
						return d.properties.NAME_1 === 'no informado' ? (
							<g key={`${d.key}-${i}`}>
								<circle
									key={`${d.key}_circle`}
									//	className={`${d.key}_circle`}
									cx={150}
									cy={450}
									r={
										rad === `${d.key}_circle`
											? radius(d.totalEdo) + 4
											: radius(d.totalEdo)
									}
									fill='#ffae19'
									stroke='#A66C00'
									strokeWidth={1.5}
									opacity={0.4}
									val={d.edo}
									onMouseOut={mouseOutHandler}
									onMouseOver={mouseOverHandler2}
									circleId={`${d.key}_circle`}
								></circle>
								<text
									key={`${d.key}_text`}
									x={150}
									y={450 + 4.5}
									className='text'
									style={{ fill: 'black' }}
								>
									{d.totalEdo}
								</text>
								<text
									key={`${d.key}_text`}
									x={150}
									y={450 + 35}
									className='text'
									style={{
										fill: 'black',
										fontSize: rad === `${d.key}_circle` ? '30px' : '20px',
										WebkitTextStroke: '1.5px #a0a0a0',
										paintOrder: 'stroke'
									}}
								>
									{d.key}
								</text>
							</g>
						) : (
							<g key={`${d.key}-${i}`}>
								<circle
									key={`${d.key}_circle`}
									cx={
										d.key === 'vargas'
											? d.centroid[0] + 10
											: d.key === 'zulia'
											? d.centroid[0] - 20
											: d.centroid[0]
									} // moviendo el estado vargas para evitar overlap
									cy={d.centroid[1]}
									r={
										rad === `${d.key}_circle`
											? radius(d.totalEdo) + 4
											: radius(d.totalEdo)
									}
									fill='#ffae19'
									stroke='#A66C00'
									strokeWidth={1.5}
									opacity={0.4}
									val={d.key}
									onMouseOut={mouseOutHandler}
									onMouseOver={mouseOverHandler2}
									circleId={`${d.key}_circle`}
								></circle>
								<text
									key={`${d.key}_text`}
									x={
										d.key === 'vargas'
											? d.centroid[0] + 10
											: d.key === 'zulia'
											? d.centroid[0] - 20
											: d.centroid[0]
									}
									y={d.centroid[1] + 4}
									className='text'
									style={{
										fill: 'black',
										fontSize: '20px',
										WebkitTextStroke: '1.5px #a0a0a0',
										paintOrder: 'stroke'
									}}
								>
									{d.totalEdo}
								</text>
							</g>
						);
					})}
				</g>
				toolTip.isShow&&
				<ToolTip />
			</svg>
		</div>
	);
}
