"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionTargets = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * What `unit` may choose to aim `mission` at in `city`, such as the advances it may steal or the buildings it may
 * sabotage. Each rule answers a list, and the lists are joined. With no answer, the mission offers no choice and picks
 * its target as it always has.
 */
class MissionTargets extends Rule_1.default {
}
exports.MissionTargets = MissionTargets;
exports.default = MissionTargets;
//# sourceMappingURL=MissionTargets.js.map