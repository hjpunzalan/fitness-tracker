import * as d3 from 'd3';
import { db } from './vendor';

// data and firestore
export interface GraphData {
	id: string;
	activity: string;
	date: string;
	distance: number;
}

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

// d3 line path generator
const line = d3
	.line<GraphData>()
	.x(function(d: GraphData) {
		return x(new Date(d.date));
	})
	.y(function(d: GraphData) {
		return y(d.distance);
	});

//  line path element
const path = graph.append('path');

// create dotted line group and append to graph
const dottedLines = graph
	.append('g')
	.attr('class', 'lines')
	.style('opacity', 0);

// create x dotted line and append to dotted line group
const xDottedLine = dottedLines
	.append('line')
	.attr('stroke', '#aaa')
	.attr('stroke-width', 1)
	.attr('stroke-dasharray', 4);

// create y dotted line and append to dotted line group
const yDottedLine = dottedLines
	.append('line')
	.attr('stroke', '#aaa')
	.attr('stroke-width', 1)
	.attr('stroke-dasharray', 4);

// update function
export const update = (
	data: GraphData[],
	activity?: string | undefined
): void => {
	// Filters data according to the activity
	data = data
		.filter(item => item.activity == activity)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	//  set scale domains
	x.domain(d3.extent(data, d => new Date(d.date)) as Date[]);
	y.domain([0, d3.max(data, d => d.distance) as number]);

	// update path data
	path
		.data([data]) // must be passed as an array of array
		.attr('fill', 'none')
		.attr('stroke', '#00bfa5')
		.attr('stroke-width', 2)
		.attr('d', line);

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

	graph
		.selectAll<SVGCircleElement, GraphData>('circle')
		.on('mouseover', (d, i, n) => {
			d3.select(n[i])
				.transition()
				.duration(100)
				.attr('r', 8)
				.attr('fill', '#fff')
				.attr('cursor', 'pointer');

			// set x dotted line coords (x1,x2,y1,y2)
			xDottedLine
				.attr('x1', x(new Date(d.date)))
				.attr('x2', x(new Date(d.date)))
				.attr('y1', graphHeight)
				.attr('y2', y(d.distance));

			// set y dotted line coords (x1,x2,y1,y2)
			yDottedLine
				.attr('x1', 0)
				.attr('x2', x(new Date(d.date)))
				.attr('y1', y(d.distance))
				.attr('y2', y(d.distance));

			// show the dotted line group (.style opacity)
			dottedLines.style('opacity', 1);
		})
		.on('mouseleave', (d, i, n) => {
			d3.select(n[i])
				.transition()
				.duration(100)
				.attr('r', 4)
				.attr('fill', '#ccc');

			// hide the dotted line group
			dottedLines.style('opacity', 0);
		});

	// remove points
	circles.exit().remove();

	// create axis
	const xAxis = d3
		.axisBottom<Date>(x)
		.ticks(4)
		.tickFormat(d3.timeFormat('%b %d'));

	const yAxis = d3
		.axisLeft(y)
		.ticks(4)
		.tickFormat(d => d + 'm');

	// call axis - AxisGroup function uses Axis as argument
	xAxisGroup.call(xAxis);
	yAxisGroup.call(yAxis);

	// rotate axis text
	xAxisGroup
		.selectAll('text')
		.attr('transform', 'rotate(-40)')
		.attr('text-anchor', 'end');
};
