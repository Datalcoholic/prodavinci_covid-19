import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

export default function useGetTopoJson(url) {
	const [map, setMap] = useState([]);

	useEffect(() => {
		d3.json(url).then(resp => {
			setMap(feature(resp, resp.objects.Ven_base));
		});
	}, []);

	return [map, setMap];
}
