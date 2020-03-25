export default function GetCountryData(arr) {
	const poolData = [];

	arr.forEach(url => {
		const myRequest = new Request(url, {
			method: 'GET',
			headers: new Headers({
				token: 'covid19'
			})
		});

		fetch(myRequest)
			.then(resp => resp.json())
			.then((resp, i) => resp.data.map((d, i) => ((d.dia_numero = i), d)))
			.then(resp => poolData.push(resp))
			.then(resp => console.log('api', [...poolData]))
			.catch(error => console.log(error));
	});

	return poolData;
}
