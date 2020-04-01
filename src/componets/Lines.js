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
import { SvgContext } from '../contexts/SvgContext';
import { refLinesGene } from '../utilities/RefLinesGene';
import { FilterNestDataContext } from '../contexts/FilterNestDataContext';
import { gsap } from 'gsap';
import TooltipLineChart from './TooltipLineChart';

export default function LineChart() {
	const { worldData, setWorldData } = useContext(WorldDataContext);
	const [nestWorldData, setNestWorldData] = useState([]);
	const { maxD, setMaxD } = useContext(XDominioContext);
	const { totalMax, setTotalMax } = useContext(YDominioContext);
	const { countries, setCountries } = useContext(CountriesContext);
	const { countriesSelection, setCountriesSelection } = useContext(
		CountriesSelectionContext
	);
	const { filterNestData, setFilterNestData } = useContext(
		FilterNestDataContext
	);
	const { sliderValue, setSliderValue } = useContext(SliderContext);
	const { isLog, setIsLog } = useContext(IsLogContext);
	const [itsHover, setItsHover] = useState(false);
	const { tooltip, setToolTip } = useContext(ToolTipsContext);
	const [rad, setRad] = useState(2);
	// const { isTc, setIsTc } = useContext(TcContext);
	// const { isTcn, setIsTcn } = useContext(TcnContext);
	// const { isDc, setIsDc } = useContext(DcContext);
	// const { isDcn, setIsDcn } = useContext(DcnContext);
	const [ecdcData, setEcdcData] = useState([]);
	const { api, dispatch } = useContext(ApiContext);
	const [lineasRef, setLineasRef] = useState([]);
	const [xMouse, SetXMouse] = useState({ x: 0 });
	const [displayPoints, setDisplayPoints] = useState([]);
	const sRef = useContext(SvgContext);

	//FetchData
	const parseTime = d3.timeParse('%Y-%m-%d');
	const fechaFormat = d3.timeFormat('%d-%m-%Y');
	const weekOfTheYear = d3.timeFormat('%W');

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
				.then(resp =>
					resp.filter(
						d => d[Object.keys(d)[1]] !== 0 && d[Object.keys(d)[1]] !== null
					)
				)
				.then((resp, i) =>
					resp.map(
						(d, i) => (
							(d.dia_numero = i),
							(d.total_cases = d[Object.keys(d)[1]]),
							(d.location = Object.keys(d)[1]
								.split('___')[1]
								.split('_')[0]),
							(d.date = parseTime(d.date)),
							(d.fecha = fechaFormat(d.date)),
							(d.week = weekOfTheYear(d.date)),
							d
						)
					)
				)

				.then(resp => poolData.push(resp))
				.then(resp => setEcdcData(poolData.flat()))
				.then(resp => console.log('api', poolData))
				.catch(error => console.log(error));
		});
	}, [countriesSelection, api]);

	// console.log('ecdcData', ecdcData);

	const colors = [
		'#ffae19',
		'#09827e',
		'#7cb24c',
		'#8e0751',
		'#F84714',
		'#4024B0',
		'#0E3A8C'
	];

	// Lineas Referenciales
	useEffect(() => {
		const referencias = [1, 3, 5, 10].map(d => {
			return {
				cada: d,
				values: refLinesGene(150, 2, d)
			};
		});

		setLineasRef(referencias);
	}, []);

	//console.log('lineasRef', lineasRef);

	//Add colors to filterNestData
	// useEffect(() => {
	// 	const col = filterNestData.map(
	// 		(country, i) => (
	// 			(country.color = filterNestData.length - 1 > i ? colors[i] : '#626263'),
	// 			country
	// 		)
	// 	);

	// 	setFilterNestData({ ...filterNestData, col });
	// }, [countriesSelection]);
	// console.log('filterNestDatacolor', filterNestData);
	// filter data set by countriesSelections
	// useEffect(() => {
	// 	const filteredData = nestWorldData.filter(country =>
	// 		countriesSelection.find(d => country.key.toLowerCase() === d.value)
	// 	);

	// 	setFilterNestData(filteredData);
	// }, [countriesSelection, nestWorldData, sliderValue]);

	// Nest ecdc Data
	useEffect(() => {
		try {
			const filterByDays = ecdcData.filter(d => d.dia_numero <= sliderValue);

			const data = d3
				.nest()
				.key(d => {
					return d.location;
				})
				.entries(filterByDays);

			data.map(
				(d, i) => (
					(d.location_2 = countries.find(a => a.value === d.key).label),
					(d.color = data.length - 1 > i ? colors[i] : '#626263'),
					d
				)
			);

			setFilterNestData(data);
		} catch (error) {
			console.log('nest Data error :', error);
		}
		// data.map(country => country.value.filter(d => d.dia_numero <= sliderValue));
	}, [ecdcData, setFilterNestData, sliderValue]);

	// console.log('filterNestData', filterNestData);
	// console.log('filterDays', sliderValue);

	// Dias Maximo
	useEffect(() => {
		const maxD = d3.max(
			filterNestData.map(d => d3.max(d.values.map(d => d.dia_numero)))
		);
		setMaxD(maxD);
	}, [filterNestData, setMaxD]);

	// MAximo de total_cases
	useEffect(() => {
		const totalCasesMax = d3.max(
			filterNestData.map(d => d3.max(d.values.map(d => d.total_cases)))
		);
		setTotalMax(totalCasesMax);
	}, [filterNestData, setTotalMax]);

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
			return isLog ? yScaleLog(d.total_cases) : YScale(d.total_cases);
		});

	const numFormat = d3.format(',d');

	//Mouse eventLisetner
	useEffect(() => {
		sRef.current.addEventListener('mousemove', e => {
			let x, y;
			x = e.clientX;
			y = e.clientY;
			SetXMouse({ x: x });
			//console.log('coord :', `x:${x},y:${y}`);
		});

		return sRef.current.removeEventListener('mousemove', e => {
			let x, y;
			x = e.clientX;
			y = e.clientY;
			SetXMouse({ x: x });
		});
	}, []);

	function mouseOverHandler(d) {
		setItsHover(!itsHover);
		setToolTip({
			isShow: true,
			x: +d.target.attributes.cx.value,
			y: +d.target.attributes.cy.value,
			value: numFormat(+d.target.attributes.val.value),
			color: d.target.attributes.fill.value
		});

		console.log('tool', d.target);

		setRad(d.target.attributes.circleid.value);

		console.log(
			'filterPointsRef :',
			pointsRef.current.filter(d => d)
		);
	}

	function mouseOutHandler(params) {
		setToolTip({ isShow: false });
		setRad(false);
	}
	//Animations

	let pathRef = useRef([]);
	let pathBackRef = useRef([]);
	let pointsRef = useRef([]);
	let textRef = useRef([]);
	let groupsPointRef = useRef([]);

	useEffect(() => {
		try {
			const tooltipsPoints = Array.from(groupsPointRef.current.children).filter(
				circle =>
					Math.floor(+circle.attributes.cx.value) <= xMouse.x - 85 &&
					Math.floor(+circle.attributes.cx.value) >= xMouse.x - 85 - 20
			);
			setDisplayPoints(tooltipsPoints);
		} catch (error) {
			console.log('error :', error);
		}
	}, [xMouse]);

	//Lines and points timeline animation
	useEffect(() => {
		try {
			gsap
				.timeline()
				.fromTo(
					pathRef.current,
					{
						strokeDasharray: 5000,
						strokeDashoffset: 5000,
						stagger: 0.2
					},

					{ strokeDashoffset: 0, stagger: 0.25, duration: 0.5 }
				)
				.fromTo(
					pathBackRef.current,
					{
						strokeDasharray: 5000,
						strokeDashoffset: 5000,
						stagger: 0.2
					},

					{ strokeDashoffset: 0, stagger: 0.25, duration: 0.5 },
					'-=0.5'
				)
				.fromTo(
					pointsRef.current,
					{
						opacity: 0
					},
					{ opacity: 1, stagger: 0.1, duration: 0.6 },
					'-=1'
				)
				.fromTo(
					textRef.current,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.5, stagger: 0.3 }
				);
		} catch (error) {
			console.log(error);
		}
	}, [filterNestData]);

	//console.log('pathRef', pathRef);

	return (
		<svg style={{ overflow: 'visible' }}>
			{isLog && (
				<g className='linear-ref'>
					{/* Lineas referenciales */}
					{lineasRef.map((d, i) => (
						<svg>
							<path
								id={`line-${d.cada}`}
								key={`referencias-${i}`}
								d={line(d.values)}
								stroke='#a0a0a0'
								style={{ strokeDasharray: 3 }}
								fill='none'
							/>
							<text>
								<textPath
									xlinkHref={`#line-${d.cada}`}
									startOffset={
										d.cada === 1
											? 400
											: d.cada === 3
											? 600
											: d.cada >= 5
											? 700
											: 400
									}
									style={{
										fill: '#a0a0a0',
										fontSize: '12px',
										fontWeight: 'bold',
										stroke: '#f7f7f7',
										strokeWidth: '1.8px',
										paintOrder: 'stroke'
									}}
								>
									{`Casos se duplican cada ${d.cada} `}
								</textPath>
							</text>
						</svg>
					))}
				</g>
			)}
			<g className='path-container'>
				{filterNestData.map((d, i) => (
					<svg>
						<path
							ref={el => (pathBackRef.current[i] = el)}
							key={`${d.key}-${i}-back-line`}
							d={line(d.values)}
							style={{
								stroke: '#e0e0e0',
								strokeWidth: '3px',
								fill: 'none'
							}}
							className={`backline-pais-${i}`}
						/>
						<path
							ref={el => (pathRef.current[i] = el)}
							d={line(d.values)}
							key={`${d.key}-${i}`}
							// stroke={d.color ? d.color : '#d81159'}
							fill='none'
							className={`pais-${i}`}
							style={{ stroke: d.color ? d.color : '#d81159' }}
						/>
					</svg>
				))}
			</g>
			<g className='points container' ref={groupsPointRef}>
				{filterNestData.map(country =>
					country.values.map((row, i) => (
						<circle
							ref={el => (pointsRef.current[i] = el)}
							className={`pais-${i}-circle`}
							key={`${row.dia_numero}-${country.key}-circle`}
							cx={xScale(row.dia_numero)}
							cy={isLog ? yScaleLog(row.total_cases) : YScale(row.total_cases)}
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
							pais={country.location_2}
							circleid={`${row.dia_numero}-circle`}
							xpos={xMouse.x}
						/>
					))
				)}
			</g>

			{filterNestData.map((country, ind) =>
				country.values.map((row, i) =>
					country.values.length - 1 === i ? (
						<g className='label-container'>
							<text
								ref={el => (textRef.current[ind] = el)}
								key={`${row.dia_numero}-text`}
								x={xScale(row.dia_numero) + 10}
								y={isLog ? yScaleLog(row.total_cases) : YScale(row.total_cases)}
								fill={country.color ? country.color : '#d81159'}
								style={{
									fontSize: '12px',
									fontWeight: 'bold',
									stroke: '#f7f7f7',
									strokeWidth: '1.8px',
									paintOrder: 'stroke'
								}}
							>
								{country.location_2}
							</text>
						</g>
					) : (
						``
					)
				)
			)}
			{displayPoints.length !== 0 ? (
				<TooltipLineChart {...[displayPoints]} />
			) : (
				''
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
