import React, { useContext, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { WorldDataContext } from '../contexts/WorldDataContext';
import { XDominioContext } from '../contexts/XDominioContext';
import { YDominioContext } from '../contexts/YDominioContext';
import { CountriesContext } from '../contexts/CountriesContext';
import { CountriesSelectionContext } from '../contexts/CountriesSelectionContext';

export default function LineChart() {
	const { worldData, setWorldData } = useContext(WorldDataContext);
	const [nestWorldData, setNestWorldData] = useState([]);
	const { maxD, setMaxD } = useContext(XDominioContext);
	const { totalMax, setTotalMax } = useContext(YDominioContext);
	const { countries, setCountries } = useContext(CountriesContext);
	const { countriesSelection, setCountriesSelection } = useContext(
		CountriesSelectionContext
	);
	const [filterNestData, setFilterNestData] = useState([]);

	//TODO:
	//Filtrar nest data por dias con el valor del slider

	// filter data set by countriesSelections
	useEffect(() => {
		const filteredData = nestWorldData.filter(country =>
			countriesSelection.find(d => country.key.toLowerCase() === d.value)
		);

		setFilterNestData(filteredData);
	}, [countriesSelection]);

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

	// Dias Maximo
	useEffect(() => {
		const maxD = d3.max(
			filterNestData.map(d => d3.max(d.values.map(d => d.dia_numero)))
		);
		setMaxD(maxD);
	}, [filterNestData]);

	// MAximo de total_cases
	useEffect(() => {
		const totalCasesMax = d3.max(
			filterNestData.map(d => d3.max(d.values.map(d => d.total_cases)))
		);
		setTotalMax(totalCasesMax);
	}, [filterNestData]);

	//Lista de paises
	useEffect(() => {
		const countriesList = [...new Set(worldData.map(d => d.location))].map(
			d => {
				return { value: d.toLowerCase(), label: d };
			}
		);

		setCountries(countriesList);
	}, [worldData]);

	const xScale = d3
		.scaleLinear()
		.domain([0, maxD])
		.range([0, 900]);
	const YScale = d3
		.scaleLinear()
		.domain([0, totalMax])
		.range([300, 0]);

	const line = d3
		.line()
		.x(d => {
			return xScale(d.dia_numero);
		})
		.y(d => {
			return YScale(d.total_cases);
		});

	return (
		<svg>
			{filterNestData.map(d => (
				<path
					d={line(d.values)}
					key={d.key.toLowerCase()}
					stroke='black'
					fill='none'
				/>
			))}

			{filterNestData.map(country =>
				country.values.map(row => (
					<g className='points-container'>
						<circle
							key={`${row.dia_numero}-circle`}
							cx={xScale(row.dia_numero)}
							cy={YScale(row.total_cases)}
							r={2}
							fill='black'
						/>
					</g>
				))
			)}
		</svg>
	);
}
