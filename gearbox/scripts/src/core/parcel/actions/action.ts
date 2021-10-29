import { ClientPort } from '../client-port';

export interface ActionConstructor<T> {
    new (): Action<T>;
    uid: string;
}

export class Action<T> {
    properties: string[] = ['error'];

    public pack(data): T {
        return data;
        // return <T>this.properties.reduce((result, prop) => {
        // 	if (args.length)
        // 		result[prop] = args.shift();
        // 	return result;
        // }, {});
    }

    public unpack(data): T {
        return data;
        // return <T>this.properties.map((prop) => data[prop]);
    }

    public send = (port: ClientPort, data?, error?): boolean => port.send(this.uid, this.pack(data), error);

    get uid() {
        return (<any>this.constructor).uid;
    }

    static get uid() {
        return this.name.replace(/Action$/, '').toLowerCase();
    }
}
