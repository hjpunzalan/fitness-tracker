import './main.scss';
import { btns, form, formAct, input, error } from './View';
import { db } from './vendor';

// Navigation buttons
let activity: string | undefined = 'cycling';

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
