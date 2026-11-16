import { CAUGHT_CHECK, EscapeMode } from './escape';
import Action from '@civ-clone/core-unit/Action';
import AgentSurvives from '../Rules/AgentSurvives';
import City from '@civ-clone/core-city/City';
import MissionDetected from '../Rules/MissionDetected';
import MissionTargets from '../Rules/MissionTargets';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import { typeNameOf } from '@civ-clone/core-data-object/DataObject';

/**
 * Whether `unit` survives a `mode` check on `mission`: every `AgentSurvives` rule that answers says so. When none
 * answers, `fallback()`, the mission's own answer from before the rule existed. Without a `fallback`: the caught check
 * passes, and after the mission the agent is used up. Nothing is drawn when no rule answers and the fallback draws
 * nothing.
 */
export const agentSurvives = (
  unit: Unit,
  mission: Action,
  mode: EscapeMode,
  ruleRegistry: RuleRegistry,
  fallback: () => boolean = (): boolean => mode === CAUGHT_CHECK
): boolean => {
  const answers = ruleRegistry.process(AgentSurvives, unit, mission, mode);

  if (answers.length === 0) {
    return fallback();
  }

  return answers.every((survives: boolean): boolean => survives === true);
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
