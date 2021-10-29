import { Identifiable, Package } from '../common';
import { Container, Serializer } from './data-server';

abstract class Packer<T extends Identifiable, R> {
    serializers: Container<Serializer<T, R>> = {};

    registerSerializer(name: string, serializer: Serializer<T, R>) {
        this.serializers[name] = serializer;
    }

    abstract pack(what: string, data: Package<T>): R[];
}

export class EntityPacker extends Packer<Identifiable, any> {
    pack(what: string, data: Package): any[] {
        const serializer = this.serializers[what];
        const uids = Object.keys(data);

        return serializer ? uids.map((key) => serializer(data[key])) : uids.map((key) => data[key]);
    }
}
