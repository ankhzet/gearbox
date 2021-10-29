import { Identifiable } from './identifiable';

export interface Package<T extends Identifiable = Identifiable> {
    [uid: string]: T;
}
