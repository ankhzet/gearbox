export abstract class Port {
    port: chrome.runtime.Port | null = null;
    name: string;

    protected constructor(name: string) {
        this.name = Port.portName(name);
    }

    static portName(port: string): string {
        return `${port}-data-channel`;
    }
}
