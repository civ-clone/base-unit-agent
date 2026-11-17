"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionMode = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * The mode `unit` will try to escape with after `mission` (`ORDINARY` or `HARD`), given the mission's own choice,
 * `defaultMode` (`HARD` after a chosen target, `ORDINARY` otherwise). Asked once, before the caught check and the
 * mission's effects, so a rule set can make a theft at a city already robbed `HARD`. The first answer (in the rules'
 * priority order) that is `ORDINARY` or `HARD` wins; with none, `defaultMode`. The resolved mode is what `AgentSurvives` is given (`lib/mission`).
 */
class MissionMode extends Rule_1.default {
}
exports.MissionMode = MissionMode;
exports.default = MissionMode;
//# sourceMappingURL=MissionMode.js.map