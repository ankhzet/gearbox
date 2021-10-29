import React from 'react';

import { PluginManagementUIDelegate } from './delegates';

import { Plugin, PluginManager } from '../../../gearbox';
import { Panel, PanelBody, PanelFooter, PanelHeader } from '../../panel';
import { Button } from '../../button';
import { Glyph } from '../../glyph';

import Codemirror from 'react-codemirror';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

export interface EditPluginProps {
    delegate: PluginManagementUIDelegate<Plugin>;
    manager: PluginManager;
    params: { id: string };
}

export interface EditPluginState {
    plugin?: Plugin | null;
    title?: string;
    code?: string;
    dirty?: boolean;
}

export class EditPlugin extends React.Component<EditPluginProps, EditPluginState> {
    async pullPlugin(id: string) {
        this.setState({
            plugin: null,
        });

        const pack = await this.props.manager.get([id]);
        const plugin = pack[id];
        this.setState({
            plugin: plugin,
            title: plugin?.title,
            code: plugin?.code,
            dirty: false,
        });
    }

    UNSAFE_componentWillReceiveProps(next) {
        void this.pullPlugin(next.params.id);
    }

    UNSAFE_componentWillMount() {
        void this.pullPlugin(this.props.params.id);
    }

    render() {
        const { plugin, dirty } = this.state;

        if (!plugin) return null;

        return (
            <Panel>
                <PanelHeader>
                    Edit plugin: {plugin.title}
                    <div className="btn-toolbar pull-right">
                        <div className="btn-group">
                            <Button class="btn-xs" onClick={this.handleExecutePlugin}>
                                <Glyph name="play-circle" />
                            </Button>
                        </div>
                    </div>
                </PanelHeader>

                <PanelBody>
                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-lg-12">
                                <div className="input-group">
                                    <span className="input-group-addon">Title</span>
                                    <input
                                        className="form-control"
                                        value={this.state.title}
                                        onChange={this.handleTitleChanged}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="col-lg-12">
                                <Codemirror
                                    value={this.state.code}
                                    onChange={this.handleCodeChanged}
                                    options={{
                                        mode: 'javascript',
                                        theme: 'base16-oceanicnext-dark',
                                        styleActiveLine: true,
                                        lineNumbers: true,
                                        lineWiseCopyCut: false,
                                        indentWithTabs: true,
                                        tabSize: 2,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </PanelBody>

                <PanelFooter>
                    <Button class="btn-xs" onClick={this.handleBack}>
                        &larr;
                    </Button>
                    <Button class="btn-xs" disabled={!dirty} onClick={this.handleSavePlugin}>
                        Save
                    </Button>
                </PanelFooter>
            </Panel>
        );
    }

    private handleTitleChanged = (e) => {
        this.setState({
            title: e.target.value,
            dirty: true,
        });
    };

    private handleCodeChanged = (code) => {
        this.setState({
            code: code,
            dirty: true,
        });
    };

    private handleBack = () => {
        // validate
        // if (!this.valid(this.state)) {
        //
        // 	return;
        // }
        void this.props.delegate.showPlugin(this.props.params.id);
    };

    private handleExecutePlugin = () => {
        this.props.delegate.executePlugin(this.state.plugin!.uid);
    };

    private handleSavePlugin = async () => {
        // validate
        // if (!this.valid(this.state)) {
        //
        // 	return;
        // }

        await this.props.delegate.savePlugin(this.props.params.id, {
            title: this.state.title,
            code: this.state.code,
        });

        this.setState({
            dirty: false,
        });
    };
}
