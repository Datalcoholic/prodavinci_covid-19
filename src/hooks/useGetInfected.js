import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

export default function useGetInfected(url) {
	const [data, setData] = useState([]);
	const date = d3.timeParse('%m/%d/%Y');
	useEffect(() => {
		d3.csv(url, d => {
			return {
				fecha: date(d.fecha),
				nacionalidad: d.ciudadania,
				edo: d.edo,
				sexo: d.sexo,
				edad: +d.edad
			};
		}).then(resp => {
			setData(resp);
		});
	}, []);

	return [data, setData];
}
