export class ObjectUtils {
    static extract<T>(o: T, keys?: (string | number)[]): T {
        const n = <T>{};

        for (const key of keys || Object.keys(o)) {
            n[key] = o[key];
        }

        return n;
    }
}
