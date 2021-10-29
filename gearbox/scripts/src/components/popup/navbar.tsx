import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Dashboard } from './dashboard';
import { PluginsRouting } from './pluginsRouting';
import { About } from './about';

function routeActivated(action) {
    return ['PUSH', 'REPLACE'].indexOf(action) >= 0;
}

const NavLinks = [
    { path: Dashboard.PATH, title: 'Dashboard', pinned: true },
    { path: PluginsRouting.PATH, title: 'Plugins' },
    { path: About.PATH, title: 'About' },
];

const simScore = (a, b) => {
    const partsA = a.split('/').filter(Boolean);
    const partsB = b.split('/').filter(Boolean);
    let similar = 0;

    for (const [idx, part] of partsA.entries()) {
        if (part === partsB[idx]) {
            similar++;
        } else {
            break;
        }
    }

    return similar;
};

export const Navbar = () => {
    const history = useHistory();

    const isRoute = (name) => {
        if (!routeActivated(history.action)) {
            return;
        }

        if (history.location.pathname === name) {
            return true;
        }

        const sims = NavLinks.map(({ path }) => path).map((link) => ({
            link,
            score: simScore(history.location.pathname, link),
        }));
        let max = 0;
        let maxLink;

        for (const { link, score } of sims) {
            if (score > max) {
                max = score;
                maxLink = link;
            }
        }

        return maxLink === name;
    };

    const link = (path, title) => {
        return (
            <li className={(isRoute(path) && 'active') || ''}>
                <Link to={path}>{title}</Link>
            </li>
        );
    };

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
                    <ul className="nav navbar-nav">
                        {NavLinks.filter(({ pinned }) => pinned).map(({ path, title }) => link(path, title))}
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        {NavLinks.filter(({ pinned }) => !pinned).map(({ path, title }) => link(path, title))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};
