import React from 'react';
import { Route } from 'react-router';

export class Dashboard extends React.Component {
    static PATH = '/dashboard';

    render() {
        return <div>This is dashboard page.</div>;
    }
}

export const DashboardRoutes = [<Route key={Dashboard.PATH} path={Dashboard.PATH} component={Dashboard} />];
