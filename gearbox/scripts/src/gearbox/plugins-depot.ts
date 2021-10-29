import { Identifiable, Package } from '../core';
import { Plugin } from './plugin';
import { PluginList } from './plugin-list';
import { PluginsMountPoint, PluginInstance } from './mount';

export class PluginsDepot<C = any> extends PluginList<Plugin> {
    context: C;
    mountPoint: PluginsMountPoint<C> = new PluginsMountPoint();

    constructor(context: C) {
        super((uid) => new Plugin(uid));

        this.context = context;
    }

    public instance(uid: string): PluginInstance<C> | void {
        return this.mountPoint.instance(uid);
    }

    public mount(plugin: Plugin): PluginInstance<C> | void {
        return this.mountPoint.mount(this.context, plugin);
    }

    public unmount(plugin: Plugin) {
        return this.mountPoint.unmount(this.context, plugin);
    }

    public load(data: Identifiable[]): Package<Plugin> {
        const result: Package<Plugin> = {};

        for (const fragment of data) {
            result[fragment.uid] = this.pluginFromData(fragment);
        }

        return result;
    }

    protected pluginFromData(data: Identifiable): Plugin {
        const uid = data.uid;
        const plugin = (uid && this.get(data.uid)) || this.create();

        for (const key in data) {
            if (!key.match(/^_/)) {
                plugin[key] = data[key];
            }
        }

        this.set(plugin);
        this.mount(plugin);

        return plugin;
    }
}
