import { EscapeMode } from './escape';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Whether `unit` survives a `mode` check on `mission`: every `AgentSurvives` rule that answers says so. When none
 * answers, `fallback()`, the mission's own answer from before the rule existed. Without a `fallback`: the caught check
 * passes, and after the mission the agent is used up. Nothing is drawn when no rule answers and the fallback draws
 * nothing.
 */
export declare const agentSurvives: (
  unit: Unit,
  mission: Action,
  mode: EscapeMode,
  ruleRegistry: RuleRegistry,
  fallback?: () => boolean
) => boolean;
/** What `unit` may aim `mission` at in `city`: every `MissionTargets` rule's list, joined. Empty with no rules. */
export declare const missionTargets: (
  unit: Unit,
  city: City,
  mission: Action,
  ruleRegistry: RuleRegistry
) => unknown[];
/**
 * The name a target goes by, so a client can send it back: a string as it is, a class by its type name, an object by
 * its class's type name (`typeNameOf`, as Pillage's targets are named). `null` for anything else.
 */
export declare const targetName: (target: unknown) => string | null;
/**
 * The one of `targets` that `choice` names: the target itself, or its name (`targetName`). `undefined` when `choice` is
 * `undefined` or names none of them, so a mission with no targets ignores any choice.
 */
export declare const chosenTarget: (
  choice: unknown,
  targets: unknown[]
) => unknown | undefined;
/** Whether `city`'s defenders detect `unit` carrying out `mission`: whether any `MissionDetected` rule says so. */
export declare const missionDetected: (
  unit: Unit,
  city: City,
  mission: Action,
  ruleRegistry: RuleRegistry
) => boolean;
