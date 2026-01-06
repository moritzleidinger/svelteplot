import type { AreaCurveName, CurveName } from '../types/index.js';
import {
    curveBasis,
    curveBasisClosed,
    curveBasisOpen,
    curveBundle,
    curveBumpX,
    curveBumpY,
    curveCardinal,
    curveCardinalClosed,
    curveCardinalOpen,
    curveCatmullRom,
    curveCatmullRomClosed,
    curveCatmullRomOpen,
    curveLinear,
    curveLinearClosed,
    curveMonotoneX,
    curveMonotoneY,
    curveNatural,
    curveStep,
    curveStepAfter,
    curveStepBefore,
    type CurveFactory,
    type CurveBundleFactory,
    type CurveCardinalFactory,
    type CurveCatmullRomFactory
} from 'd3-shape';

const curves = new Map<
    CurveName,
    CurveFactory | CurveBundleFactory | CurveCardinalFactory | CurveCatmullRomFactory
>([
    ['basis', curveBasis],
    ['basis-closed', curveBasisClosed],
    ['basis-open', curveBasisOpen],
    ['bundle', curveBundle],
    ['bump-x', curveBumpX],
    ['bump-y', curveBumpY],
    ['cardinal', curveCardinal],
    ['cardinal-closed', curveCardinalClosed],
    ['cardinal-open', curveCardinalOpen],
    ['catmull-rom', curveCatmullRom],
    ['catmull-rom-closed', curveCatmullRomClosed],
    ['catmull-rom-open', curveCatmullRomOpen],
    ['linear', curveLinear],
    ['linear-closed', curveLinearClosed],
    ['monotone-x', curveMonotoneX],
    ['monotone-y', curveMonotoneY],
    ['natural', curveNatural],
    ['step', curveStep],
    ['step-after', curveStepAfter],
    ['step-before', curveStepBefore]
]);

/**
 * Returns the appropriate D3 curve factory based on the curve name or custom factory.
 * Supports optional tension parameter for curves that accept it (cardinal, catmull-rom).
 */
// overloads
// bundle curve only works with lines, not areas, so we want a more specific return type
export function maybeCurve(curve: 'bundle', tension?: number): CurveBundleFactory;
// all other curve factories are either of type CurveFactory or extend it
export function maybeCurve(
    curve: AreaCurveName | CurveFactory,
    tension?: number
): CurveFactory | CurveCardinalFactory | CurveCatmullRomFactory;
// catch-all overload (needed e.g. for custom curve factories)
export function maybeCurve(
    curve?: CurveName | CurveFactory,
    tension?: number
): CurveFactory | CurveBundleFactory | CurveCardinalFactory | CurveCatmullRomFactory;

// implementation
export function maybeCurve(curve: CurveName | CurveFactory = curveLinear, tension?: number) {
    if (typeof curve === 'function') return curve; // custom curve
    const c = curves.get(`${curve}`.toLowerCase() as CurveName);
    if (!c) throw new Error(`unknown curve: ${curve}`);
    if (tension !== undefined) {
        if ('beta' in c) {
            return c.beta(tension);
        } else if ('tension' in c) {
            return c.tension(tension);
        } else if ('alpha' in c) {
            return c.alpha(tension);
        }
    }
    return c;
}
