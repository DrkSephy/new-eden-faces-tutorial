import React from 'react';
import Router from 'react-router';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes from './routes';

let history = createBrowserHistory();

// React.render now lives in the react-dom package.
// React.HistoryLocation is now handled by the history package.
// We use history to enable HTML5 History API and to programatically
// transition between routes. Routers are now passed to the <Router>
// component as children instead of pop.

// Note: main.js is the entry point of our React app. The gulpfile uses it and
// Browserify will traverse the entire tree of dependencies and generate the 
// final bundle.js.
ReactDOM.render(<Router history={history}>{routes}</Router>, document.getElementById('app'));