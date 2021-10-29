import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { PluginManager } from '../../gearbox';
import { PluginManagerContext } from '../hooks';
import { Breadcrumbs } from '../breadcrumbs';
import { Navbar } from './navbar';

interface AppState {
    manager: PluginManager;
}

export class App extends React.Component<RouteComponentProps, AppState> {
    UNSAFE_componentWillMount() {
        const manager = new PluginManager();
        this.setState({
            manager,
        });
    }

    breadcrumbs() {
        return [
            { title: 'Plugins', link: '#plugins' },
            { title: 'Plugin', link: '#plugin/1/' },
            { title: 'Edit', link: '#plugin/1/edit' },
        ];
    }

    render() {
        const navprops = this.props;

        return (
            <PluginManagerContext.Provider value={this.state.manager}>
                <Navbar {...navprops} />

                <Breadcrumbs crumbs={this.breadcrumbs()} />

                <div>
                    <div className="col-lg-12">{this.props.children}</div>
                </div>
            </PluginManagerContext.Provider>
        );
    }
}
