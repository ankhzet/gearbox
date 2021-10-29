export class Eventable {
    private _handlers: { [event: string]: Function[] } = {};

    on(event, handler) {
        (this._handlers[event] || (this._handlers[event] = [])).push(handler);
    }

    fire(event: string, ...payload: any[]) {
        // console.log(`firing [${event}] with`, payload, 'for', this);
        const args = [event, ...payload];
        const handlers = this._handlers[event];

        if (!handlers) {
            return;
        }

        for (const handler of handlers.slice()) {
            handler.apply(this, args);
        }
    }
}
