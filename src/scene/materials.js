/*
 * Materials for the drive.
 *
 * Built fresh PER PART rather than shared across the assembly. That costs a few
 * dozen extra material objects (Three caches shader programs by config, so the
 * program count barely moves) and buys the thing the teardown needs: the
 * ability to dim six parts and leave the seventh lit, without a shared material
 * dragging unrelated geometry along with it.
 *
 * Everything is lit by the RoomEnvironment IBL in stage.js. Metals need an
 * environment to reflect or they render as flat grey.
 *
 * Colour discipline: the page around this object is monochrome. The only
 * chromatic surfaces in the entire site are here, and both are honest: the
 * amber of a polyimide flex circuit and the brass of edge contacts. A drive has
 * no lighting in it, so there is no emissive material at all.
 */

import * as THREE from 'three';

export function driveMaterials() {
  return {
    // Metals are tinted DARK on purpose. At metalness 1 the base colour tints
    // the reflection, so a light grey against a bright IBL blows out to near
    // white and flattens the whole object.
    steel: new THREE.MeshPhysicalMaterial({
      color: 0x4a4d51, metalness: 1, roughness: 0.29, clearcoat: 0.2, clearcoatRoughness: 0.4,
    }),
    // Cast aluminium is noticeably duller than the stamped lid. Two grades of
    // the same metal is most of what stops the thing reading as one extrusion.
    //
    // Tinted lighter than the rest, against the general rule of keeping metals
    // dark. The casting is a deep tub, and a metal gets all of its brightness
    // from what it reflects: facing up out of a recess there is very little,
    // so at the darker tint the whole part rendered as a glossy black tray and
    // read as plastic. Large recessed surfaces need the opposite treatment to
    // small proud ones.
    cast: new THREE.MeshPhysicalMaterial({ color: 0x51565b, metalness: 1, roughness: 0.6 }),
    machined: new THREE.MeshPhysicalMaterial({ color: 0x53585d, metalness: 1, roughness: 0.24 }),

    // The payoff surface, and the one that took the most tuning.
    //
    // A true mirror was wrong. At roughness 0.05 a flat disc facing up reflects
    // an almost uniform environment back at the camera, so it rendered as a
    // featureless light grey slab that read as white plastic. A little
    // roughness lets the warm key lay a broad highlight band across the disc
    // instead, and that gradient is what actually says polished metal.
    platter: new THREE.MeshPhysicalMaterial({
      color: 0x83888c, metalness: 1, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.05,
    }),

    // Nickel-plated neodymium, and the mild steel return plate under it. The
    // plate is deliberately the darkest metal on the object so the magnet block
    // sitting on it stays legible as a separate thing.
    magnet: new THREE.MeshPhysicalMaterial({ color: 0x5c6064, metalness: 1, roughness: 0.2 }),
    plate: new THREE.MeshPhysicalMaterial({ color: 0x2b2e31, metalness: 1, roughness: 0.4 }),

    board: new THREE.MeshPhysicalMaterial({ color: 0x14181b, metalness: 0.1, roughness: 0.72 }),
    // Real drive PCBs are green. Dark is the taste call: a green board would be
    // the one loud surface on a monochrome page, and it would be the least
    // interesting part shouting the loudest.
    chip: new THREE.MeshPhysicalMaterial({ color: 0x23272b, metalness: 0.35, roughness: 0.44 }),
    brass: new THREE.MeshPhysicalMaterial({ color: 0x7d6224, metalness: 1, roughness: 0.31 }),

    // Kapton. Polyimide film really is this colour, so the one warm accent on
    // the object is anatomically true rather than decoration. Slightly rough
    // and only part metal, because it is a plastic film with copper under it.
    kapton: new THREE.MeshPhysicalMaterial({
      color: 0x9c5420, metalness: 0.2, roughness: 0.46, clearcoat: 0.5, clearcoatRoughness: 0.4,
    }),
    copper: new THREE.MeshPhysicalMaterial({ color: 0x7d4520, metalness: 1, roughness: 0.33 }),
    plastic: new THREE.MeshPhysicalMaterial({ color: 0x101215, metalness: 0, roughness: 0.62 }),
  };
}
