import { Eventable } from '../core';
import { Plugin } from './plugin';

export class PluginList<P extends Plugin> extends Eventable {
    private readonly plugins: { [uid: string]: P } = {};
    private readonly factory: (uid: string) => P;

    static CHANGED = 'changed';

    constructor(factory: (uid: string) => P) {
        super();
        this.factory = factory;
    }

    onchanged(listener: () => void) {
        return this.on(PluginList.CHANGED, listener);
    }

    private changed() {
        this.fire(PluginList.CHANGED);
    }

    public create(): P {
        return this.factory(this.genUID());
    }

    public get(uid: string): P {
        return this.plugins[uid];
    }

    public set(plugin: P): P {
        this.plugins[plugin.uid] = plugin;
        this.changed();
        return plugin;
    }

    public remove(uid: string): P {
        const plugin = this.plugins[uid];
        if (plugin) {
            delete this.plugins[uid];
            this.changed();
        }
        return plugin;
    }

    public each(consumer: (plugin: P) => boolean): boolean {
        for (const plugin in this.map()) {
            if (!consumer(this.plugins[plugin])) {
                return false;
            }
        }

        return true;
    }

    public map<T>(consumer?: (plugin: P) => T): T[] {
        const collection: T[] = [];

        for (const plugin in this.plugins) {
            if (this.plugins.hasOwnProperty(plugin)) {
                collection.push(consumer ? consumer(this.plugins[plugin]) : <any>this.plugins[plugin]);
            }
        }

        return collection;
    }

    private genUID(): string {
        return `${
            Object.keys(this.plugins)
                .map(Number)
                .reduce((max, uid) => Math.max(uid || 0, max), 0) + 1
        }`;
    }
}
