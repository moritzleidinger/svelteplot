import { describe, it, expect } from 'vitest';
import callWithProps from './callWithProps.js';
import { area, line } from 'd3-shape';
import { geoPath, geoAlbers } from 'd3-geo';
import { scaleLinear, scaleTime } from 'd3-scale';

describe('callWithProps', () => {
    it('should call d3 function without arguments or props', () => {
        const lineGen = callWithProps(line);
        expect(lineGen).toBeDefined();
        expect(typeof lineGen).toBe('function');
    });

    it('should call d3 function with arguments', () => {
        const x = (d: [number, number]) => d[0];
        const y = (d: [number, number]) => d[1];
        const lineGen = callWithProps(line<[number, number]>, [x, y]);

        expect(lineGen).toBeDefined();
        const path = lineGen([
            [0, 0],
            [1, 1],
            [2, 2]
        ]);
        expect(path).toBeTruthy();
        expect(path).toBe('M0,0L1,1L2,2');
    });

    it('should apply props to d3 area generator', () => {
        const xAccessor = (d: [number, number]) => d[0];
        const y0Accessor = () => 0;
        const y1Accessor = (d: [number, number]) => d[1];

        const areaGen = callWithProps(area<[number, number]>, [], {
            x: xAccessor,
            y0: y0Accessor,
            y1: y1Accessor
        });

        const path = areaGen([
            [0, 5],
            [1, 10],
            [2, 8]
        ]);
        expect(path).toBeTruthy();
        expect(typeof path).toBe('string');
    });

    it('should apply props to d3 line generator', () => {
        const data = [
            [0, 0],
            [1, 1],
            [2, 2]
        ] as [number, number][];

        const lineGen = callWithProps(line<[number, number]>, [], {
            x: (d: [number, number]) => d[0] * 10,
            y: (d: [number, number]) => d[1] * 20
        });

        const path = lineGen(data);
        expect(path).toBeTruthy();
        expect(typeof path).toBe('string');
        expect(path).toBe('M0,0L10,20L20,40');
    });

    it('should apply props to d3 geoPath generator', () => {
        const projection = geoAlbers();
        const pathGen = callWithProps(geoPath, [], { projection });

        expect(pathGen).toBeDefined();
        expect(typeof pathGen).toBe('function');
    });

    it('should apply multiple props to scale', () => {
        const scale = callWithProps(scaleLinear, undefined, {
            domain: [0, 100],
            range: [0, 500]
        });

        expect(scale(0)).toBe(0);
        expect(scale(50)).toBe(250);
        expect(scale(100)).toBe(500);
    });

    it('should work with time scale', () => {
        const start = new Date(2020, 0, 1);
        const end = new Date(2020, 11, 31);

        const scale = callWithProps(scaleTime, undefined, {
            domain: [start, end],
            range: [0, 1000]
        });

        expect(scale(start)).toBe(0);
        expect(scale(end)).toBe(1000);
    });

    it('should throw error for non-existent setter', () => {
        expect(() => {
            callWithProps(line, [], {
                // @ts-expect-error - Testing invalid property
                nonExistentMethod: 'value'
            });
        }).toThrow("Setter function 'nonExistentMethod' does not exist on this d3 object");
    });

    it('should handle empty props object', () => {
        const lineGen = callWithProps(line, [], {});
        expect(lineGen).toBeDefined();
        expect(typeof lineGen).toBe('function');
    });

    it('should handle chaining setters correctly', () => {
        const scale = callWithProps(scaleLinear, undefined, {
            domain: [0, 10],
            range: [0, 100],
            clamp: true
        });

        // Test that clamp is applied
        expect(scale(-1)).toBe(0); // clamped to min
        expect(scale(11)).toBe(100); // clamped to max
        expect(scale(5)).toBe(50); // normal value
    });

    it('should work with line curve setter', async () => {
        const { curveMonotoneX } = await import('d3-shape');

        const lineGen = callWithProps(line<[number, number]>, [], {
            curve: curveMonotoneX
        });

        const path = lineGen([
            [0, 0],
            [1, 5],
            [2, 3]
        ]);
        expect(path).toBeTruthy();
    });
});
