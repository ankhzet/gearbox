import React, { FC, useMemo } from 'react';
import Alertify from 'alertifyjs';
import { Route, Switch, useHistory } from 'react-router-dom';
import { History } from 'history';

import { Plugin, PluginManager } from '../../gearbox';
import { EditPlugin, ListPlugins, PluginManagementUIDelegate, ShowPlugin } from './plugins';
import { usePluginManager } from '../hooks';

// interface AlertifyJsStatic {
//     alert(title: any, message: any, onok?: string);
//     confirm(title: any, message: any, onok?: any, oncancel?: any);
//     prompt(title: any, message: any, value?: string, onok?: any, oncancel?: any);
//     notify(message: string, type?: string, wait?: number, callback?: any);
// }
//
// declare const Alertify: AlertifyJsStatic;

class PluginManagementDelegate implements PluginManagementUIDelegate<Plugin> {
    private manager: PluginManager;
    private history: History;

    constructor(manager: PluginManager, history: History) {
        this.history = history;
        this.manager = manager;
    }

    async getOne(uid: string): Promise<Plugin> {
        return (await this.manager.get([uid]))[uid]!;
    }

    async removePlugin(uid: string) {
        const plugin = await this.getOne(uid);

        Alertify.confirm(`Delete plugin "${plugin.title}"?`, (ok) => {
            if (!ok) {
                return;
            }

            this.manager.remove([plugin.uid]).then((uids) => {
                console.log('successfuly nuked', uids);
                this.history.replace(PluginsRouting.PATH);
            });
        });
    }

    async executePlugin(uid: string) {
        const plugin = await this.getOne(uid);

        Alertify.confirm(
            `Execute plugin [${plugin.title}]?\n<pre style="max-height: 200px;">${plugin.code}</pre>`,
            (ok) => {
                if (!ok) {
                    return;
                }

                this.manager.perform([uid], 'execute');
            },
        );
    }

    async createPlugin() {
        return new Promise<Plugin>((rs) => {
            Alertify.prompt('Which name to assign?', 'Plugin name', (ok, title) => {
                if (!ok) {
                    return;
                }

                const plugin = new Plugin(`${~~(Math.random() * (100000 - 10000) + 10000)}`);
                plugin.title = title;

                this.manager.set([plugin]).then(() => {
                    this.showPlugin(plugin.uid);
                    rs(plugin);
                });
            });
        });
    }

    async savePlugin(uid: string, data) {
        const plugin = await this.getOne(uid);

        for (const key in data) {
            if (key !== 'uid') {
                plugin[key] = data[key];
            }
        }

        await this.manager.set([plugin]);

        return plugin;
    }

    editPlugin(uid: string): Promise<Plugin> {
        this.history.push(PluginsRouting.PATH + '/' + uid + '/edit');

        return this.getOne(uid);
    }

    showPlugin(uid: string): Promise<Plugin> {
        this.history.push(PluginsRouting.PATH + '/' + uid);

        return this.getOne(uid);
    }

    listPlugins() {
        this.history.push(PluginsRouting.PATH);
    }
}

export const PluginsRouting: FC & { PATH: string } = () => {
    const history = useHistory();
    const manager = usePluginManager();
    const delegate = useMemo(() => new PluginManagementDelegate(manager, history), [manager]);

    return (
        <Switch>
            <Route
                path={PluginsRouting.PATH + '/:id/edit'}
                render={({ match: { params } }) => (
                    <EditPlugin manager={manager} delegate={delegate} params={params as any} />
                )}
            />
            <Route
                path={PluginsRouting.PATH + '/:id'}
                render={({ match: { params } }) => (
                    <ShowPlugin manager={manager} delegate={delegate} params={params as any} />
                )}
            />
            <Route render={() => <ListPlugins manager={manager} delegate={delegate} />} />
        </Switch>
    );
};
PluginsRouting.PATH = '/plugins';

export const PluginsRoutes = [
    <Route key={PluginsRouting.PATH} path={PluginsRouting.PATH} component={PluginsRouting} />,
];
