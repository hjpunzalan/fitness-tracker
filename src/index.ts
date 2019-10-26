import './main.scss';
import { btns, form, formAct, input, error } from './View';
import { db } from './vendor';

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
