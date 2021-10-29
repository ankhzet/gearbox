import { ObjectUtils } from '../utils';
import { Identifiable, Package } from '../common';

import { DataStore } from './db';

export interface SyncResult {
    request: string[];
    updated: string[];
    removed: string[];
}

export class ModelStore {
    table: DataStore;

    constructor(table: DataStore) {
        this.table = table;
    }

    findModels(uids?: string[]): Promise<Identifiable[]> {
        return this.table.find(uids ? { uid: { $in: uids } } : {});
    }

    syncModels(data: Package, upsert = true): Promise<SyncResult> {
        const uids = Object.keys(data);
        const del = uids.filter((uid) => !data[uid]);
        const upd = uids.filter((uid) => del.indexOf(uid) < 0);

        const all: Promise<string[]>[] = [];

        if (del.length) {
            all.push(this.removeModels(del));
        }

        if (upd.length) {
            all.push(this.updateModels(ObjectUtils.extract(data, upd), upsert));
        }

        const result = {
            request: uids,
            updated: upd,
            removed: del,
        };

        return all.length ? Promise.all(all).then(() => result) : Promise.resolve(result);
    }

    updateModels(data: Package, upsert = true): Promise<string[]> {
        const uids = Object.keys(data);

        return Promise.all(
            uids.map((uid) => this.table.update({ uid }, { $set: data[uid] }, { upsert }).then(() => uid)),
        );
    }

    removeModels(uids: string[]): Promise<string[]> {
        return this.table.remove({ uid: { $in: uids } }, { multi: true }).then(() => uids);
    }
}
