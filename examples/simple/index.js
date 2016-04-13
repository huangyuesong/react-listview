require('es6-promise').polyfill();
import 'fetch-detector';
import 'fetch-polyfill';

import iNoBounce from 'inobounce';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, Redirect } from 'react-router';
import Simple from './components/Simple';
import Ajax from './components/Ajax';

import './styles/main.scss';

import App from './components/App';

ReactDOM.render((
    <Router>
        <Route path="/" component={App}/>
        <Route path="/simple" component={Simple}/>
        <Route path="/ajax" component={Ajax}/>
    </Router>
), document.getElementById('main'));
