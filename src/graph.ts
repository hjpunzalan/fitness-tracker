import { db } from './vendor';

// data and firestore
interface GraphData {
	id: string;
	activity: string;
	date: Date;
	distance: number;
}

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
