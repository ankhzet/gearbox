import { Identifiable } from '../core';

export class Package<T extends Identifiable> {
    [uid: string]: T | null;

    constructor(...instances: T[]) {
        for (const instance of instances) {
            this[instance.uid] = instance;
        }
    }
}

export abstract class ObservableList<T extends Identifiable> {
    private pending: Record<string, Promise<Package<T>>> = {};
    private data: { [uid: string]: T | null } = {};

    get(uids: string[] = []): Promise<Package<T>> {
        // todo: too complex, requires refactoring

        // console.log('fetching', uids);
        if (!uids.length) {
            return this.aquire(uids);
        }

        // split requested invalid uids to 'already loaded' and 'invalidated' groups
        const ready: string[] = [];
        const load: string[] = [];
        for (const uid of uids) {
            if (this.data[uid]) {
                ready.push(uid);
            } else {
                load.push(uid);
            }
        }

        // console.log(`ready ${ready}, load ${load}`);

        const result = new Package();
        // fill result with already valid entries
        for (const uid of ready) {
            result[uid] = this.data[uid];
        }

        // console.log(`result`, result);

        let final;
        if (load.length) {
            // split requested invalid uids to 'already pending' and 'just invalidated' groups
            const fetching = this.fetching();

            const hanging: string[] = [];
            const pending: string[] = [];
            for (const uid of load) {
                if (fetching.indexOf(uid) >= 0) {
                    pending.push(uid);
                } else {
                    hanging.push(uid);
                }
            }

            // console.log(`pending ${pending}, hanging ${hanging}`);

            // filter 'already pending' uids for distinct promises
            const promises = pending.map((uid) => this.pending[uid]);
            const distinct = promises.filter((promise, idx) => promises.indexOf(promise) === idx);

            // promise to load 'just invalidated' uids
            const rest = this.aquire(hanging);
            // mark them as 'pending'
            for (const uid in hanging) {
                this.pending[uid] = rest;
            }

            final = Promise.all([rest, ...distinct]).then((data) => {
                // console.log(`fill`, data);
                // append only distinct data to response
                // (previously appended 'already valid' entries can be overwritten)
                for (const promised of data) {
                    for (const uid in promised) {
                        result[uid] = promised[uid];
                    }
                }

                // console.log(`got`, result);
                return result;
            });
        } else {
            final = Promise.resolve(result);
        }

        // promise to wait for all requested uids to be loaded
        return final;
    }

    set(value: T[], silent?: boolean): Promise<string[]> {
        const pack = new Package(...value);
        const uids = Object.keys(pack);

        for (const instance of value) {
            this.data[instance.uid] = instance;
        }

        return silent
            ? Promise.resolve(uids)
            : this.push(pack).then((uids) => {
                  this.invalidate(uids);
                  // todo: fire update event?
                  return uids;
              });
    }

    remove(uids: string[]): Promise<string[]> {
        const pack = new Package<T>();
        for (const uid of uids) {
            pack[uid] = null;
        }

        return this.push(pack).then((uids: string[]) => {
            // console.log('successfuly pushed remove, revalidating', uids);
            for (const uid of uids) {
                delete this.data[uid];
                delete this.pending[uid];
            }

            return uids;
        });
    }

    invalidate(uids: string[]) {
        for (const uid of uids) {
            this.data[uid] = null;
        }
    }

    invalid(): string[] {
        return Object.keys(this.data).filter((uid) => !this.data[uid]);
    }

    fetching(): string[] {
        return Object.keys(this.pending).filter((uid) => !!this.pending[uid]);
    }

    protected aquire(uids: string[]): Promise<Package<T>> {
        return this.pull(uids).then(async (data: Identifiable[]) => {
            const present = data.map((i) => i.uid);

            for (const uid of uids) {
                if (!!this.pending[uid]) {
                    delete this.pending[uid];
                }

                if (present.indexOf(uid) < 0) {
                    delete this.data[uid];
                }
            }

            const values = data.map((i) => this.wrap(i));

            await this.set(values, true);

            return new Package(...values);
        });
    }

    protected abstract wrap(data: Identifiable): T;
    protected abstract pull(uids: string[]): Promise<Identifiable[]>;
    protected abstract push(pack: Package<T>): Promise<string[]>;
}
