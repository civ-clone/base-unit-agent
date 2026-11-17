import { EscapeMode } from './escape';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Whether `unit` survives a `mode` check on `mission` (`AgentSurvives`): every rule that answers says `true` (an
 * `undefined` answer counts as no). When none answers, `fallback()`, the mission's own answer from before the rule
 * existed. Without a `fallback`: the caught check passes, and after the mission the agent is used up. Nothing is drawn
 * when no rule answers and the fallback draws nothing. `missionMode` is the mission's resolved mode (`missionMode()`),
 * given to the rules as their fourth argument; it defaults to `mode`.
 */
export declare const agentSurvives: (
  unit: Unit,
  mission: Action,
  mode: EscapeMode,
  ruleRegistry: RuleRegistry,
  fallback?: () => boolean,
  resolvedMode?: EscapeMode
) => boolean;
/**
 * The mode `unit` will escape with after `mission` (`MissionMode`): the first rule's answer, or `defaultMode` with
 * none. Ask it once, before the caught check and the mission's effects.
 */
export declare const missionMode: (
  unit: Unit,
  mission: Action,
  defaultMode: EscapeMode,
  ruleRegistry: RuleRegistry
) => EscapeMode;
/**
 * `mission` destroys its agent: the `AgentLost` rules run first (`caught` before the mission, otherwise after it), then
 * `unit.destroy(by)`. A caught agent is destroyed by the city's owner; one used up after a mission as each mission
 * always has been.
 */
export declare const loseAgent: (
  unit: Unit,
  city: City | null,
  mission: Action,
  caught: boolean,
  ruleRegistry: RuleRegistry,
  by?: Player | null
) => void;
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
