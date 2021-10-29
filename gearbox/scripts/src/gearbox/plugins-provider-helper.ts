import { DataServer, ModelStore, Package } from '../core';
import { PluginsDepot } from './plugins-depot';
import { PluginInstance } from './mount';
import { Plugin } from './plugin';

class EntityProviderBucket {
    name: string;
    provider: DataServer;

    constructor(name: string, provider: DataServer) {
        this.name = name;
        this.provider = provider;

        this.provider.registerSerializer(this.name, this.serialize.bind(this));
        this.provider.registerMapper(this.name, this.map.bind(this));
        this.provider.registerUpdatable(this.name, this.update.bind(this));
    }

    cache(data: Package) {
        return this.provider.cache(this.name, data);
    }

    serialize(data) {
        return data;
    }

    map(pack: Package): Package {
        return pack;
    }

    update(store: ModelStore, { updated, removed }) {
        if (removed.length) {
            this.removed(store, removed);
        }

        if (updated.length) {
            this.updated(store, updated);
        }
    }

    updated(store: ModelStore, uids?: string[]): Promise<Package> {
        return store
            .findModels(uids)
            .then((data) => this.cache(data.reduce((acc, item) => ((acc[item.uid] = item), acc), {})));
    }

    removed(store: ModelStore, uids: string[]): Package {
        return this.cache(uids.reduce((acc, uid) => ((acc[uid] = null), acc), {}));
    }
}

export class PluginsProviderHelper extends EntityProviderBucket {
    plugins: PluginsDepot;

    constructor(provider: DataServer, plugins: PluginsDepot) {
        super('plugins', provider);
        this.plugins = plugins;

        void this.updated(new ModelStore(provider.db.table('plugins')));
    }

    serialize(data) {
        return PluginInstance.data(data);
    }

    map(pack: Package): Package<Plugin> {
        return this.plugins.load(Object.values(pack));
    }

    removed(store: ModelStore, uids: string[]) {
        const data = super.removed(store, uids);

        for (const uid in data) {
            this.plugins.remove(uid);
        }

        return data;
    }
}
