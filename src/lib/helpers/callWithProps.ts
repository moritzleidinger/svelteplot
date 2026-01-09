/**
 * Extract keys from T that are setter methods (functions that accept a value and return something)
 */
type SetterKeys<T> = {
    [K in keyof T]: T[K] extends (value: any) => any ? K : never;
}[keyof T];

/**
 * Map setter methods to their parameter types
 */
type SetterProps<T> = {
    [K in SetterKeys<T>]?: T[K] extends (value: infer V) => any ? V : never;
};

/**
 * Helper function to call a D3 "function class" while also calling
 * property setter functions on the result.
 *
 * @param d3func - A D3 factory function (e.g., d3.geoPath, d3.area, d3.line)
 * @param args - Arguments to pass to the D3 factory function
 * @param props - Object mapping setter method names to their values
 * @returns The configured D3 object
 *
 * @example
 * ```ts
 * const areaGen = callWithProps(area, [], { x: d => d.x, y: d => d.y });
 * const path = callWithProps(geoPath, [], { projection: myProjection });
 * ```
 */
export default function callWithProps<F extends (...args: any[]) => any, R extends ReturnType<F>>(
    d3func: F,
    args: Parameters<F> = [] as any,
    props: Partial<SetterProps<R>> = {}
): R {
    const res = d3func(...args);
    const resWithKeys = res as Record<string, unknown>;
    for (const [key, val] of Object.entries(props)) {
        const setter = resWithKeys[key];
        if (typeof setter !== 'function') {
            throw new Error(`Setter function '${key}' does not exist on this d3 object`);
        }
        setter.call(res, val);
    }
    return res;
}
