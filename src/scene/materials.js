/*
 * Materials for the engine.
 *
 * Built fresh PER PART rather than shared across the assembly. That costs a few
 * dozen extra material objects (Three caches shader programs by config, so the
 * program count barely moves) and buys the thing the teardown needs: the
 * ability to dim ten parts and leave the eleventh lit, without a shared
 * material dragging unrelated geometry along with it.
 *
 * Everything is lit by the RoomEnvironment IBL in stage.js. Metals need an
 * environment to reflect or they render as flat grey.
 *
 * Colour discipline: the page around this object is monochrome, and the only
 * chromatic surfaces on the whole site are the hot section here. That is not a
 * decorative accent. A combustor and the turbine behind it run discoloured for
 * their entire service life, straw through bronze through blue, and it is the
 * one place on an engine where colour is a fact rather than a choice.
 */

import * as THREE from 'three';

export function engineMaterials() {
  return {
    // Metals are tinted DARK on purpose. At metalness 1 the base colour tints
    // the reflection, so a light grey against a bright IBL blows out to near
    // white and flattens the whole object.
    /*
     * A cowl is painted, not polished. The first pass had this at metalness 1
     * and roughness 0.33 with heavy clearcoat, and the result was liquid
     * chrome: a mirrored bell that read as jewellery rather than as hardware,
     * and the same finish this site has already rejected once. Dropping
     * metalness is what fixes it. A part-metal surface keeps its own dark base
     * colour instead of borrowing the whole environment.
     */
    cowl: new THREE.MeshPhysicalMaterial({
      color: 0x21252a, metalness: 0.4, roughness: 0.54, clearcoat: 0.12, clearcoatRoughness: 0.5,
    }),
    // The inside of the inlet is a duct, not a display surface: duller, so the
    // fan behind it stays the brightest thing seen through the opening.
    duct: new THREE.MeshPhysicalMaterial({ color: 0x212528, metalness: 0.8, roughness: 0.62 }),

    // The payoff surface. A fan blade is polished titanium, and it is the first
    // thing anyone looks at. Roughness kept low enough to throw a moving band
    // of highlight along the twist as the stage turns, but not mirror: a true
    // mirror reflects a near-uniform environment and renders flat.
    blade: new THREE.MeshPhysicalMaterial({
      color: 0x6c7176, metalness: 1, roughness: 0.24, clearcoat: 0.6, clearcoatRoughness: 0.12,
    }),
    alloy: new THREE.MeshPhysicalMaterial({ color: 0x474c51, metalness: 1, roughness: 0.3 }),
    caseAlloy: new THREE.MeshPhysicalMaterial({ color: 0x3d4146, metalness: 1, roughness: 0.44 }),
    shaft: new THREE.MeshPhysicalMaterial({ color: 0x494e53, metalness: 1, roughness: 0.24 }),

    /* Hot section. The one colour on the site. */
    // Combustor liner: straw through bronze, the colour steel takes at heat.
    liner: new THREE.MeshPhysicalMaterial({ color: 0x8a6330, metalness: 1, roughness: 0.42 }),
    // Turbine blades run hotter still and go darker and browner with it.
    hotBlade: new THREE.MeshPhysicalMaterial({
      color: 0x6f5330, metalness: 1, roughness: 0.34, clearcoat: 0.4, clearcoatRoughness: 0.3,
    }),
    // The plug is the coolest of the three, so it keeps more of the metal.
    stained: new THREE.MeshPhysicalMaterial({ color: 0x5e5236, metalness: 1, roughness: 0.46 }),

    seal: new THREE.MeshPhysicalMaterial({ color: 0x131518, metalness: 0.1, roughness: 0.66 }),
  };
}
