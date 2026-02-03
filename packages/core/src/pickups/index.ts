export type { PickupType, XPGemTier, Pickup, PickupVisualConfig, PickupConfig } from "./types";
export { XP_GEM_TIERS, DEFAULT_PICKUP_CONFIG, getXPGemTier } from "./types";
export { createXPGem, destroyPickup } from "./PickupFactory";
export { pickupAttractionSystem } from "./PickupAttractionSystem";
export { pickupCollectionSystem } from "./PickupCollectionSystem";
export type { CollectionResult } from "./PickupCollectionSystem";
