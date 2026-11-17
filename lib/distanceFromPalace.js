"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distanceFromPalace = exports.palaceTiles = void 0;
/**
 * The squares of `player`'s cities with a standing palace: an improvement that `isPalace` (a rule set's `Palace`
 * class, say) and isn't destroyed, in `cityImprovementRegistry`'s order.
 */
const palaceTiles = (player, isPalace, cityImprovementRegistry) => cityImprovementRegistry
    .filter((cityImprovement) => isPalace(cityImprovement) &&
    !cityImprovement.destroyed() &&
    cityImprovement.city().player() === player)
    .map((palace) => palace.city().tile());
exports.palaceTiles = palaceTiles;
/**
 * The distance a Diplomat's or Spy's work is priced by: from the nearest of `palaces` to `tile`, by `distance(palace,
 * tile)`, capped at `cap`, and `cap` when there is no palace. Civ1 measures with its own distance from the city
 * (v474.05); Civ2 with the diagonal distance from the agent (`civ_distance_to_capital`). Both cap at 16.
 */
const distanceFromPalace = (palaces, tile, distance, cap = 16) => Math.min(cap, ...palaces.map((palace) => distance(palace, tile)));
exports.distanceFromPalace = distanceFromPalace;
exports.default = exports.distanceFromPalace;
//# sourceMappingURL=distanceFromPalace.js.map