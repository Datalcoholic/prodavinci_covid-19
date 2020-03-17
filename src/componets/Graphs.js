import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import BaseMap from './BaseMap';
import Cards from './Cards';
import LinearGraph from './LinearGrahp';
import { InfectedContext } from '../contexts/InfectedContext';
import { WorldDataContext } from '../contexts/WorldDataContext';

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
		}).then(resp => {
			setWorldData(resp, 'promise');
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
				<Cards
					total={totalContagios}
					title={'TOTAL CONTAGIOS CONFIRMADOS:'}
					id={'card_1'}
					color='#EC1D96'
				/>
				<Cards total={0} title={'TOTAL FALLECIDOS:'} id={'card_2'} />
				<Cards total={0} title={'TOTAL RECUPERADOS'} id={'card_3'} />

				<WorldDataContext.Provider value={{ worldData, setWorldData }}>
					<LinearGraph />
				</WorldDataContext.Provider>
			</InfectedContext.Provider>
		</div>
	);
}
