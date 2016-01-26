// Import an instance of alt from alt.js
// This instantiates the Flux dispatcher and
// provides methods for creating Alt actions
// and stores. Sort of like a glue between
// all of our stores and actions
import alt from '../alt';

class FooterActions {
	constructor() {
		this.generateActions(
			'getTopCharactersSuccess',
			'getTopChararactersFail'
		);
	}

	getTopCharacters() {
		$.ajax({ url: '/api/characters/top' })
			.done((data) => {
				this.actions.getTopCharactersSuccess(data)
			})
			.fail((jqXhr) => {
				this.actions.getTopChararactersFail(jqXhr)
			});
	}
}

export default alt.createActions(FooterActions);