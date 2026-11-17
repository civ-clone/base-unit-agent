import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * The mission a computer player's agent, `unit`, would choose at `city`, by the name of the rule set's action row (such
 * as `'steal-technology'`), for an AI client to read. Ask it once each time the agent is about to enter the city: a rule
 * may draw random numbers, as the original's choice does. With no rules (or no answer), the client chooses for itself.
 */
export class MissionChoice extends Rule<[Unit, City], string | undefined> {}

export default MissionChoice;
