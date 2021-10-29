import React from 'react';

import { HashRouter, Route } from 'react-router-dom';
import { DashboardRoutes } from './dashboard';
import { AboutRoutes } from './about';
import { PluginsRoutes } from './pluginsRouting';
import { App } from './app';

export class Popup extends React.Component {
    render() {
        return (
            <HashRouter>
                <Route
                    render={(props) => (
                        <App {...props}>
                            {PluginsRoutes}
                            {AboutRoutes}
                            {DashboardRoutes}
                        </App>
                    )}
                />
            </HashRouter>
        );
    }
}
