
export type Identified = { uid: string };

export class Package<T extends Identified> {
	[uid: string]: T|any;

	constructor(...instances: T[]) {
		for (let instance of instances)
			this[instance.uid] = instance;
	}

}

export abstract class ObservableList<T extends Identified> {
	private pending: {[uid: string]: Promise<Package<T>>} = {};
	private data: {[uid: string]: T} = {};

	get(uids: string[] = []): Promise<Package<T>> {
		// todo: too complex, requires refactoring

		// console.log('fetching', uids);
		if (!uids.length)
			return this.aquire(uids);

		// split requested invalid uids to 'already loaded' and 'invalidated' groups
		let ready = [];
		let load  = [];
		for (let uid of uids)
			if (this.data[uid])
				ready.push(uid);
			else
				load.push(uid);

		// console.log(`ready ${ready}, load ${load}`);

		let result = new Package();
		// fill result with already valid entries
		for (let uid of ready)
			result[uid] = this.data[uid];

		// console.log(`result`, result);

		let final;
		if (load.length) {
			// split requested invalid uids to 'already pending' and 'just invalidated' groups
			let fetching = this.fetching();

			let hanging = [];
			let pending = [];
			for (let uid of load)
				if (fetching.indexOf(uid) >= 0)
					pending.push(uid);
				else
					hanging.push(uid);

			// console.log(`pending ${pending}, hanging ${hanging}`);

			// filter 'already pending' uids for distinct promises
			let promises = pending.map((uid) => this.pending[uid]);
			let distinct = promises.filter((promise, idx) => promises.indexOf(promise) === idx);

			// promise to load 'just invalidated' uids
			let rest = this.aquire(hanging);
			// mark them as 'pending'
			for (let uid in hanging)
				this.pending[uid] = rest;

			final = Promise.all([rest, ...distinct])
				.then((data) => {
					// console.log(`fill`, data);
					// append only distinct data to response
					// (previously appended 'already valid' entries can be overwritten)
					for (let promised of data)
						for (let uid in promised)
							result[uid] = promised[uid];

					// console.log(`got`, result);
					return result;
				});
		} else
			final = Promise.resolve(result);

		// promise to wait for all requested uids to be loaded
		return final;
	}

	set(value: T[], silent?: boolean): Promise<string[]> {
		let pack = new Package(...value);
		let uids = Object.keys(pack);
		for (let instance of value) {
			this.data[instance.uid] = instance;
		}

		return silent
			? Promise.resolve(uids)
			: this.push(pack)
					.then((uids) => {
						this.invalidate(uids);
						// todo: fire update event?
						return uids;
					});
	}

	remove(uids: string[]): Promise<string[]> {
		let pack = new Package();
		for (let uid of uids)
			pack[uid] = null;

		return this.push(pack)
			.then((uids: string[]) => {
				// console.log('successfuly pushed remove, revalidating', uids);
				for (let uid of uids) {
					delete this.data[uid];
					delete this.pending[uid];
				}

				return uids;
			});
	}

	invalidate(uids: string[]) {
		for (let uid of uids)
			this.data[uid] = null;
	}

	invalid(): string[] {
		return Object.keys(this.data)
			.filter((uid) => !this.data[uid]);
	}

	fetching(): string[] {
		return Object.keys(this.pending)
			.filter((uid) => !!this.pending[uid]);
	}

	protected aquire(uids: string[]): Promise<Package<T>> {
		return this.pull(uids)
			.then((data: Identified[]) => {
				let present = data.map((i) => i.uid);
				for (let uid of uids) {
					if (this.pending[uid])
						delete this.pending[uid];

					if (present.indexOf(uid) < 0)
						delete this.data[uid];
				}

				let values = data.map((i) => this.wrap(i));
				this.set(values, true);
				return new Package(...values);
			});
	}

	protected abstract wrap(data: Identified): T;
	protected abstract pull(uids: string[]): Promise<Identified[]>;
	protected abstract push(pack: Package<T>): Promise<string[]>;

}
