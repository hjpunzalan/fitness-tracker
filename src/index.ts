import './main.scss';
import { btns, form, formAct, input, error } from './View';
import { db } from './vendor';
import { update, GraphData } from './graph';

// Navigation buttons
let activity: string | undefined = 'cycling';

// Main data
let data: GraphData[] = [];

btns.forEach(btn => {
	btn.addEventListener('click', (e: Event) => {
		// get activity
		activity = (e.target as HTMLButtonElement).dataset.activity;

		// remove and add active class
		btns.forEach(btn => btn.classList.remove('active'));
		(e.target as HTMLButtonElement).classList.add('active');

		// set id of input field
		if (input && activity) input.setAttribute('id', activity);

		// set text of form span
		if (formAct && activity) formAct.textContent = activity;

		// call the update function
		update(data, activity);
	});
});

// form submit
form &&
	form.addEventListener('submit', (e: Event) => {
		e.preventDefault();

		const distance = input && parseInt(input.value);
		if (distance) {
			db.collection('activities')
				.add({
					distance,
					activity,
					date: new Date().toString() // string to ignore firebase timestamps
				})
				.then(() => {
					// Reset errors and input
					if (error) error.textContent = '';
					if (input) input.value = '';
				});
		} else {
			if (error) error.textContent = 'Please enter a valid distance';
		}
	});

//  Graph listening to firestore
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
	update(data, activity);
});
