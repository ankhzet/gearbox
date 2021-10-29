import React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';

export class Dashboard extends React.Component {
    static PATH = '/dashboard';

    render() {
        return (
            <div>
                <div>This is dashboard page.</div>
                <div>
                    Go to <Link to="/plugins">plugins</Link>
                </div>
            </div>
        );
    }
}

export const DashboardRoutes = [<Route key={Dashboard.PATH} path={Dashboard.PATH} component={Dashboard} />];
