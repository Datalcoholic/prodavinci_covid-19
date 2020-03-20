import React, { useContext, useState, useEffect } from 'react';
import { WorldDataContext } from '../contexts/WorldDataContext';
import { XDominioContext } from '../contexts/XDominioContext';
import { YDominioContext } from '../contexts/YDominioContext';
import { CountriesContext } from '../contexts/CountriesContext';
import { CountriesSelectionContext } from '../contexts/CountriesSelectionContext';
import { SliderContext } from '../contexts/SliderContext';
import * as d3 from 'd3';
import Slider from '@material-ui/core/Slider';
import Select from 'react-select';
import XAxis from './XAxis';
import YAxis from './YAxis';
import Lines from './Lines';

export default function LinearGrahp() {
	const [maxD, setMaxD] = useState();
	const [totalMax, setTotalMax] = useState();
	const [countries, setCountries] = useState([]);
	const [countriesSelection, setCountriesSelection] = useState([
		{ value: 'world', label: 'world' }
	]);
	const [sliderValue, setSliderValue] = useState(1);

	function handlerSliderValue(e, newValue) {
		setSliderValue(newValue);
	}

	return (
		<div className='linear-container'>
			<div className='tabs-container'>
				<button className='tc'>Total Casos</button>
				<button className='tcn'>total Casos nuevos</button>
			</div>
			<CountriesContext.Provider value={{ countries, setCountries }}>
				<div className='tools-container'>
					<div className='search'>
						<Select
							options={countries}
							isMulti
							defaultValue={[{ value: 'world', label: 'world' }]}
							placeholder='Add Country...'
							onChange={setCountriesSelection}
						/>
					</div>
					<div className='slider'>
						<Slider
							aria-label='Dias'
							aria-valuetext='Dias'
							min={1}
							max={maxD}
							onChange={handlerSliderValue}
							valueLabelDisplay='off'
						/>
						<div className='slider-display'>{`${sliderValue} Dias`}</div>
					</div>
				</div>
				<div className='lin-graph-container'>
					<svg
						width={1050}
						height={400}
						viewBox='-50 0 1050 350'
						style={{ backgroundColor: '#e0e0e0', borderRadius: 10 }}
					>
						<XDominioContext.Provider value={{ maxD, setMaxD }}>
							<YDominioContext.Provider value={{ totalMax, setTotalMax }}>
								<CountriesSelectionContext.Provider
									value={{ countriesSelection, setCountriesSelection }}
								>
									<Lines />
								</CountriesSelectionContext.Provider>

								<SliderContext.Provider value={{ sliderValue, setSliderValue }}>
									<XAxis />
								</SliderContext.Provider>
								<YAxis />
							</YDominioContext.Provider>
						</XDominioContext.Provider>
					</svg>
				</div>
			</CountriesContext.Provider>
		</div>
	);
}
