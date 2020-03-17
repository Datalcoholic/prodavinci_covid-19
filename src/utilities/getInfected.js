import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

export default function getInfected(url) {
	//const [data, setData] = useState([]);
	const date = d3.timeParse('%m/%d/%Y');
	//	useEffect(() => {
	const data = [];

	d3.csv(url, d => {
		return {
			fecha: date(d.fecha),
			nacionalidad: d.nacionalidad,
			edo: d.edo,
			sexo: d.sexo,
			edad: +d.edad
		};
	}).then(resp => {
		data.push(resp);
	});
	//	}, []);
	return data;
	//return [data, setData];
	//}
}
