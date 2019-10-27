import * as d3 from 'd3';
import { db } from './vendor';

// data and firestore
interface GraphData {
	id: string;
	activity: string;
	date: string;
	distance: number;
}

export default (function() {
	const margin = { top: 40, right: 20, bottom: 50, left: 100 }; // give space to axis
	const graphWidth = 560 - margin.left - margin.left - margin.right;
	const graphHeight = 400 - margin.top - margin.bottom;

	// Selectors
	const svg = d3
		.select('.canvas')
		.append('svg')
		.attr('width', graphWidth + margin.left + margin.right)
		.attr('height', graphHeight + margin.bottom + margin.top);

	const graph = svg
		.append('g')
		.attr('width', graphWidth)
		.attr('height', graphHeight)
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	// scales for data
	const x = d3.scaleTime().range([0, graphWidth]);
	const y = d3.scaleLinear().range([graphHeight, 0]);

	// axis groups
	const xAxisGroup = graph
		.append('g')
		.attr('class', 'x-axis')
		.attr('transform', `translate(0, ${graphHeight})`);

	const yAxisGroup = graph.append('g').attr('class', 'y-axis');
	// update function
	const update = (data: GraphData[]): void => {
		//  set scale domains
		x.domain(d3.extent(data, d => new Date(d.date)) as Date[]);
		y.domain([0, d3.max(data, d => d.distance) as number]);

		// create circles for objects
		const circles = graph.selectAll('circle').data(data);

		// update current points
		circles
			.attr('cx', d => x(new Date(d.date)))
			.attr('cy', d => y(new Date(d.distance)));

		// add new points
		circles
			.enter()
			.append('circle')
			.attr('r', 4)
			.attr('cx', d => x(new Date(d.date)))
			.attr('cy', d => y(new Date(d.distance)))
			.attr('fill', '#ccc');

		// remove points
		circles.exit().remove();

		// create axis
		const xAxis = d3
			.axisBottom(x)
			.ticks(4)
			.tickFormat(d3.timeFormat('%b %d') as (
				domainValue: number | Date | { valueOf(): number },
				index: number
			) => string);
		const yAxis = d3.axisLeft(y);

		// call axis - AxisGroup function uses Axis as argument
		xAxisGroup.call(xAxis);
		yAxisGroup.call(yAxis);

		// rotate axis text
		xAxisGroup
			.selectAll('text')
			.attr('transform', 'rotate(-40)')
			.attr('text-anchor', 'end');
	};

	let data: GraphData[] = [];

	db.collection('activities').onSnapshot(res => {
		res.docChanges().forEach(change => {
			// Add id to doc (doc that made changes) because firestore separates it
			const doc: GraphData = {
				...(change.doc.data() as GraphData),
				id: change.doc.id
			};

			switch (change.type) {
				case 'added':
					data.push(doc);
					break;
				case 'modified':
					const index = data.findIndex(item => item.id === doc.id);
					data[index] = doc;
					break;
				case 'removed':
					data = data.filter(item => item.id !== doc.id);
					break;
				default:
					break;
			}
		});
		update(data);
	});
})();
