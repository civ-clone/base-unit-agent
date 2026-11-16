# base-unit-agent

What becomes of a Diplomat or Spy (an agent) on a mission: whether it is caught or escapes, the targets it may choose,
whether a city's defenders detect it, and the distance from a Palace that prices its work.

This is a library: it has no `main` and registers nothing. The mission actions (base-unit-action-establish-embassy,
-investigate-city, -steal-technology, -industrial-sabotage, -incite-revolt, -sabotage-unit, -poison-water and
-plant-nuclear-device) ask its rules; a rule set registers its own.

## Rules

- **`AgentSurvives(unit, mission, mode) → boolean`.** Every mission asks it twice:
  - before the mission, with `CAUGHT_CHECK`: `false` means the agent is caught, the mission doesn't happen and the
    agent is destroyed;
  - after it, with `ORDINARY` or `HARD` (a chosen target): `false` means the agent is used up.

  The agent survives when every rule that answers says so. When none answers, each mission does what it did before
  this rule existed: the caught check passes, and the agent is used up after the mission (SabotageUnit rolls its own
  escape, from its options). A rule that keeps an agent moves it as it likes, usually with `escape()`.
- **`MissionTargets(unit, city, mission) → unknown[]`.** What the agent may choose to aim the mission at (advances to
  steal, buildings to sabotage). The lists are joined. With none, a mission offers no choice and ignores one.
- **`MissionDetected(unit, city, mission) → boolean`.** Whether the city's defenders detect the agent
  (counter-espionage). Any `true` detects; with no rules, nothing is detected. StealTechnology asks it for a theft
  with no chosen target.

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
  player's nearest city with no moves left, inactive, and the `Moved` rules run with `action`; then
  `escaped(unit, city, mode)` is called (Civ2: the Spy becomes a veteran). Returns whether it escaped.

## `lib/mission`

- `agentSurvives(unit, mission, mode, ruleRegistry, fallback?)`: asks `AgentSurvives` as above; `fallback()` when no
  rule answers (default: `true` for a caught check, `false` otherwise).
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
