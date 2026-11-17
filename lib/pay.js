"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pay = void 0;
/**
 * Pays `cost` from `player`'s treasury of `YieldType` (gold, usually), if it holds that much: whether it was paid.
 * Throws, as the registry does, when the player has no such treasury.
 */
const pay = (player, cost, YieldType, playerTreasuryRegistry) => {
    const treasury = playerTreasuryRegistry.getByPlayerAndType(player, YieldType);
    if (treasury.value() < cost) {
        return false;
    }
    treasury.subtract(cost);
    return true;
};
exports.pay = pay;
exports.default = exports.pay;
//# sourceMappingURL=pay.js.map