// The seven parts, in the order a bench teardown actually goes: cover first,
// board last.
//
// Plain data with no three.js import, so the markup can render an accessible
// list of the whole teardown without pulling the renderer into that path, and
// so the 3D and the text can never drift apart.
//
// Every spec is a true fact about how drives work. Nothing here is a product
// claim, because this is not a product.

export const PARTS = [
  {
    key: 'cover', order: 3, name: 'Top cover',
    spec: 'Stamped steel on a gasket. The breather hole is filtered, never open',
  },
  {
    key: 'platters', order: 2, name: 'Platters',
    spec: 'Three glass substrates, 95 mm. At 7 200 rpm the rim is moving at 36 m/s',
  },
  {
    key: 'heads', order: 1, name: 'Head stack',
    spec: 'Six sliders on four arms. Each one flies about 3 nm above the surface',
  },
  {
    key: 'magnet', order: 0, name: 'Voice coil magnet',
    spec: 'Neodymium on a steel return path. It swings the arm across the disc in about 8 ms',
  },
  {
    key: 'spindle', order: -1, name: 'Spindle motor',
    spec: 'Fluid dynamic bearing. Nothing in the rotation ever touches anything else',
  },
  {
    key: 'base', order: -2, name: 'Base casting',
    spec: 'Cast aluminium. Every part above is aligned to machined pads on this one face',
  },
  {
    key: 'board', order: -3, name: 'Controller board',
    spec: 'Read channel, servo loop and cache. It decides where the arm goes next',
  },
];

/** Keyed lookup, for the geometry to attach names to the groups it builds. */
export const PART = Object.fromEntries(PARTS.map((p) => [p.key, p]));
