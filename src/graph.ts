import { db } from './vendor';
import d3 from 'd3';

// data and firestore
interface GraphData {
	id: string;
	activity: string;
	date: Date;
	distance: number;
}

const margin = { top: 40, right: 20, bottom: 50, left: 100 }; // give space to axis
const graphWidth = 560 - margin.left - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

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

// update function
const update = (data: GraphData) => {};

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
});
