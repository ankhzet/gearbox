import { ClientPort } from '../../core';

export class GearBoxClient extends ClientPort {
    constructor(port: chrome.runtime.Port) {
        super('gearbox', port);
    }

    connect() {}
}
