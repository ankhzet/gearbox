import { Eventable } from '../../core';
import { Plugin } from '../plugin';
import { MountedInstance } from './mount-point';

export class PluginInstance<C> extends Eventable implements MountedInstance<C> {
    uid?: string;
    title?: string;

    constructor(plugin: Plugin) {
        super();
        Data.exclude(plugin, ['code'], this);
    }

    static data(src) {
        return Data.include(src);
    }

    raw(props?) {
        if (!props) {
            props = Object.keys(this).filter((key) => !!key.match(/^(title|uid)/));
        }

        return Data.include(this, props);
    }

    mount(sandbox: C) {
        this.mounted(sandbox);
        this.fire('MOUNTED', sandbox);
    }

    unmount(sandbox: C) {
        this.fire('UNMOUNTED', sandbox);
        this.unmounted(sandbox);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mounted(sandbox) {
        //
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unmounted(sandbox) {
        //
    }
}

export class Data {
    static include(src, props?: string[], dst = {}) {
        for (const p of props || Object.keys(src)) {
            dst[p] = src[p];
        }

        return dst;
    }

    static exclude(src, props: string[], dst = {}) {
        const keys = Object.keys(src);

        for (const p of keys) {
            if (props.indexOf(p) < 0) {
                dst[p] = src[p];
            }
        }

        return dst;
    }
}
