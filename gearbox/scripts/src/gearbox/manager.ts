import { Identifiable, SendAction, SendPacketData } from '../core';
import { Plugin } from './plugin';
import { ClientConnector } from './client-connector';
import { ObservableList, Package } from './observable-list';

export interface Manager<T extends Identifiable, A> {
    get(uids?: string[]): Promise<Package<T>>;
    set(values: T[]): Promise<string[]>;
    remove(uids: string[]): Promise<string[]>;
    perform<T>(uids: string[], action: A, payload?: T);
}

abstract class ObservableConnectedList<T extends Identifiable> extends ObservableList<T> {
    protected connector: ClientConnector;
    private resolver: { [request: number]: (any) => void } = [];
    private request = 0;

    constructor() {
        super();

        this.connector = new ClientConnector();
        this.connector.on(SendAction, (sender, data: SendPacketData) => {
            const resolver = this.resolver[data.payload];
            delete this.resolver[data.payload];

            resolver(data.data);
        });
    }

    protected pull(uids: string[]): Promise<Identifiable[]> {
        return new Promise((resolve) => {
            const uid = this.request++;
            this.resolver[uid] = resolve;

            this.connector.fetch(uids.length ? { uid: { $in: uids } } : {}, uid);
        });
    }

    protected push(pack: Package<T>): Promise<string[]> {
        return new Promise((resolve) => {
            const uid = this.request++;
            this.resolver[uid] = resolve;

            this.connector.update(pack, uid);
        });
    }
}

type PluginAction = 'execute' | 'fire';

export class PluginManager extends ObservableConnectedList<Plugin> implements Manager<Plugin, PluginAction> {
    public perform<T>(uids: string[], action: PluginAction, payload?: T) {
        return this.get(uids).then((pack) => {
            for (const uid in pack) {
                switch (action) {
                    case 'execute': {
                        this.connector.execute(uid);
                        break;
                    }

                    case 'fire': {
                        console.log(`performing ${action}(${payload}) on '${uid}'`);
                        this.connector.fire(uid, payload as unknown as string);
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
