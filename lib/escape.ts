import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Unit from '@civ-clone/core-unit/Unit';
import { instance as randomNumberGeneratorInstance } from '@civ-clone/core-random';

/** A caught check, made before a mission: surviving it means the agent isn't caught. */
export const CAUGHT_CHECK = -1;
/** The ordinary escape after a mission. */
export const ORDINARY = 0;
/** The hard escape after a mission aimed at a target the agent chose, or another risky one. */
export const HARD = 1;

/** The kinds of check an agent survives or not, as OpenCiv2's `spy_try_escape` numbers them. */
export type EscapeMode = typeof CAUGHT_CHECK | typeof ORDINARY | typeof HARD;

/** The modes an agent escapes with after a mission. */
export type MissionEscapeMode = typeof ORDINARY | typeof HARD;

/**
 * The escape odds `n` for `mode`, as OpenCiv2's `spy_try_escape` works them out (`unit_spy.cpp:23-31`): 3 for a caught
 * check and 2 otherwise, doubled for a veteran, then halved (rounded down) for a hard escape. The agent escapes unless
 * a roll of 0 to `n - 1` is 0.
 */
export const escapeOdds = (mode: EscapeMode, veteran: boolean): number => {
  let odds = (mode < 0 ? 3 : 2) * (veteran ? 2 : 1);

  if (mode > 0) {
    odds = Math.floor(odds / 2);
  }

  return odds;
};

/**
 * Whether an agent with escape odds `odds` escapes: odds below 2 gain 1 on a coin flip; at 1 or less there's no roll
 * and the agent is caught; otherwise a roll of 0 to `odds - 1` that isn't 0 escapes. One draw for the coin flip, when
 * it's made, then one for the roll.
 */
export const rollEscape = (
  odds: number,
  randomNumberGenerator: () => number = randomNumberGeneratorInstance
): boolean => {
  if (odds < 2 && randomNumberGenerator() < 0.5) {
    odds++;
  }

  if (odds <= 1) {
    return false;
  }

  return Math.floor(randomNumberGenerator() * odds) !== 0;
};

/** `unit`'s player's city nearest it (by `Tile#distanceFrom`, the first of any tie), or `null` if it has none. */
export const nearestCity = (
  unit: Unit,
  cityRegistry: CityRegistry = cityRegistryInstance
): City | null => {
  const [city = null] = cityRegistry
    .getByPlayer(unit.player())
    .map((city: City): [City, number] => [
      city,
      city.tile().distanceFrom(unit.tile()),
    ])
    .sort(([, a], [, b]): number => a - b)
    .map(([city]): City => city);

  return city;
};

export interface EscapeOptions {
  // The action the agent carried out, for the `Moved` rules run when it moves to a city.
  action?: Action;
  cityRegistry?: CityRegistry;
  // Called for an agent that escaped after a mission (not a caught check), with the city it went to, if any. Civ2
  //  makes a Spy a veteran then.
  escaped?: (unit: Unit, city: City | null, mode: EscapeMode) => void;
  // Moves the check costs the agent first, for an ordinary or hard escape. Civ2: 1 (`spy_try_escape` adds a full move
  //  only when `mission_mode > -1`, so a caught check costs nothing). Default 0.
  missionCost?: number;
  // The escape odds. Default: `escapeOdds(mode, false)`; a rule set says which agents are veterans.
  odds?: (unit: Unit, mode: EscapeMode) => number;
  randomNumberGenerator?: () => number;
  // Whether an agent that escapes goes to its player's nearest city. Default: after a mission (`mode >= 0`), not after
  //  a caught check. OpenCiv2 moves it after a caught check too, but the mission's own escape moves it again or
  //  destroys it, so where it waits in between makes no difference.
  relocates?: boolean;
  ruleRegistry?: RuleRegistry;
  // Where an agent aboard a transport is found, so one that escapes to a city is unloaded there (OpenCiv2's
  //  `unit_relocate` takes it off the ship).
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
export const escape = (
  unit: Unit,
  mode: EscapeMode,
  {
    action,
    cityRegistry = cityRegistryInstance,
    escaped,
    missionCost = 0,
    odds = (unit: Unit, mode: EscapeMode): number => escapeOdds(mode, false),
    randomNumberGenerator = randomNumberGeneratorInstance,
    relocates = mode >= 0,
    ruleRegistry = ruleRegistryInstance,
    transportRegistry = transportRegistryInstance,
  }: EscapeOptions = {}
): boolean => {
  if (mode >= 0 && missionCost > 0) {
    unit.moves().set(Math.max(0, unit.moves().value() - missionCost));
  }

  if (!rollEscape(odds(unit, mode), randomNumberGenerator)) {
    return false;
  }

  const city = relocates ? nearestCity(unit, cityRegistry) : null;

  if (city !== null) {
    unit.setTile(city.tile());

    // Off the ship it was aboard, which would otherwise carry it on or take it down with it.
    if (transportRegistry.hasUnit(unit)) {
      transportRegistry.getByUnit(unit).transport().unload(unit);
      unit.setBusy();
    }

    unit.moves().set(0);
    unit.setActive(false);

    if (action !== undefined) {
      ruleRegistry.process(Moved, unit, action);
    }
  }

  // A veteran's promotion and the like follow a mission, not a caught check.
  if (mode >= 0) {
    escaped?.(unit, city, mode);
  }

  return true;
};

export default escape;
