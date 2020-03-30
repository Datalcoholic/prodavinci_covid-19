import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import BaseMap from './BaseMap';
import Cards from './Cards';
import { InfectedContext } from '../contexts/InfectedContext';
import { WorldDataContext } from '../contexts/WorldDataContext';
import { ToolTipsContext } from '../contexts/ToolTipsContext';
import { FilterNestDataContext } from '../contexts/FilterNestDataContext';
import LineChart from './LineChart';
import { gsap } from 'gsap';

export default function Graphs() {
	const [infected, setInfected] = useState([]);
	const [totalContagios, setTotalContagios] = useState(0);
	const [filterNestData, setFilterNestData] = useState([]);
	const [worldData, setWorldData] = useState([]);
	const [toolTip, setToolTip] = useState({
		isShow: false,
		x: 0,
		y: 0,
		data: {}
	});

	const [totalFallecidos, setTotalFallecidos] = useState(0);

	const formatNum = d3.format(',d');

	// Total Fallecidos
	useEffect(() => {
		const myRequest = new Request(
			'https://api.datadrum.com/json/cv.VE_deaths_cum',
			{
				method: 'GET',
				headers: new Headers({
					token: 'covid19'
				})
			}
		);

		fetch(myRequest)
			.then(resp => resp.json())
			.then(resp => resp.data)
			.then(resp => resp[resp.length - 1])
			.then(resp => formatNum(+resp.cv___VE_deaths_cum))
			.then(resp => setTotalFallecidos(resp));
	}, []);

	//console.log('totalFallecidos', totalFallecidos);

	// Infected useEffect
	useEffect(() => {
		const date = d3.timeParse('%m/%d/%Y');
		d3.csv('/data/cov-19 ven - casos_confirmado.csv', d => {
			return {
				fecha: date(d.fecha),
				nacionalidad: d.nacionalidad,
				edo: d.edo,
				sexo: d.sexo,
				edad: +d.edad
			};
		}).then(resp => {
			setInfected(resp);
		});
	}, []);

	//Cards data
	useEffect(() => {
		setTotalContagios(infected.length);
	}, [infected]);

	return (
		<div className='grid'>
			<div className='title-map-container'>
				<h1 className='graph-title'>Distribución de contagios confirmados</h1>
			</div>
			<InfectedContext.Provider value={{ infected, setInfected }}>
				<ToolTipsContext.Provider value={{ ...toolTip, setToolTip }}>
					<FilterNestDataContext.Provider
						value={{ filterNestData, setFilterNestData }}
					>
						<BaseMap />

						<div className='cards-container'>
							<Cards
								total={totalContagios}
								title={'TOTAL CONTAGIOS CONFIRMADOS:'}
								id={'card_1'}
								color='#ffae19'
								WebkitTextStrokeColor='#A66C00'
							/>
							<Cards
								total={totalFallecidos}
								title={'TOTAL FALLECIDOS CONFIRMADOS:'}
								id={'card_2'}
								color='#d81159'
								WebkitTextStrokeColor='#890033'
							/>
							<Cards
								total={37}
								title={'TOTAL RECUPERADOS CONFIRMADOS:'}
								id={'card_3'}
								color='#09827e'
								WebkitTextStrokeColor='#00514E'
							/>
						</div>
						<WorldDataContext.Provider value={{ worldData, setWorldData }}>
							<LineChart />
						</WorldDataContext.Provider>
					</FilterNestDataContext.Provider>
				</ToolTipsContext.Provider>
			</InfectedContext.Provider>
		</div>
	);
}
