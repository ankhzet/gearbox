import DataStoreBase from 'nedb-promises';

type DataStore = DataStoreBase;

export type { DataStore };

type EraseReturn<T, R = void> = T extends (...args: infer A) => any ? (...args: A) => R : never;

export class DB {
    protected tables: { [table: string]: DataStore } = {};

    table(name: string): DataStore {
        let table = this.tables[name];

        if (!table) {
            table = this.tables[name] = DataStoreBase.create({
                filename: DB.tableDB(name),
                autoload: true,
            });
        }

        return table;
    }

    static tableDB(name: string) {
        return `gearbox/${name}.db`;
    }

    scheme(table: string, callback: (blueprint: { index: EraseReturn<DataStoreBase['ensureIndex']> }) => void) {
        const db = this.table(table);

        return callback({
            index(options) {
                void db.ensureIndex(options);
            },
        });
    }

    query<Q>(what: string, query?: Q) {
        return new Query<Q>(this, what, query);
    }
}

export class Query<Q> {
    private readonly db: DB;
    private readonly what: string;
    private readonly query?: Q;

    constructor(db: DB, what: string, query?: Q) {
        this.db = db;
        this.what = what;
        this.query = query;
    }

    hasQuery(): boolean {
        return !!(this.query && Object.keys(this.query).length);
    }

    specific(what: string[] | null, callback: (cursor: DataStore) => any): this {
        const hasQuery = this.hasQuery();
        const isSpecific = !what || what.indexOf(this.what) >= 0;

        if (isSpecific && !hasQuery) {
            callback(this.cursor());

            return new Query(this.db, this.what, null) as any;
        }

        return this;
    }

    cursor(): DataStore {
        return this.db.table(this.what);
    }

    async fetch<T>(): Promise<T[]> {
        if (this.query) {
            return this.cursor().find(this.query);
        }

        return [];
    }
}
