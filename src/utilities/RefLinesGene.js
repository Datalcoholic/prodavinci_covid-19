import * as d3 from 'd3';

export const doubling = function(num) {
	num *= 2;
	return num;
};

export const refLinesGene = function(numDias, num_ini = 2, cadaDia = 10) {
	let res = [num_ini];
	let data = [];
	let arrayDays = d3.range(numDias);

	arrayDays.forEach((d, i) => {
		d % cadaDia === 0
			? res.push(doubling(res[res.length - 1]))
			: res.push(res[res.length - 1]);

		if (i === 0 || i === arrayDays.length - 1) {
			d % cadaDia === 0
				? data.push({ dia_numero: d, total_cases: res[i] })
				: data.push({ dia_numero: d, total_cases: res[res.length - 1] });
		} else {
			console.log('pass');
		}
	});

	return data;
};
