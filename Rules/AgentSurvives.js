"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSurvives = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
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
class AgentSurvives extends Rule_1.default {
}
exports.AgentSurvives = AgentSurvives;
exports.default = AgentSurvives;
//# sourceMappingURL=AgentSurvives.js.map