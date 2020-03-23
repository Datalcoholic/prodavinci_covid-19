import React, { useContext, useState, useEffect } from 'react';
import { WorldDataContext } from '../contexts/WorldDataContext';
import { XDominioContext } from '../contexts/XDominioContext';
import { YDominioContext } from '../contexts/YDominioContext';
import { CountriesContext } from '../contexts/CountriesContext';
import { CountriesSelectionContext } from '../contexts/CountriesSelectionContext';
import { SliderContext } from '../contexts/SliderContext';
import { IsLogContext } from '../contexts/IsLogContext';
import * as d3 from 'd3';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';
import Select from 'react-select';
import XAxis from './XAxis';
import YAxis from './YAxis';
import Lines from './Lines';

function customStyle(theme) {
	return {
		...theme,
		colors: {
			...theme.colors,
			primary25: '#818181',
			primary: '#0E3A8C'
		}
	};
}

const useStyles = makeStyles({
	root: {
		color: '#0E3A8C'
	}
});

export default function LinearGrahp() {
	const [maxD, setMaxD] = useState();
	const [totalMax, setTotalMax] = useState();
	const [countries, setCountries] = useState([]);
	const [countriesSelection, setCountriesSelection] = useState([
		{ value: 'world', label: 'world' },
		{ value: 'venezuela', label: 'venezuela' }
	]);

	const [sliderValue, setSliderValue] = useState(1);
	const classes = useStyles();
	const [isLog, setIsLog] = useState(false);

	function handlerSliderValue(e, newValue) {
		setSliderValue(newValue);
	}

	function switchHandler() {
		setIsLog(!isLog);
		console.log('swicht :', isLog);
	}

	return (
		<div className='linear-container'>
			<div className='tabs-container'>
				<button className='tc'>Total Contagios Confirmados</button>
				<button className='tcn'>total Casos nuevos</button>
			</div>
			<CountriesContext.Provider value={{ countries, setCountries }}>
				<XDominioContext.Provider value={{ maxD, setMaxD }}>
					<div className='tools-container'>
						<div className='search'>
							<div className='swicht-container'>
								<span>Linear</span>
								<Switch size='small' label='Log' onChange={switchHandler} />
								<span>Log</span>
							</div>
							<Select
								options={countries}
								theme={customStyle}
								isMulti
								defaultValue={[
									{ value: 'world', label: 'world' },
									{ value: 'venezuela', label: 'venezuela' }
								]}
								placeholder='Add Country...'
								onChange={setCountriesSelection}
							/>
						</div>
						<div className='slider'>
							<Slider
								className={classes.root}
								aria-label='Dias'
								aria-valuetext='Dias'
								min={1}
								max={maxD}
								onChange={handlerSliderValue}
								valueLabelDisplay='off'
							/>
							<div className='slider-display'>{`${sliderValue} dias `}</div>
						</div>
					</div>
					<div className='lin-graph-container'>
						<svg
							width={1050}
							height={400}
							viewBox='-50 -10  1050 350'
							style={{ backgroundColor: '#e0e0e0', borderRadius: 10 }}
						>
							<YDominioContext.Provider value={{ totalMax, setTotalMax }}>
								<SliderContext.Provider value={{ sliderValue, setSliderValue }}>
									<XAxis />
								</SliderContext.Provider>
								<IsLogContext.Provider value={{ isLog, setIsLog }}>
									<YAxis />
									<CountriesSelectionContext.Provider
										value={{ countriesSelection, setCountriesSelection }}
									>
										<Lines />
									</CountriesSelectionContext.Provider>
								</IsLogContext.Provider>
							</YDominioContext.Provider>
						</svg>
					</div>
				</XDominioContext.Provider>
			</CountriesContext.Provider>
		</div>
	);
}
