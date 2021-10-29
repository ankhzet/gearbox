import { ClientPort } from '../../core';

export class GearBoxClient extends ClientPort {
    constructor(port: chrome.runtime.Port) {
        super(`client-${ClientPort.specifier(port.name)}`);

        if (this.rebind(port)) {
            this.connect();
        }
    }
}
