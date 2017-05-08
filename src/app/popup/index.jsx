import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import baseTheme from '../commons/themes/indigo';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './containers/App';
import store from './redux/store';
import { configLoad } from './redux/actions';
injectTapEventPlugin();

store.dispatch(configLoad());

const muiTheme = getMuiTheme(baseTheme);

render((
  <MuiThemeProvider muiTheme={muiTheme}>
    <Provider store={store}>
      <App />
    </Provider>
  </MuiThemeProvider>
), document.getElementById('app'));
