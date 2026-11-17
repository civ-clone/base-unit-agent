import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Unit from '@civ-clone/core-unit/Unit';
/** A caught check, made before a mission: surviving it means the agent isn't caught. */
export declare const CAUGHT_CHECK = -1;
/** The ordinary escape after a mission. */
export declare const ORDINARY = 0;
/** The hard escape after a mission aimed at a target the agent chose, or another risky one. */
export declare const HARD = 1;
/** The kinds of check an agent survives or not, as OpenCiv2's `spy_try_escape` numbers them. */
export type EscapeMode = typeof CAUGHT_CHECK | typeof ORDINARY | typeof HARD;
/** The modes an agent escapes with after a mission. */
export type MissionEscapeMode = typeof ORDINARY | typeof HARD;
/**
 * The escape odds `n` for `mode`, as OpenCiv2's `spy_try_escape` works them out (`unit_spy.cpp:23-31`): 3 for a caught
 * check and 2 otherwise, doubled for a veteran, then halved (rounded down) for a hard escape. The agent escapes unless
 * a roll of 0 to `n - 1` is 0.
 */
export declare const escapeOdds: (mode: EscapeMode, veteran: boolean) => number;
/**
 * Whether an agent with escape odds `odds` escapes: odds below 2 gain 1 on a coin flip; at 1 or less there's no roll
 * and the agent is caught; otherwise a roll of 0 to `odds - 1` that isn't 0 escapes. One draw for the coin flip, when
 * it's made, then one for the roll.
 */
export declare const rollEscape: (
  odds: number,
  randomNumberGenerator?: () => number
) => boolean;
/** `unit`'s player's city nearest it (by `Tile#distanceFrom`, the first of any tie), or `null` if it has none. */
export declare const nearestCity: (
  unit: Unit,
  cityRegistry?: CityRegistry
) => City | null;
export interface EscapeOptions {
  action?: Action;
  cityRegistry?: CityRegistry;
  escaped?: (unit: Unit, city: City | null, mode: EscapeMode) => void;
  missionCost?: number;
  odds?: (unit: Unit, mode: EscapeMode) => number;
  randomNumberGenerator?: () => number;
  relocates?: boolean;
  ruleRegistry?: RuleRegistry;
  transportRegistry?: TransportRegistry;
}
/**
 * `unit` tries to escape after (or, for `CAUGHT_CHECK`, before) a mission, as OpenCiv2's `spy_try_escape` does, and
 * the answer is whether it did:
 * 1. for an ordinary or hard escape, the mission costs `missionCost` moves;
 * 2. `rollEscape(odds(unit, mode))`;
 * 3. an agent that escapes goes, when it `relocates`, to its player's nearest city, if it has one: off any transport
 *    it was aboard (unloaded, its busy state cleared), with no moves left, inactive, and the `Moved` rules run for it
 *    (with `action`); then, after a mission (not a caught check), `escaped(unit, city, mode)` is called.
 *
 * It never destroys the agent: an `AgentSurvives` rule answers what this returns, and the mission destroys an agent
 * that doesn't survive.
 */
export declare const escape: (
  unit: Unit,
  mode: EscapeMode,
  {
    action,
    cityRegistry,
    escaped,
    missionCost,
    odds,
    randomNumberGenerator,
    relocates,
    ruleRegistry,
    transportRegistry,
  }?: EscapeOptions
) => boolean;
export default escape;
