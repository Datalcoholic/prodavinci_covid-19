import React, { useContext, useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { WorldDataContext } from '../contexts/WorldDataContext';
import { XDominioContext } from '../contexts/XDominioContext';
import { YDominioContext } from '../contexts/YDominioContext';
import { CountriesContext } from '../contexts/CountriesContext';
import { CountriesSelectionContext } from '../contexts/CountriesSelectionContext';
import { SliderContext } from '../contexts/SliderContext';
import { IsLogContext } from '../contexts/IsLogContext';
import { ToolTipsContext } from '../contexts/ToolTipsContext';
import {
	TcContext,
	TcnContext,
	DcContext,
	DcnContext
} from '../contexts/ButtonsContext';
import { ApiContext } from '../contexts/ApiContext';

import GetCountryData from '../utilities/GetCountryData';

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
	const { sliderValue, setSliderValue } = useContext(SliderContext);
	const { isLog, setIsLog } = useContext(IsLogContext);
	const [itsHover, setItsHover] = useState(false);
	const { tooltip, setToolTip } = useContext(ToolTipsContext);
	const [rad, setRad] = useState(2);
	const { isTc, setIsTc } = useContext(TcContext);
	const { isTcn, setIsTcn } = useContext(TcnContext);
	const { isDc, setIsDc } = useContext(DcContext);
	const { isDcn, setIsDcn } = useContext(DcnContext);
	const [ecdcData, setEcdcData] = useState([]);
	const { api, dispatch } = useContext(ApiContext);

	//FetchData
	useEffect(() => {
		// const urls = [
		// 	'https://api.datadrum.com/json/cv_cases.Colombia',
		// 	'https://api.datadrum.com/json/cv_cases.United'
		// ];

		const urls = countriesSelection.map(
			sel => `https://api.datadrum.com/json/cv.${sel.value}${api}`
		);

		const poolData = [];
		urls.forEach(url => {
			const myRequest = new Request(url, {
				method: 'GET',
				headers: new Headers({
					token: 'covid19'
				})
			});

			fetch(myRequest)
				.then(resp => resp.json())
				.then(resp => resp.data)
				.then((resp, i) =>
					resp.map(
						(d, i) => (
							(d.dia_numero = i),
							(d.total_cases =
								d[Object.keys(d)[1]] === null ? 0 : d[Object.keys(d)[1]]),
							(d.location = Object.keys(d)[1]
								.split('___')[1]
								.split('_')[0]),
							d
						)
					)
				)

				.then(resp => poolData.push(resp))
				.then(resp => setEcdcData(poolData.flat()))
				.then(resp => console.log('api', [...poolData]))
				.catch(error => console.log(error));
		});
	}, [countriesSelection, api]);

	const myRef = useRef();

	//TODO:
	//Filtrar nest data por dias con el valor del slider

	const colors = [
		'#ffae19',
		'#09827e',
		'#7cb24c',
		'#8e0751',
		'#F84714',
		'#4024B0',
		'#0E3A8C'
	];

	//Add colors to filterNestData
	useEffect(() => {
		const col = filterNestData.map(
			(country, i) => (
				(country.color = filterNestData.length - 1 > i ? colors[i] : '#626263'),
				country
			)
		);

		setFilterNestData({ ...filterNestData, col });
	}, [countriesSelection]);

	// filter data set by countriesSelections
	useEffect(() => {
		const filteredData = nestWorldData.filter(country =>
			countriesSelection.find(d => country.key.toLowerCase() === d.value)
		);

		setFilterNestData(filteredData);
	}, [countriesSelection, nestWorldData, sliderValue]);

	// Nest world Data
	useEffect(() => {
		const data = d3
			.nest()
			.key(d => {
				return d.location;
			})
			.entries(ecdcData);

		//TODO:
		// Agregar el nombre del pais

		setNestWorldData(data);
	}, [ecdcData]);

	console.log('nestWorldData', nestWorldData);

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
			filterNestData.map(d =>
				d3.max(
					d.values.map(d =>
						isTc
							? d.total_cases
							: isTcn
							? d.new_cases
							: isDc
							? d.total_deaths
							: isDcn
							? d.new_deaths
							: d.total_deaths
					)
				)
			)
		);
		setTotalMax(totalCasesMax);
	}, [filterNestData, isTc, isTcn, isDc, isDcn]);

	//Lista de paises
	useEffect(() => {
		// const countriesList = [...new Set(worldData.map(d => d.location))].map(
		// 	d => {
		// 		return { value: d.toLowerCase(), label: d };
		// 	}
		// );

		d3.json('/data/country_list.json')
			.then(data => {
				return data.map(d => {
					return { value: d.code, label: d.name };
				});
			})
			.then(resp => setCountries(resp));
	}, []);

	const xScale = d3
		.scaleLinear()
		.domain([0, maxD])
		.range([0, 850]);
	const YScale = d3
		.scaleLinear()
		.domain([0, totalMax])
		.range([300, 0]);

	const yScaleLog = d3
		.scaleLog()
		.domain([1, 100000])
		.range([300, 0]);

	const line = d3
		.line()
		.x(d => {
			return xScale(d.dia_numero);
		})
		.y(d => {
			return isTc
				? isLog
					? yScaleLog(d.total_cases)
					: YScale(d.total_cases)
				: isTcn
				? isLog
					? yScaleLog(d.new_cases === 0 ? 1 : d.new_cases)
					: YScale(d.new_cases)
				: isDc
				? isLog
					? yScaleLog(d.total_deaths === 0 ? 1 : d.total_deaths)
					: YScale(d.total_deaths)
				: isDcn
				? isLog
					? yScaleLog(d.new_deaths === 0 ? 1 : d.new_deaths)
					: YScale(d.new_deaths)
				: isLog
				? yScaleLog(d.total_cases)
				: YScale(d.total_cases);
		});

	const numFormat = d3.format(',d');

	function mouseOverHandler(d) {
		setItsHover(!itsHover);
		setToolTip({
			isShow: true,
			x: +d.target.attributes.cx.value,
			y: +d.target.attributes.cy.value,
			value: numFormat(+d.target.attributes.val.value),
			color: d.target.attributes.fill.value
		});

		setRad(d.target.attributes.circleId.value);
	}

	function mouseOutHandler(params) {
		setToolTip({ isShow: false });
		setRad(false);
	}

	return (
		<svg style={{ overflow: 'visible' }}>
			<g className='path-container'>
				{filterNestData.map((d, i) => (
					<path
						key={`${d.key}-${i}-back-line`}
						d={line(d.values)}
						style={{ stroke: '#e0e0e0', strokeWidth: '3px', fill: 'none' }}
						className={`backline-pais-${i}`}
					/>
				))}

				{filterNestData.map((d, i) => (
					<path
						d={line(d.values)}
						key={`${d.key}-${i}`}
						stroke={d.color ? d.color : '#d81159'}
						fill='none'
						className={`pais-${i}`}
					/>
				))}
			</g>
			<g className='points-container' ref={myRef}>
				{filterNestData.map((country, a) =>
					country.values.map((row, i) => (
						<circle
							className={`pais-${a}-circle`}
							key={`${row.dia_numero}-circle`}
							circleId={`${row.dia_numero}-circle`}
							cx={xScale(row.dia_numero)}
							cy={
								isTc
									? isLog
										? yScaleLog(row.total_cases)
										: YScale(row.total_cases)
									: isTcn
									? isLog
										? yScaleLog(row.new_cases === 0 ? 1 : row.new_cases)
										: YScale(row.new_cases)
									: isDc
									? isLog
										? yScaleLog(row.total_deaths === 0 ? 1 : row.total_deaths)
										: YScale(row.total_deaths)
									: isDcn
									? isLog
										? yScaleLog(row.new_deaths === 0 ? 1 : row.new_deaths)
										: YScale(row.new_deaths)
									: isLog
									? yScaleLog(row.total_cases)
									: YScale(row.total_cases)
							}
							r={
								country.values.length - 1 <= i
									? 3
									: rad === `${row.dia_numero}-circle`
									? 4
									: 2
							}
							fill={country.color ? country.color : '#d81159'}
							onMouseOver={mouseOverHandler}
							onMouseOut={mouseOutHandler}
							val={row.total_cases}
						/>
					))
				)}
			</g>
			{filterNestData.map(country =>
				country.values.map((row, i) =>
					country.values.length - 1 === i ? (
						<g className='label-container'>
							<text
								key={`${row.dia_numero}-text`}
								x={xScale(row.dia_numero) + 10}
								y={
									isTc
										? isLog
											? yScaleLog(row.total_cases)
											: YScale(row.total_cases)
										: isTcn
										? isLog
											? yScaleLog(row.new_cases === 0 ? 1 : row.new_cases)
											: YScale(row.new_cases)
										: isDc
										? isLog
											? yScaleLog(row.total_deaths === 0 ? 1 : row.total_deaths)
											: YScale(row.total_deaths)
										: isDcn
										? isLog
											? yScaleLog(row.new_deaths === 0 ? 1 : row.new_deaths)
											: YScale(row.new_deaths)
										: isLog
										? yScaleLog(row.total_cases)
										: YScale(row.total_cases)
								}
								fill={country.color ? country.color : '#d81159'}
								style={{
									fontSize: '12px',
									fontWeight: 'bold',
									stroke: '#e0e0e0',
									strokeWidth: '1.5px',
									paintOrder: 'stroke'
								}}
							>
								{row.location}
							</text>
						</g>
					) : (
						``
					)
				)
			)}

			<text
				style={{ fontSize: '11px', fontStyle: 'italic', fill: '#818181' }}
				x={-20}
				y={350}
			>
				Fuente: European CDC
			</text>
		</svg>
	);
}
