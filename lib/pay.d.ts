import Player from '@civ-clone/core-player/Player';
import PlayerTreasuryRegistry from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import Yield from '@civ-clone/core-yield/Yield';
/**
 * Pays `cost` from `player`'s treasury of `YieldType` (gold, usually), if it holds that much: whether it was paid.
 * Throws, as the registry does, when the player has no such treasury.
 */
export declare const pay: (
  player: Player,
  cost: number,
  YieldType: typeof Yield,
  playerTreasuryRegistry: PlayerTreasuryRegistry
) => boolean;
export default pay;
