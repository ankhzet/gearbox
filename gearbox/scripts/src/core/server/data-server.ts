import { Identifiable, Package } from '../common';
import { DB, ModelStore, SyncResult } from '../db';
import { ClientPort, Actions, PacketHandler } from '../parcel';
import { FetchAction, FetchPacketData } from '../parcel';
import { UpdateAction, UpdatePacketData } from '../parcel';
import { SendPacketData } from '../parcel';
import { EntityPacker } from './entity-packer';

export type Serializer<I, O> = (data: I) => O;
export type PackageMapper<I extends Identifiable, O extends Identifiable> = (data: Package<I>) => Package<O>;
export type Updatable = (store: ModelStore, data: SyncResult) => void;

export interface Container<T> {
    [name: string]: T;
}

export class DataServer {
    private _cache: Container<Package> = {};
    db: DB;
    mappers: Container<PackageMapper<Identifiable, Identifiable>> = {};
    updatables: Container<Updatable> = {};

    packer: EntityPacker = new EntityPacker();

    constructor(handler: PacketHandler<ClientPort>, db: DB) {
        this.db = db;

        handler.on(FetchAction, this.fetch.bind(this));
        handler.on(UpdateAction, this.update.bind(this));
    }

    registerSerializer(name: string, serializer: Serializer<Identifiable, Identifiable>) {
        return this.packer.registerSerializer(name, serializer);
    }

    registerMapper(name: string, mapper: PackageMapper<Identifiable, Identifiable>) {
        return (this.mappers[name] = mapper);
    }

    registerUpdatable(name: string, updatable: Updatable) {
        return (this.updatables[name] = updatable);
    }

    cache(what: string, data: Package) {
        let store = this._cache[what];

        if (!store) {
            store = this._cache[what] = {};
        }

        const mapped = this.mapped(what, data);

        for (const uid in mapped) {
            const fragment = mapped[uid];

            if (fragment) {
                store[uid] = fragment;
            } else if (store[uid]) {
                delete store[uid];
            }
        }

        return mapped;
    }

    cached<I extends Identifiable>(what: string): Package<I> {
        const cache = this._cache[what];

        return cache ? this.mapped(what, cache) : <Package<I>>{};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapped(what: string, data: Package<any>): Package<any> {
        const mapper = this.mappers[what];

        return mapper ? mapper(data) : data;
    }

    fetch(client: ClientPort, { what, query, payload: requestID }: FetchPacketData) {
        const sender = (data: Package) => {
            return this.send(client, {
                what,
                data: this.packer.pack(what, data),
                payload: requestID,
            });
        };

        this.db
            .query(what, query)
            .specific(Object.keys(this.cache), () => sender(this.cached(what)))
            .fetch<Identifiable>()
            .then((data: Identifiable[]) => {
                const pack = <Package>{};

                for (const fragment of data) {
                    pack[fragment.uid] = fragment;
                }

                return sender(this.cache(what, pack));
            });
    }

    update(client: ClientPort, { what, data, payload: requestID }: UpdatePacketData) {
        this.db.query(what).specific(null, (table) => {
            const store = new ModelStore(table);

            store
                .syncModels(data)
                .then((result: SyncResult) => {
                    const updatable = this.updatables[what];

                    if (updatable) {
                        updatable(store, result);
                    }

                    this.send(client, { what, data: result.request, payload: requestID });
                })
                .catch((error) => {
                    console.log(`Failed to update "${what}" with data:\n`, data);
                    throw new Error(`Failed to update "${what}":\n${error}`);
                });
        });
    }

    send(client: ClientPort, data: SendPacketData) {
        return Actions.send(client, data);
    }
}
