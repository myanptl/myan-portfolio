// The eleven parts, in the order an engine actually comes apart: cowl off the
// front, then forward to back, shafts out of the middle last.
//
// Plain data with no three.js import, so the markup can render an accessible
// list of the whole teardown without pulling the renderer into that path, and
// so the 3D and the text can never drift apart.
//
// `order` is the part's slot along the engine axis when exploded, front to
// back. `spin` names which spool it turns with, or null if it is static: the
// low-pressure spool carries the fan, booster and LP turbine on one shaft, the
// high-pressure spool carries the compressor and HP turbine on another, and
// the two turn at completely different speeds.
//
// Every spec is a true fact about how turbofans work. Nothing here is a claim
// about a real engine, because this is not one.

export const PARTS = [
  {
    key: 'nacelle', order: -5, spin: null, name: 'Nacelle',
    spec: 'Cowl and inlet. Most of the air it swallows goes around the core rather than through it',
  },
  {
    key: 'spinner', order: -4, spin: 'lp', name: 'Spinner',
    spec: 'Turns the incoming air onto the blade roots. The spiral is painted on so ground crew can see it running',
  },
  {
    key: 'fan', order: -3, spin: 'lp', name: 'Fan',
    spec: 'Twenty titanium blades, 2.8 m across, moving over a tonne of air every second',
  },
  {
    key: 'fancase', order: -2, spin: null, name: 'Fan case and guide vanes',
    spec: 'Straightens the bypass flow, and is built heavy enough to contain a blade if one ever lets go',
  },
  {
    key: 'booster', order: -1, spin: 'lp', name: 'Booster',
    spec: 'Three stages on the same shaft as the fan. The first squeeze, before the air reaches the core',
  },
  {
    key: 'hpc', order: 0, spin: 'hp', name: 'High pressure compressor',
    spec: 'Eight stages turning the other way. Air leaves here near 600 °C before any fuel is burned',
  },
  {
    key: 'combustor', order: 1, spin: null, name: 'Combustor',
    spec: 'Annular, with twenty nozzles. The flame runs hotter than the melting point of the metal around it',
  },
  {
    key: 'hpt', order: 2, spin: 'hp', name: 'High pressure turbine',
    spec: 'Blades grown as a single crystal and cooled from the inside. All of its work goes back into the compressor',
  },
  {
    key: 'lpt', order: 3, spin: 'lp', name: 'Low pressure turbine',
    spec: 'Four stages on the inner shaft. Everything it makes goes into turning the fan',
  },
  {
    key: 'plug', order: 4, spin: null, name: 'Exhaust plug',
    spec: 'Closes the core flow out behind the turbine. Discoloured because it has run hot its whole life',
  },
  {
    key: 'shafts', order: 5, spin: 'both', name: 'Shafts',
    spec: 'Two of them, one running inside the other, turning opposite ways at completely different speeds',
  },
];

/**
 * Keyed lookup, carrying each part's position in the teardown walk.
 *
 * `step` exists because the walk order and the axial order are not the same
 * thing for every object: a stack is taken apart top down, an engine front to
 * back. Deriving it from this array's own order keeps the two independent.
 */
export const PART = Object.fromEntries(
  PARTS.map((p, step) => [p.key, { ...p, step }]),
);
