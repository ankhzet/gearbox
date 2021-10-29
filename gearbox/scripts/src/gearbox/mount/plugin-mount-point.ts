import { Plugin } from '../plugin';
import { PluginInstance } from './plugin-instance';
import { BaseMountPoint } from './mount-point';

export class PluginsMountPoint<C> extends BaseMountPoint<Plugin, PluginInstance<C>, C> {
    constructor() {
        super((_, plugin) => {
            let instance;

            try {
                const code = eval(plugin.code);

                const constructor = code({
                    Plugin: PluginInstance,
                });

                instance = <PluginInstance<C>>new constructor(plugin);
            } catch (e) {
                instance = new PluginInstance<C>(plugin);
            }

            return instance;
        });
    }
}
