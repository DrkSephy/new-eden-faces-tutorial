import React from 'react';

// this.props.children will render one of the following
// components depending on the URL path:
// Home, Top 100, Profile or Add Character

// Router now automatically populates this.props.children
// of the components based on the active route.

class App extends React.Component {
	render() {
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
}

export default App;