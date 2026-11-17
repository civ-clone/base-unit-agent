import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Processed whenever a mission destroys its agent, just before it does: `caught` when it was caught before the mission
 * (an `AgentSurvives` caught check said no), otherwise after it (it was used up, or failed to escape). `City` is the
 * mission's city, or `null` for a mission against a unit. A rule set raises its incidents here. With no rules, nothing
 * happens but the destruction.
 */
export class AgentLost extends Rule<
  [Unit, City | null, Action, boolean],
  void
> {}

export default AgentLost;
