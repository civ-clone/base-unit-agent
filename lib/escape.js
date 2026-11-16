"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escape = exports.nearestCity = exports.rollEscape = exports.escapeOdds = exports.HARD = exports.ORDINARY = exports.CAUGHT_CHECK = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const core_random_1 = require("@civ-clone/core-random");
/** A caught check, made before a mission: surviving it means the agent isn't caught. */
exports.CAUGHT_CHECK = -1;
/** The ordinary escape after a mission. */
exports.ORDINARY = 0;
/** The hard escape after a mission aimed at a target the agent chose, or another risky one. */
exports.HARD = 1;
/**
 * The escape odds `n` for `mode`, as OpenCiv2's `spy_try_escape` works them out (`unit_spy.cpp:23-31`): 3 for a caught
 * check and 2 otherwise, doubled for a veteran, then halved (rounded down) for a hard escape. The agent escapes unless
 * a roll of 0 to `n - 1` is 0.
 */
const escapeOdds = (mode, veteran) => {
    let odds = (mode < 0 ? 3 : 2) * (veteran ? 2 : 1);
    if (mode > 0) {
        odds = Math.floor(odds / 2);
    }
    return odds;
};
exports.escapeOdds = escapeOdds;
/**
 * Whether an agent with escape odds `odds` escapes: odds below 2 gain 1 on a coin flip; at 1 or less there's no roll
 * and the agent is caught; otherwise a roll of 0 to `odds - 1` that isn't 0 escapes. One draw for the coin flip, when
 * it's made, then one for the roll.
 */
const rollEscape = (odds, randomNumberGenerator = core_random_1.instance) => {
    if (odds < 2 && randomNumberGenerator() < 0.5) {
        odds++;
    }
    if (odds <= 1) {
        return false;
    }
    return Math.floor(randomNumberGenerator() * odds) !== 0;
};
exports.rollEscape = rollEscape;
/** `unit`'s player's city nearest it (by `Tile#distanceFrom`, the first of any tie), or `null` if it has none. */
const nearestCity = (unit, cityRegistry = CityRegistry_1.instance) => {
    const [city = null] = cityRegistry
        .getByPlayer(unit.player())
        .map((city) => [
        city,
        city.tile().distanceFrom(unit.tile()),
    ])
        .sort(([, a], [, b]) => a - b)
        .map(([city]) => city);
    return city;
};
exports.nearestCity = nearestCity;
/**
 * `unit` tries to escape after (or, for `CAUGHT_CHECK`, before) a mission, as OpenCiv2's `spy_try_escape` does, and
 * the answer is whether it did:
 * 1. for an ordinary or hard escape, the mission costs `missionCost` moves;
 * 2. `rollEscape(odds(unit, mode))`;
 * 3. an agent that escapes goes, when it `relocates`, to its player's nearest city, if it has one, with no moves left,
 *    inactive, and the `Moved` rules run for it (with `action`); then `escaped(unit, city, mode)` is called.
 *
 * It never destroys the agent: an `AgentSurvives` rule answers what this returns, and the mission destroys an agent
 * that doesn't survive.
 */
const escape = (unit, mode, { action, cityRegistry = CityRegistry_1.instance, escaped, missionCost = 0, odds = (unit, mode) => (0, exports.escapeOdds)(mode, false), randomNumberGenerator = core_random_1.instance, relocates = mode >= 0, ruleRegistry = RuleRegistry_1.instance, } = {}) => {
    if (mode >= 0 && missionCost > 0) {
        unit.moves().set(Math.max(0, unit.moves().value() - missionCost));
    }
    if (!(0, exports.rollEscape)(odds(unit, mode), randomNumberGenerator)) {
        return false;
    }
    const city = relocates ? (0, exports.nearestCity)(unit, cityRegistry) : null;
    if (city !== null) {
        unit.setTile(city.tile());
        unit.moves().set(0);
        unit.setActive(false);
        if (action !== undefined) {
            ruleRegistry.process(Moved_1.default, unit, action);
        }
    }
    escaped === null || escaped === void 0 ? void 0 : escaped(unit, city, mode);
    return true;
};
exports.escape = escape;
exports.default = exports.escape;
//# sourceMappingURL=escape.js.map