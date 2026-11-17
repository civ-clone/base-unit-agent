import {
  CAUGHT_CHECK,
  EscapeMode,
  HARD,
  MissionEscapeMode,
  ORDINARY,
} from './escape';
import Action from '@civ-clone/core-unit/Action';
import AgentLost from '../Rules/AgentLost';
import AgentSurvives from '../Rules/AgentSurvives';
import City from '@civ-clone/core-city/City';
import MissionChoice from '../Rules/MissionChoice';
import MissionDetected from '../Rules/MissionDetected';
import MissionMode from '../Rules/MissionMode';
import MissionTargets from '../Rules/MissionTargets';
import Player from '@civ-clone/core-player/Player';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import { typeNameOf } from '@civ-clone/core-data-object/DataObject';

/**
 * Whether `unit` survives a `mode` check on `mission` (`AgentSurvives`): every rule that answers says `true` (an
 * `undefined` answer counts as no). When none answers, `fallback()`, the mission's own answer from before the rule
 * existed. Without a `fallback`: the caught check passes, and after the mission the agent is used up. Nothing is drawn
 * when no rule answers and the fallback draws nothing. `missionMode` is the mission's resolved mode (`missionMode()`),
 * given to the rules as their fourth argument; it defaults to `mode`.
 */
export const agentSurvives = (
  unit: Unit,
  mission: Action,
  mode: EscapeMode,
  ruleRegistry: RuleRegistry,
  fallback: () => boolean = (): boolean => mode === CAUGHT_CHECK,
  resolvedMode: EscapeMode = mode
): boolean => {
  const answers = ruleRegistry.process(
    AgentSurvives,
    unit,
    mission,
    mode,
    resolvedMode
  );

  if (answers.length === 0) {
    return fallback();
  }

  return answers.every((survives: boolean): boolean => survives === true);
};

/**
 * The mode `unit` will escape with after `mission` (`MissionMode`): the first answer that is `ORDINARY` or `HARD`
 * (anything else, `undefined` or `CAUGHT_CHECK` included, is passed over), or `defaultMode` with none. Ask it once,
 * before the caught check and the mission's effects.
 */
export const missionMode = (
  unit: Unit,
  mission: Action,
  defaultMode: EscapeMode,
  ruleRegistry: RuleRegistry
): EscapeMode => {
  const [mode] = ruleRegistry
    .process(MissionMode, unit, mission, defaultMode)
    .filter((answer: unknown): answer is MissionEscapeMode =>
      [ORDINARY, HARD].includes(answer as number)
    );

  return mode === undefined ? defaultMode : mode;
};

/**
 * `mission` destroys its agent: the `AgentLost` rules run first (`caught` before the mission, otherwise after it), then
 * `unit.destroy(by)`. A caught agent is destroyed by the city's owner; one used up after a mission as each mission
 * always has been.
 */
export const loseAgent = (
  unit: Unit,
  city: City | null,
  mission: Action,
  caught: boolean,
  ruleRegistry: RuleRegistry,
  by?: Player | null
): void => {
  ruleRegistry.process(AgentLost, unit, city, mission, caught);

  if (by === undefined) {
    unit.destroy();

    return;
  }

  unit.destroy(by);
};

/** What `unit` may aim `mission` at in `city`: every `MissionTargets` rule's list, joined. Empty with no rules. */
export const missionTargets = (
  unit: Unit,
  city: City,
  mission: Action,
  ruleRegistry: RuleRegistry
): unknown[] =>
  ruleRegistry
    .process(MissionTargets, unit, city, mission)
    .flatMap((targets: unknown[]): unknown[] =>
      Array.isArray(targets) ? targets : []
    );

/**
 * The name a target goes by, so a client can send it back: a string as it is, a class by its type name, an object by
 * its class's type name (`typeNameOf`, as Pillage's targets are named). `null` for anything else.
 */
export const targetName = (target: unknown): string | null => {
  if (typeof target === 'string') {
    return target;
  }

  if (typeof target === 'function') {
    return typeNameOf(target as { name: string; type?: string });
  }

  if (target !== null && typeof target === 'object') {
    const sourceClass = (target as { sourceClass?: () => unknown }).sourceClass;

    return typeNameOf(
      (typeof sourceClass === 'function'
        ? sourceClass.call(target)
        : target.constructor) as { name: string; type?: string }
    );
  }

  return null;
};

/**
 * The one of `targets` that `choice` names: the target itself, or its name (`targetName`). `undefined` when `choice` is
 * `undefined` or names none of them, so a mission with no targets ignores any choice.
 */
export const chosenTarget = (
  choice: unknown,
  targets: unknown[]
): unknown | undefined => {
  if (choice === undefined) {
    return undefined;
  }

  if (targets.includes(choice)) {
    return choice;
  }

  if (typeof choice !== 'string') {
    return undefined;
  }

  return targets.find((target: unknown): boolean => {
    return targetName(target) === choice;
  });
};

/** Whether `city`'s defenders detect `unit` carrying out `mission`: whether any `MissionDetected` rule says so. */
export const missionDetected = (
  unit: Unit,
  city: City,
  mission: Action,
  ruleRegistry: RuleRegistry
): boolean =>
  ruleRegistry
    .process(MissionDetected, unit, city, mission)
    .some((detected: boolean): boolean => detected === true);

/**
 * The mission a computer player's `unit` would choose at `city` (`MissionChoice`): the first answer that is a string,
 * or `undefined` with none, when the client keeps its own choice. A rule may draw random numbers, so ask once each time
 * the agent is about to enter the city.
 */
export const missionChoice = (
  unit: Unit,
  city: City,
  ruleRegistry: RuleRegistry
): string | undefined =>
  ruleRegistry
    .process(MissionChoice, unit, city)
    .find((answer: unknown): answer is string => typeof answer === 'string');
