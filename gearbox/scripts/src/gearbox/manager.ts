import { Identifiable } from '../core';
import { Plugin } from './plugin';
import { ClientConnector } from './client';
import { ObservableList, Package } from './observable-list';
import { GearBoxActions } from './actions';

export interface Manager<T extends Identifiable, A> {
    get(uids?: string[]): Promise<Package<T>>;
    set(values: T[]): Promise<string[]>;
    remove(uids: string[]): Promise<string[]>;
    perform<T>(uids: string[], action: A, payload?: T);
}

abstract class ObservableConnectedList<T extends Identifiable> extends ObservableList<T> {
    private readonly resolver: { [request: number]: (any) => void } = [];
    private readonly collection: string;
    protected connector: ClientConnector;
    private request = 0;

    constructor(collection: string, connector: ClientConnector) {
        super();
        this.collection = collection;
        this.connector = connector;
        this.connector.onsent((sender, { what, data, payload }) => {
            if (what !== this.collection) {
                return;
            }

            const resolver = this.resolver[payload];
            delete this.resolver[payload];

            resolver(data);
        });
    }

    protected pull(uids: string[]): Promise<Identifiable[]> {
        return new Promise((resolve) => {
            const uid = this.request++;
            this.resolver[uid] = resolve;

            this.connector.fetch(this.collection, uids.length ? { uid: { $in: uids } } : {}, uid);
        });
    }

    protected push(pack: Package<T>): Promise<string[]> {
        return new Promise((resolve) => {
            const uid = this.request++;
            this.resolver[uid] = resolve;

            this.connector.update(this.collection, pack, uid);
        });
    }
}

type PluginAction = 'execute' | 'fire';

export class PluginManager extends ObservableConnectedList<Plugin> implements Manager<Plugin, PluginAction> {
    execute(uid: string, code?: string) {
        return GearBoxActions.execute(this.connector, { plugin: { uid: uid }, code });
    }

    fire(sender: string, event: string) {
        return GearBoxActions.fire(this.connector, { sender, event });
    }

    unmount(uid: string) {
        return GearBoxActions.unmount(this.connector, { uid });
    }

    public perform<T>(uids: string[], action: PluginAction, payload?: T) {
        return this.get(uids).then((pack) => {
            for (const uid in pack) {
                switch (action) {
                    case 'execute': {
                        this.execute(uid);
                        break;
                    }

                    case 'fire': {
                        console.log(`performing ${action}(${payload}) on '${uid}'`);
                        this.fire(uid, payload as unknown as string);
                        break;
                    }
                }
            }

            return pack;
        });
    }

    protected wrap(data: Identifiable): Plugin {
        return Object.assign(new Plugin(data.uid), data);
    }

    public async [Symbol.asyncIterator](): Promise<Iterable<Plugin>> {
        const data = await this.get();
        const keys = Object.keys(data);
        const last = keys.length - 1;
        let current = 0;

        return Promise.resolve({
            [Symbol.iterator]: () => {
                return {
                    next: () => {
                        if (current <= last) {
                            return {
                                done: false,
                                value: <Plugin>data[keys[current++]],
                            };
                        } else {
                            return {
                                done: true,
                                value: undefined,
                            };
                        }
                    },
                };
            },
        });
    }
}
