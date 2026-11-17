"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionDetected = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether `city`'s defenders detect `unit` carrying out `mission` (counter-espionage). Detected when any rule says so;
 * with no rules, nothing is ever detected. The mission decides what detection does.
 */
class MissionDetected extends Rule_1.default {
}
exports.MissionDetected = MissionDetected;
exports.default = MissionDetected;
//# sourceMappingURL=MissionDetected.js.map