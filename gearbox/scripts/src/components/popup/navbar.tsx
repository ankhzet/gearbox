import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

import { Dashboard } from './dashboard';
import { PluginsRouting } from './pluginsRouting';
import { About } from './about';

export class Navbar extends React.Component<RouteComponentProps> {
    static routeActivated(action) {
        return ['PUSH', 'REPLACE'].indexOf(action) >= 0;
    }

    isRoute(name) {
        if (Navbar.routeActivated(this.props.history.action)) {
            return this.props.location.pathname === name;
        }
    }

    link(path, title) {
        return (
            <li className={(this.isRoute(path) && 'active') || ''}>
                <Link to={path}>{title}</Link>
            </li>
        );
    }

    render() {
        return (
            <nav className="navbar navbar-default navbar-fixed.top" role="navigation">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button
                            type="button"
                            className="navbar-toggle"
                            data-toggle="collapse"
                            data-target="#bs-example-navbar-collapse-1"
                        >
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                        </button>
                        <Link to={Dashboard.PATH} className="navbar-brand">
                            GearBox - Plugin sandbox
                        </Link>
                    </div>

                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">{this.link(Dashboard.PATH, 'Dashboard')}</ul>
                        <ul className="nav navbar-nav navbar-right">
                            {this.link(PluginsRouting.PATH, 'Plugins')}
                            {this.link(About.PATH, 'About')}
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
