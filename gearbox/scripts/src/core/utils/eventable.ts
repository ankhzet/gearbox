
export class Eventable {
	private _handlers: {[event: string]: Function[]} = {};

	on(event, handler) {

		let handlers = this._handlers[event];
		if (!handlers)
			handlers = this._handlers[event] = [];

		handlers.push(handler);
	}

	fire(event: string, ...payload: any[]) {
		// console.log(`firing [${event}] with`, payload, 'for', this);
		let args = [event, ...payload];
		let handlers = this._handlers[event];
		if (!handlers)
			return;

		for (let handler of handlers.slice())
			handler.apply(this, args);
	}

}
