import React from 'react';
import { Route } from 'react-router';

export class About extends React.Component {
    static PATH = '/about';

    render() {
        return <div>This is about page.</div>;
    }
}

export const AboutRoutes = [<Route key={About.PATH} path={About.PATH} component={About} />];
