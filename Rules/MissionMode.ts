import Action from '@civ-clone/core-unit/Action';
import { EscapeMode } from '../lib/escape';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * The mode `unit` will try to escape with after `mission` (`ORDINARY` or `HARD`), given the mission's own choice,
 * `defaultMode` (`HARD` after a chosen target, `ORDINARY` otherwise). Asked once, before the caught check and the
 * mission's effects, so a rule set can make a theft at a city already robbed `HARD`. The first answer (in the rules'
 * priority order) wins; with none, `defaultMode`. The resolved mode is what `AgentSurvives` is given (`lib/mission`).
 */
export class MissionMode extends Rule<[Unit, Action, EscapeMode], EscapeMode> {}

export default MissionMode;
