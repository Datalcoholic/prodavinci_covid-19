import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

export default function useGetEstados(url) {
	const [map, setMap] = useState([]);

	useEffect(() => {
		d3.json(url)
			.then(resp => {
				const r = feature(resp, resp.objects.VEN_adm1).features;

				return r;
			})
			// .then(resp => {
			// 	resp.push({
			// 		type: 'feature',
			// 		properties: { NAME_1: 'no informado' },
			// 		geometry: {
			// 			type: 'Polygon',
			// 			coordinates: [
			// 				[
			// 					[-58.51318359374999, 8.47237228290914],
			// 					[-55.70068359375, 8.47237228290914],
			// 					[-55.70068359375, 10.466205555063882],
			// 					[-58.51318359374999, 10.466205555063882],
			// 					[-58.51318359374999, 8.47237228290914]
			// 				]
			// 			]
			// 		}
			// 	});

			// 	console.log(resp, 'test');
			// })
			.then(resp => {
				setMap(resp);
			});
	}, []);

	return [map, setMap];
}
