export interface Packet<T = any> {
    sender: string;
    action: string;

    data: T;
    error?: string;
}
