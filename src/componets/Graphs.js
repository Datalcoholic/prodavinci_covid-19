import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import BaseMap from './BaseMap';
import Cards from './Cards';
import { InfectedContext } from '../contexts/InfectedContext';
import { WorldDataContext } from '../contexts/WorldDataContext';
import LineChart from './LineChart';

export default function Graphs() {
	const [infected, setInfected] = useState([]);
	const [totalContagios, setTotalContagios] = useState(0);
	const [worldData, setWorldData] = useState([]);

	// WorldData useEffect
	useEffect(() => {
		const date = d3.timeParse('%Y-%m-%d');

		d3.csv('data/full_data.csv', d => {
			return (
				(d.date = date(d.date)),
				(d.new_cases = +d.new_cases),
				(d.new_deaths = +d.new_deaths),
				(d.total_cases = +d.total_cases),
				d
			);
		})
			.then(resp => resp.filter(d => d.total_cases !== 0))

			.then(resp => {
				setWorldData(resp);
				//setWorldData(resp);
			});
	}, []);

	// Infected useEffect
	useEffect(() => {
		const date = d3.timeParse('%m/%d/%Y');
		d3.csv('data/cov-19 ven - Sheet1.csv', d => {
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
			<h1 className='graph-title'>Distribucion de contagios confirmados</h1>
			<InfectedContext.Provider value={{ infected, setInfected }}>
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
						total={0}
						title={'TOTAL FALLECIDOS:'}
						id={'card_2'}
						color='#d81159'
						WebkitTextStrokeColor='#890033'
					/>
					<Cards
						total={0}
						title={'TOTAL RECUPERADOS'}
						id={'card_3'}
						color='#09827e'
						WebkitTextStrokeColor='#00514E'
					/>
				</div>
				<WorldDataContext.Provider value={{ worldData, setWorldData }}>
					<LineChart />
				</WorldDataContext.Provider>
			</InfectedContext.Provider>
		</div>
	);
}
