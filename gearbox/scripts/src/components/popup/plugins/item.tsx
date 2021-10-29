import React from 'react';
import { Link } from 'react-router-dom';

import { Plugin, PluginManager } from '../../../gearbox';
import { PluginsRouting } from '../pluginsRouting';

export interface ShowPluginItemProps {
    manager: PluginManager;
    plugin: Plugin;
}

export class ShowPluginItem extends React.Component<ShowPluginItemProps> {
    // async pullPlugin(id: string) {
    // 	this.setState({
    // 		plugin: null,
    // 	});
    //
    // 	let plugin = await this.props.manager.get(id);
    // 	this.setState({
    // 		plugin: plugin,
    // 	});
    // }
    //
    // UNSAFE_componentWillReceiveProps(next) {
    // 	this.pullPlugin(next.params.id);
    // }
    //
    // UNSAFE_componentWillMount() {
    // 	this.pullPlugin(this.props.params.id);
    // }

    render() {
        // if (!this.state.plugin)
        // 	return null;

        return (
            <div className="plugin">
                <Link to={PluginsRouting.PATH + '/' + this.props.plugin.uid}>
                    Plugin &quot;{this.props.plugin.title}&quot;
                </Link>
            </div>
        );
    }
}
