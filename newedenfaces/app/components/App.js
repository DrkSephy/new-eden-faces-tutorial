import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

// this.props.children will render one of the following
// components depending on the URL path:
// Home, Top 100, Profile or Add Character

// Router now automatically populates this.props.children
// of the components based on the active route.

class App extends React.Component {
	render() {
		return (
			<div>
				<Navbar history={this.props.history} />
				{this.props.children}
				<Footer />
			</div>
		);
	}
}

export default App;