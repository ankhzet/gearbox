import React from 'react';

import { MemoryRouter, Redirect, Switch } from 'react-router-dom';
import { Dashboard, DashboardRoutes } from './dashboard';
import { AboutRoutes } from './about';
import { PluginsRoutes } from './pluginsRouting';
import { App } from './app';

export class Popup extends React.Component {
    render() {
        return (
            <MemoryRouter>
                <App>
                    <Switch>
                        {PluginsRoutes}
                        {AboutRoutes}
                        {DashboardRoutes}
                        <Redirect from="/" to={Dashboard.PATH} />
                    </Switch>
                </App>
            </MemoryRouter>
        );
    }
}
