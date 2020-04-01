import React, {
	useContext,
	useState,
	useEffect,
	useReducer,
	useRef
} from 'react';
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
import {
	makeStyles,
	ThemeProvider,
	createMuiTheme
} from '@material-ui/core/styles';
import Select from 'react-select';
import XAxis from './XAxis';
import YAxis from './YAxis';
import Lines from './Lines';
import ToolTip from './ToolTip';
import { ToolTipsContext } from '../contexts/ToolTipsContext';
import {
	TcContext,
	TcnContext,
	DcContext,
	DcnContext
} from '../contexts/ButtonsContext';
import { ApiContext } from '../contexts/ApiContext';
import { svgContext, SvgContext } from '../contexts/SvgContext';

function reducer(state, action) {
	switch (action.type) {
		case 'TC':
			return '_cases_cum';
		case 'TCN':
			return '_cases';
		case 'DC':
			return '_deaths_cum';
		case 'DCN':
			return '_deaths';
		default:
			return '_cases_cum';
	}
}

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

const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#0E3A8C'
		},
		secondary: {
			main: '#ff7c04'
		},
		error: {
			main: '#dedede'
		},
		background: {
			default: '#ffffff'
		}
	}
});

const useStyles = makeStyles({
	root: {
		color: '#0E3A8C'
	}
});

const paisesLista = [
	{ value: 'VE', label: 'Venezuela' },
	{ label: 'Colombia', value: 'CO' },
	{ label: 'Brazil', value: 'BR' },
	{ label: 'Peru', value: 'PE' },
	{ label: 'Ecuador', value: 'EC' },
	{ label: 'Bolivia', value: 'BO' },
	{ label: 'Uruguay', value: 'UY' },
	{ label: 'Paraguay', value: 'PY' },
	{ label: 'Argentina', value: 'AR' }
];

export default function LinearGrahp() {
	const [maxD, setMaxD] = useState();
	const [totalMax, setTotalMax] = useState();
	const [countries, setCountries] = useState([]);
	const [countriesSelection, setCountriesSelection] = useState(paisesLista);

	const [sliderValue, setSliderValue] = useState(150);
	const classes = useStyles();
	const [isLog, setIsLog] = useState(false);
	const { toolTip, setToolTip } = useContext(ToolTipsContext);
	const [isTc, setIsTc] = useState(true);
	const [isTcn, setIsTcn] = useState(false);
	const [isDc, setIsDc] = useState(false);
	const [isDcn, setIsDcn] = useState(false);

	const [api, dispatch] = useReducer(reducer, '_cases_cum');
	const [sRef, setSRef] = useState();

	const svgRef = useRef();

	useEffect(() => {
		setSRef(svgRef);
	}, []);

	function handlerSliderValue(e, newValue) {
		setSliderValue(newValue);
	}

	function switchHandler() {
		setIsLog(!isLog);
	}

	function handlerClickTc(params) {
		setIsTc(true);
		setIsTcn(false);
		setIsDc(false);
		setIsDcn(false);

		dispatch({ type: 'TC' });
	}
	function handlerClickTcn(params) {
		setIsTcn(true);
		setIsTc(false);
		setIsDc(false);
		setIsDcn(false);
		dispatch({ type: 'TCN' });
	}
	function handlerClickDc(params) {
		setIsTcn(false);
		setIsTc(false);
		setIsDc(true);
		setIsDcn(false);
		dispatch({ type: 'DC' });
	}
	function handlerClickDcn(params) {
		setIsTcn(false);
		setIsTc(false);
		setIsDc(false);
		setIsDcn(true);
		dispatch({ type: 'DCN' });
	}

	return (
		<div className='linear-container'>
			<div className='tabs-container'>
				<button className='tc' onClick={handlerClickTc}>
					Contagios Confirmados
				</button>
				<button className='tcn' onClick={handlerClickTcn}>
					Casos nuevos
				</button>
				<button className='dc' onClick={handlerClickDc}>
					Decesos Confirmados
				</button>
				<button className='dcn' onClick={handlerClickDcn}>
					nuevos Decesos
				</button>
			</div>
			<CountriesContext.Provider value={{ countries, setCountries }}>
				<XDominioContext.Provider value={{ maxD, setMaxD }}>
					<div className='tools-container'>
						<div className='search'>
							<div className='swicht-container'>
								<span>Linear</span>
								<ThemeProvider theme={theme}>
									<Switch
										size='small'
										label='Log'
										onChange={switchHandler}
										color='primary'
									/>
								</ThemeProvider>

								<span>Log</span>
							</div>
							<Select
								options={countries}
								theme={customStyle}
								isMulti
								defaultValue={paisesLista}
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
								max={365}
								onChange={handlerSliderValue}
								valueLabelDisplay='off'
							/>
							<div className='slider-display'>{`${sliderValue} dias `}</div>
						</div>
					</div>
					<div className='lin-graph-container'>
						<svg
							ref={svgRef}
							width={1050}
							height={385}
							viewBox='-50 -20  1050 385'
							style={{ backgroundColor: '#e0e0e0', borderRadius: 10 }}
						>
							<YDominioContext.Provider value={{ totalMax, setTotalMax }}>
								<TcContext.Provider value={{ isTc, setIsTc }}>
									<TcnContext.Provider value={{ isTcn, setIsTcn }}>
										<DcContext.Provider value={{ isDc, setIsDc }}>
											<DcnContext.Provider value={{ isDcn, setIsDcn }}>
												<ApiContext.Provider value={{ api, dispatch }}>
													<SliderContext.Provider
														value={{ sliderValue, setSliderValue }}
													>
														<XAxis />

														<IsLogContext.Provider value={{ isLog, setIsLog }}>
															<YAxis />
															<CountriesSelectionContext.Provider
																value={{
																	countriesSelection,
																	setCountriesSelection
																}}
															>
																<SvgContext.Provider value={svgRef}>
																	<Lines />
																	toolTip.isShow && <ToolTip />
																</SvgContext.Provider>
															</CountriesSelectionContext.Provider>
														</IsLogContext.Provider>
													</SliderContext.Provider>
												</ApiContext.Provider>
											</DcnContext.Provider>
										</DcContext.Provider>
									</TcnContext.Provider>
								</TcContext.Provider>
							</YDominioContext.Provider>
						</svg>
					</div>
				</XDominioContext.Provider>
			</CountriesContext.Provider>
		</div>
	);
}
