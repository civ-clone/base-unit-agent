"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionChoice = exports.missionDetected = exports.chosenTarget = exports.targetName = exports.missionTargets = exports.loseAgent = exports.missionMode = exports.agentSurvives = void 0;
const escape_1 = require("./escape");
const AgentLost_1 = require("../Rules/AgentLost");
const AgentSurvives_1 = require("../Rules/AgentSurvives");
const MissionChoice_1 = require("../Rules/MissionChoice");
const MissionDetected_1 = require("../Rules/MissionDetected");
const MissionMode_1 = require("../Rules/MissionMode");
const MissionTargets_1 = require("../Rules/MissionTargets");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
/**
 * Whether `unit` survives a `mode` check on `mission` (`AgentSurvives`): every rule that answers says `true` (an
 * `undefined` answer counts as no). When none answers, `fallback()`, the mission's own answer from before the rule
 * existed. Without a `fallback`: the caught check passes, and after the mission the agent is used up. Nothing is drawn
 * when no rule answers and the fallback draws nothing. `missionMode` is the mission's resolved mode (`missionMode()`),
 * given to the rules as their fourth argument; it defaults to `mode`.
 */
const agentSurvives = (unit, mission, mode, ruleRegistry, fallback = () => mode === escape_1.CAUGHT_CHECK, resolvedMode = mode) => {
    const answers = ruleRegistry.process(AgentSurvives_1.default, unit, mission, mode, resolvedMode);
    if (answers.length === 0) {
        return fallback();
    }
    return answers.every((survives) => survives === true);
};
exports.agentSurvives = agentSurvives;
/**
 * The mode `unit` will escape with after `mission` (`MissionMode`): the first answer that is `ORDINARY` or `HARD`
 * (anything else, `undefined` or `CAUGHT_CHECK` included, is passed over), or `defaultMode` with none. Ask it once,
 * before the caught check and the mission's effects.
 */
const missionMode = (unit, mission, defaultMode, ruleRegistry) => {
    const [mode] = ruleRegistry
        .process(MissionMode_1.default, unit, mission, defaultMode)
        .filter((answer) => [escape_1.ORDINARY, escape_1.HARD].includes(answer));
    return mode === undefined ? defaultMode : mode;
};
exports.missionMode = missionMode;
/**
 * `mission` destroys its agent: the `AgentLost` rules run first (`caught` before the mission, otherwise after it), then
 * `unit.destroy(by)`. A caught agent is destroyed by the city's owner; one used up after a mission as each mission
 * always has been.
 */
const loseAgent = (unit, city, mission, caught, ruleRegistry, by) => {
    ruleRegistry.process(AgentLost_1.default, unit, city, mission, caught);
    if (by === undefined) {
        unit.destroy();
        return;
    }
    unit.destroy(by);
};
exports.loseAgent = loseAgent;
/** What `unit` may aim `mission` at in `city`: every `MissionTargets` rule's list, joined. Empty with no rules. */
const missionTargets = (unit, city, mission, ruleRegistry) => ruleRegistry
    .process(MissionTargets_1.default, unit, city, mission)
    .flatMap((targets) => Array.isArray(targets) ? targets : []);
exports.missionTargets = missionTargets;
/**
 * The name a target goes by, so a client can send it back: a string as it is, a class by its type name, an object by
 * its class's type name (`typeNameOf`, as Pillage's targets are named). `null` for anything else.
 */
const targetName = (target) => {
    if (typeof target === 'string') {
        return target;
    }
    if (typeof target === 'function') {
        return (0, DataObject_1.typeNameOf)(target);
    }
    if (target !== null && typeof target === 'object') {
        const sourceClass = target.sourceClass;
        return (0, DataObject_1.typeNameOf)((typeof sourceClass === 'function'
            ? sourceClass.call(target)
            : target.constructor));
    }
    return null;
};
exports.targetName = targetName;
/**
 * The one of `targets` that `choice` names: the target itself, or its name (`targetName`). `undefined` when `choice` is
 * `undefined` or names none of them, so a mission with no targets ignores any choice.
 */
const chosenTarget = (choice, targets) => {
    if (choice === undefined) {
        return undefined;
    }
    if (targets.includes(choice)) {
        return choice;
    }
    if (typeof choice !== 'string') {
        return undefined;
    }
    return targets.find((target) => {
        return (0, exports.targetName)(target) === choice;
    });
};
exports.chosenTarget = chosenTarget;
/** Whether `city`'s defenders detect `unit` carrying out `mission`: whether any `MissionDetected` rule says so. */
const missionDetected = (unit, city, mission, ruleRegistry) => ruleRegistry
    .process(MissionDetected_1.default, unit, city, mission)
    .some((detected) => detected === true);
exports.missionDetected = missionDetected;
/**
 * The mission a computer player's `unit` would choose at `city` (`MissionChoice`): the first answer that is a string,
 * or `undefined` with none, when the client keeps its own choice. A rule may draw random numbers, so ask once each time
 * the agent is about to enter the city.
 */
const missionChoice = (unit, city, ruleRegistry) => ruleRegistry
    .process(MissionChoice_1.default, unit, city)
    .find((answer) => typeof answer === 'string');
exports.missionChoice = missionChoice;
//# sourceMappingURL=mission.js.map