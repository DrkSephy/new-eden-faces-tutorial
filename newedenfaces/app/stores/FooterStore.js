import alt from '../alt';
import FooterActions from '../actions/FooterActions';

class FooterStore {
	constructor() {
		// bindActions binds actions to their respective handlers
		// defined in the store
		this.bindActions(FooterActions);
		this.characters = [];
	}

	onGetTopCharactersSuccess(data) {
		this.characters = data.slice(0, 5);
	}

	onGetTopCharactersFail(jqXhr) {
		// Handle multiple response formats, fallback to HTTP status code number
		toastr.error(jqXhr.responseJSON && jqXhr.responseJSON.message || jqXhr.responseText || jqXhr.statusText);
	}
}

export default alt.createStore(FooterStore);