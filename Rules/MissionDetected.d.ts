import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Whether `city`'s defenders detect `unit` carrying out `mission` (counter-espionage). Detected when any rule says so;
 * with no rules, nothing is ever detected. The mission decides what detection does.
 */
export declare class MissionDetected extends Rule<
  [Unit, City, Action],
  boolean
> {}
export default MissionDetected;
