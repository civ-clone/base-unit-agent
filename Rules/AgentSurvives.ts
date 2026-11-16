import Action from '@civ-clone/core-unit/Action';
import { EscapeMode } from '../lib/escape';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Whether `unit`, a Diplomat or Spy carrying out `mission`, survives a check of the kind `mode` names
 * (`lib/escape`'s `EscapeMode`):
 * - `CAUGHT_CHECK` (−1), asked before the mission: `false` means the agent is caught and the mission doesn't happen;
 * - `ORDINARY` (0) or `HARD` (1), asked after it: `false` means the agent is used up.
 *
 * The agent survives when every rule that answers says so. When no rule answers, each mission keeps what it did
 * before this rule existed (`lib/agentSurvives`): the caught check passes, and the agent is used up after the mission.
 * A rule that keeps the agent moves it as it likes, usually with `escape()`.
 */
export class AgentSurvives extends Rule<[Unit, Action, EscapeMode], boolean> {}

export default AgentSurvives;
