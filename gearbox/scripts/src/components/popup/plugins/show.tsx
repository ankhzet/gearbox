import React from 'react';

import { Plugin, PluginManager } from '../../../gearbox';
import { Button } from '../../button';
import { Glyph } from '../../glyph';
import { Panel, PanelBody, PanelFooter, PanelHeader } from '../../panel';
import { PluginManagementUIDelegate } from './delegates';

import Codemirror from 'react-codemirror';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

export interface ShowPluginProps {
    delegate: PluginManagementUIDelegate<Plugin>;
    manager: PluginManager;
    params: { id: string };
}

export class ShowPlugin extends React.Component<ShowPluginProps, { plugin: Plugin | null }> {
    async pullPlugin(id: string) {
        this.setState({
            plugin: null,
        });

        const pack = await this.props.manager.get([id]);
        const plugin = pack[id];
        this.setState({
            plugin: plugin,
        });
    }

    UNSAFE_componentWillReceiveProps(next) {
        this.pullPlugin(next.params.id);
    }

    UNSAFE_componentWillMount() {
        this.pullPlugin(this.props.params.id);
    }

    render() {
        const plugin = this.state.plugin;
        if (!plugin) return null;

        return (
            <Panel>
                <PanelHeader>
                    Plugin: {plugin.title}
                    <div className="btn-toolbar pull-right">
                        <div className="btn-group">
                            <Button class="btn-xs" onClick={this.handleRemovePlugin}>
                                <Glyph name="remove" />
                            </Button>
                            <Button class="btn-xs" onClick={this.handleEditPlugin}>
                                <Glyph name="edit" />
                            </Button>
                        </div>
                        <div className="btn-group">
                            <Button class="btn-xs" onClick={this.handleExecutePlugin}>
                                <Glyph name="play-circle" />
                            </Button>
                        </div>
                    </div>
                </PanelHeader>

                <PanelBody>
                    <div className="form-group col-lg-12">
                        <Codemirror
                            value={plugin.code}
                            options={{
                                mode: 'javascript',
                                theme: 'base16-oceanicnext-dark',
                                lineNumbers: true,
                                indentWithTabs: true,
                                tabSize: 2,
                                readOnly: true,
                            }}
                        />
                    </div>
                </PanelBody>

                <PanelFooter>
                    <Button class="btn-xs" onClick={this.handleBack}>
                        &larr;
                    </Button>
                </PanelFooter>
            </Panel>
        );
    }

    handleBack = () => {
        this.props.delegate.listPlugins();
    };

    handleExecutePlugin = () => {
        this.props.delegate.executePlugin(this.state.plugin!.uid);
    };

    handleEditPlugin = () => {
        void this.props.delegate.editPlugin(this.state.plugin!.uid);
    };

    handleRemovePlugin = () => {
        this.props.delegate.removePlugin(this.state.plugin!.uid);
    };
}
