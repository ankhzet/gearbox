import React from 'react';
import * as ReactDOM from 'react-dom';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'alertifyjs/build/css/alertify.css';

import '../../styles/main.css';

import { Popup } from './components';

ReactDOM.render(<Popup />, document.getElementById('app'));
