"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLost = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Processed whenever a mission destroys its agent, just before it does: `caught` when it was caught before the mission
 * (an `AgentSurvives` caught check said no), otherwise after it (it was used up, or failed to escape). `City` is the
 * mission's city, or `null` for a mission against a unit. A rule set raises its incidents here. With no rules, nothing
 * happens but the destruction.
 */
class AgentLost extends Rule_1.default {
}
exports.AgentLost = AgentLost;
exports.default = AgentLost;
//# sourceMappingURL=AgentLost.js.map