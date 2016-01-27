import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import AddCharacter from './components/AddCharacter';
import Character from './components/Character';
import CharacterList from './components/CharacterList';

export default (
	<Route component={App}>
		<Route path='/' component={Home}/>
		<Route path='/add' component={AddCharacter} />
		<Route path='/characters/:id' component={Character} />
		<Route path=':category' component={CharacterList}>
      <Route path=':race' component={CharacterList}>
        <Route path=':bloodline' component={CharacterList} />
      </Route>
    </Route>
	</Route>
);