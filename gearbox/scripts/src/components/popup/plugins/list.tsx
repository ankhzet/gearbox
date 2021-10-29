import React, { useCallback, VFC } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from 'react-use';

import { Plugin, PluginManager } from '../../../gearbox';
import { Glyph } from '../../glyph';
import { Button } from '../../button';
import { Panel, PanelHeader, PanelList } from '../../panel';
import { PluginsRouting } from '../pluginsRouting';
import { PluginManagementUIDelegate } from './delegates';

interface PluginItemRowProps {
    manager: PluginManager;
    plugin: Plugin;

    delegate: PluginManagementUIDelegate<Plugin>;
}

class PluginItemRow extends React.Component<PluginItemRowProps> {
    pluginPath(relative = ''): string {
        return PluginsRouting.PATH + '/' + this.props.plugin.uid + (relative && '/' + relative);
    }

    render() {
        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="input-group">
                        <div className="input-group-btn">
                            <Button class="btn-xs" onClick={this.handleRemovePlugin}>
                                <Glyph name="remove" />
                            </Button>
                        </div>

                        <Link className="col-xs-9" to={this.pluginPath()}>
                            Plugin &quot;{this.props.plugin.title}&quot;
                        </Link>

                        <div className="input-group-btn">
                            <Button class="btn-xs" onClick={this.handleExecutePlugin}>
                                <Glyph name="play-circle" />
                            </Button>
                            <Button class="btn-xs dropdown-toggle" data-toggle="dropdown">
                                Actions <span className="caret" />
                            </Button>
                            <ul className="dropdown-menu pull-right">
                                <li>
                                    <Link to={this.pluginPath('edit')}>Edit</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleExecutePlugin = () => {
        return this.props.delegate.executePlugin(this.props.plugin.uid);
    };

    private handleRemovePlugin = () => {
        return this.props.delegate.removePlugin(this.props.plugin.uid);
    };
}

export interface ListPluginsProps {
    delegate: PluginManagementUIDelegate<Plugin>;
    manager: PluginManager;
}

export const ListPlugins: VFC<ListPluginsProps> = ({ manager, delegate }) => {
    const { value: plugins } = useAsync(async (uids: string[] = []) => manager.get(uids));
    const handleAddPlugin = useCallback(() => delegate.createPlugin(), []);

    return (
        <Panel>
            <PanelHeader>
                Plugins
                <div className="pull-right">
                    <Button class="btn-xs" onClick={handleAddPlugin}>
                        <Glyph name="plus" />
                    </Button>
                </div>
            </PanelHeader>
            <PanelList>
                {plugins &&
                    Object.keys(plugins).map((uid) => {
                        const plugin = plugins[uid];

                        return (
                            plugin && (
                                <li key={uid} className="list-group-item">
                                    <PluginItemRow delegate={delegate} manager={manager} plugin={plugin} />
                                </li>
                            )
                        );
                    })}
            </PanelList>
        </Panel>
    );
};
