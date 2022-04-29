const api_url =
	'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

let dataset = [],
	gdpData = [],
	datesData = [],
	numeralDates = [];

const svgWidth = 850,
	svgHeight = 600,
	padding = 40;
let xScale, yScale, linearScale;

const svg = d3
	.select('#svg-container')
	.append('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight);

var tooltip = d3
	.select('svg')
	.append('text')
	.attr('id', 'tooltip')
	.style('visibility', 'hidden')
	.style('width', 'auto')
	.style('height', 'auto');

const mouseleave = (event, d) => {
	tooltip.style('visibility', 'hidden');
};

const mouseover = (event, d) => {
	tooltip.html(`${quarter(d)} ~ $${d[1].toFixed(2)} B`);
	tooltip.attr(
		'transform',
		`translate(${svgWidth / 2 - 85}, ${svgHeight / 2})`
	);
	tooltip.attr('data-date', d[0]);
	tooltip.style('visibility', 'visible');
};

// Check which yearly quarter match the date given.
const quarter = (d) => {
	let dateArr = d[0].split('-');
	if (dateArr[1] === '01') {
		return `Jan ${dateArr[0]} - Q1`;
	} else if (dateArr[1] === '04') {
		return `Apr ${dateArr[0]} - Q2`;
	} else if (dateArr[1] === '07') {
		return `Jul ${dateArr[0]} - Q3`;
	} else if (dateArr[1] === '10') {
		return `Oct ${dateArr[0]} - Q4`;
	}
};

const scales = () => {
	numeralDates = datesData.map((date) => new Date(date));
	xScale = d3 // Scale th x-axis.
		.scaleTime()
		.domain([d3.min(numeralDates), d3.max(numeralDates)])
		.range([padding, svgWidth - padding]);

	yScale = d3 // Scale the y-axis.
		.scaleLinear()
		.domain([0, d3.max(gdpData)])
		.range([svgHeight - padding, padding]);

	linearScale = d3 // Scale the height and y attributes of the bar.
		.scaleLinear()
		.domain([0, d3.max(gdpData)])
		.range([0, svgHeight - 2 * padding]);
};

const axis = () => {
	let y_axis = d3.axisLeft(yScale);
	let yAxisTranslate = padding;
	svg
		.append('g')
		.attr('id', 'y-axis')
		.attr('transform', 'translate(' + yAxisTranslate + ',0)')
		.call(y_axis);

	let x_axis = d3.axisBottom(xScale);
	let xAxisTranslate = svgHeight - padding;
	svg
		.append('g')
		.attr('id', 'x-axis')
		.attr('transform', 'translate(0,' + xAxisTranslate + ')')
		.call(x_axis);
};

const labels = () => {
	svg
		.append('text')
		.attr('id', 'x-label')
		.attr('x', svgWidth - padding * 4.5)
		.attr('y', svgHeight - 5)
		.text('years (In quarters)');

	svg
		.append('text')
		.attr('id', 'y-label')
		.attr('y', padding / 2)
		.text('Gross Domestic Product (GDP)');
};

const drawRects = () => {
	let barWidth = (svgWidth - 2 * padding) / (gdpData.length - 1);
	svg
		.selectAll('rect')
		.data(dataset)
		.enter()
		.append('rect')
		.attr('y', (d) => svgHeight - padding - linearScale(d[1]))
		.attr('width', barWidth)
		.attr('height', (d) => linearScale(d[1]))
		.attr('class', 'bar')
		.attr('transform', (d, i) => {
			let translate = [barWidth * i + padding, 0];
			return 'translate(' + translate + ')';
		})
		.attr('data-gdp', (d) => d[1])
		.attr('data-date', (d) => d[0])
		.on('mouseover', mouseover)
		.on('mouseleave', mouseleave);
};

fetch(api_url)
	.then((response) => response.json())
	.then((json) => {
		dataset = json.data;
		gdpData = json.data.map((data) => data[1]);
		datesData = json.data.map((data) => data[0]);
		scales();
		axis();
		drawRects();
		labels();
	})
	.catch((e) => console.log(e));
