import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
/**
 * The squares of `player`'s cities with a standing palace: an improvement that `isPalace` (a rule set's `Palace`
 * class, say) and isn't destroyed, in `cityImprovementRegistry`'s order.
 */
export declare const palaceTiles: (
  player: Player,
  isPalace: (improvement: CityImprovement) => boolean,
  cityImprovementRegistry: CityImprovementRegistry
) => Tile[];
/**
 * The distance a Diplomat's or Spy's work is priced by: from the nearest of `palaces` to `tile`, by `distance(palace,
 * tile)`, capped at `cap`, and `cap` when there is no palace. Civ1 measures with its own distance from the city
 * (v474.05); Civ2 with the diagonal distance from the agent (`civ_distance_to_capital`). Both cap at 16.
 */
export declare const distanceFromPalace: (
  palaces: Tile[],
  tile: Tile,
  distance: (palace: Tile, tile: Tile) => number,
  cap?: number
) => number;
export default distanceFromPalace;
