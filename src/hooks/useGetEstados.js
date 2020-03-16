import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

export default function useGetEstados(url) {
	const [map, setMap] = useState([]);

	useEffect(() => {
		d3.json(url).then(resp => {
			setMap(feature(resp, resp.objects.VEN_adm1).features);
		});
	}, []);

	return [map, setMap];
}
