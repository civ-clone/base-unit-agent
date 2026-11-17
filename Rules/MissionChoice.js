"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionChoice = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * The mission a computer player's agent, `unit`, would choose at `city`, by the name of the rule set's action row (such
 * as `'steal-technology'`), for an AI client to read. Ask it once each time the agent is about to enter the city: a rule
 * may draw random numbers, as the original's choice does. With no rules (or no answer), the client chooses for itself.
 */
class MissionChoice extends Rule_1.default {
}
exports.MissionChoice = MissionChoice;
exports.default = MissionChoice;
//# sourceMappingURL=MissionChoice.js.map