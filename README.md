# base-unit-agent

What becomes of a Diplomat or Spy (an agent) on a mission: whether it is caught or escapes, the targets it may choose,
whether a city's defenders detect it, and the distance from a Palace that prices its work.

This is a library: it has no `main` and registers nothing. The mission actions (base-unit-action-establish-embassy,
-investigate-city, -steal-technology, -industrial-sabotage, -incite-revolt, -sabotage-unit, -poison-water and
-plant-nuclear-device) ask its rules; a rule set registers its own.

## Rules

Every mission (but BribeUnit, whose agent is never used up) does this, in order:

1. **`MissionMode(unit, mission, defaultMode) → mode`**: the mode the agent will escape with after the mission. The
   default is the mission's own choice (`HARD` after a chosen target, `ORDINARY` otherwise); the first answer that is
   `ORDINARY` or `HARD` wins (`undefined` or `CAUGHT_CHECK` is passed over). A
   rule set makes, say, a theft at a city already robbed `HARD`.
2. **`AgentSurvives(unit, mission, CAUGHT_CHECK, mode)`**: the caught check. `false` means the agent is caught: the
   `AgentLost` rules run (`caught` true) and it is destroyed by the city's owner (the target's owner for SabotageUnit),
   and the mission doesn't happen. With no answer, it passes. The fourth argument, the resolved mode, lets a rule pass
   a mission the original never checks (a random theft) without rolling.
3. The mission's effects.
4. **`AgentSurvives(unit, mission, mode, mode)`**: after the mission. `false` means the agent is used up: the
   `AgentLost` rules run (`caught` false) and it is destroyed as the mission always destroyed it. With no answer, it is
   used up (SabotageUnit rolls its own escape, from its options).

How the answers combine is `lib/mission`'s `agentSurvives`: the agent survives when every rule that answers says
`true`; any other answer, `undefined` included, counts as no. Register **one** rule that escapes (calls `escape()`)
per mission and mode, or the agent could be moved twice. **A rule that answers `true` must spend the agent's moves
itself** (`escape()`'s `missionCost`, or `unit.moves()`): the missions charge nothing for a survivor, so a person's
Spy that stays after an embassy pays what the rule set says.

- **`AgentLost(unit, city, mission, caught)`**, processed just before a mission destroys its agent (`city` is `null`
  for a mission against a unit): where a rule set raises its incidents. With no rules, nothing happens but the
  destruction.
- **`MissionTargets(unit, city, mission) → unknown[]`.** What the agent may choose to aim the mission at (advances to
  steal, buildings to sabotage). The lists are joined. With none, a mission offers no choice and ignores one.
- **`MissionDetected(unit, city, mission) → boolean`.** Whether the city's defenders detect the agent
  (counter-espionage). Any `true` detects; with no rules, nothing is detected. StealTechnology asks it for a theft
  with no chosen target, after the caught check.

## `lib/escape`

- `CAUGHT_CHECK` (−1), `ORDINARY` (0) and `HARD` (1): the `EscapeMode`s, numbered as OpenCiv2's `spy_try_escape`
  numbers them.
- `escapeOdds(mode, veteran)`: 3 for a caught check and 2 otherwise, doubled for a veteran, halved (rounded down) for a
  hard escape.
- `rollEscape(odds, randomNumberGenerator)`: odds below 2 gain 1 on a coin flip; at 1 or less the agent is caught with
  no roll; otherwise a roll of 0 to `odds - 1` that isn't 0 escapes.
- `nearestCity(unit, cityRegistry)`: the unit's player's nearest city, or `null`.
- `escape(unit, mode, options)`: the whole of `spy_try_escape` but the destroying. For an ordinary or hard escape the
  check costs `missionCost` moves (default 0); then `rollEscape(odds(unit, mode))` (default `escapeOdds(mode,
  false)`); an agent that escapes and `relocates` (default: after a mission, not after a caught check) goes to its
  player's nearest city with no moves left, inactive, and the `Moved` rules run with `action`; an agent aboard a
  transport (in `transportRegistry`, default core-unit-transport's instance) is unloaded there and its busy state
  cleared, so the ship doesn't carry it on; then `escaped(unit, city, mode)` is called (Civ2: the Spy becomes a
  veteran). Returns whether it escaped.

## `lib/mission`

- `missionMode(unit, mission, defaultMode, ruleRegistry)`: asks `MissionMode` as above.
- `agentSurvives(unit, mission, mode, ruleRegistry, fallback?, resolvedMode = mode)`: asks `AgentSurvives` as above;
  `fallback()` when no rule answers (default: `true` for a caught check, `false` otherwise).
- `loseAgent(unit, city, mission, caught, ruleRegistry, by?)`: runs `AgentLost`, then `unit.destroy(by)` (`destroy()`
  with no `by`).
- `missionTargets(unit, city, mission, ruleRegistry)`, `missionDetected(unit, city, mission, ruleRegistry)`.
- `chosenTarget(choice, targets)`: the target `choice` is, or names; `undefined` for any other choice.
- `targetName(target)`: a string as it is, a class or an object by its type name (`typeNameOf`), as a client sends a
  choice back.

## `lib/distanceFromPalace`

- `palaceTiles(player, isPalace, cityImprovementRegistry)`: the squares of the player's cities with a standing palace.
- `distanceFromPalace(palaces, tile, distance, cap = 16)`: the smallest `distance(palace, tile)`, capped, and the cap
  with no palace. Civ1 measures from the city with its own distance; Civ2 from the agent with the diagonal distance.

## `lib/pay`

- `pay(player, cost, YieldType, playerTreasuryRegistry)`: pays `cost` from the treasury if it holds that much, and says
  whether it did.
