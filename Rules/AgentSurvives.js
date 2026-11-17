"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSurvives = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether `unit`, a Diplomat or Spy carrying out `mission`, survives a check of the kind `mode` names
 * (`lib/escape`'s `EscapeMode`):
 * - `CAUGHT_CHECK` (−1), asked before the mission: `false` means the agent is caught and the mission doesn't happen;
 * - `ORDINARY` (0) or `HARD` (1), asked after it: `false` means the agent is used up. This is the mission's resolved
 *   mode (`MissionMode`).
 *
 * The fourth argument is always the mission's resolved mode, so a rule answering a caught check can tell, say, a
 * random theft (`ORDINARY`, which the original never checks) from a chosen one.
 *
 * How the answers combine is `lib/mission`'s `agentSurvives`:
 * - the agent survives when every rule that answers says `true`; any other answer, `undefined` included, counts as no;
 * - when no rule answers, the mission keeps what it did before this rule existed: the caught check passes, and the
 *   agent is used up after the mission.
 *
 * Register one rule that escapes (calls `escape()`) per mission and mode, or an agent could be moved twice. A rule that
 * answers `true` keeps the agent where it leaves it and must spend its moves itself (`escape()`'s `missionCost`, or
 * `unit.moves()`): the missions charge nothing.
 */
class AgentSurvives extends Rule_1.default {
}
exports.AgentSurvives = AgentSurvives;
exports.default = AgentSurvives;
//# sourceMappingURL=AgentSurvives.js.map