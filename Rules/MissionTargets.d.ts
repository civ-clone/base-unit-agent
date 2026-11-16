import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * What `unit` may choose to aim `mission` at in `city`, such as the advances it may steal or the buildings it may
 * sabotage. Each rule answers a list, and the lists are joined. With no answer, the mission offers no choice and picks
 * its target as it always has.
 */
export declare class MissionTargets extends Rule<
  [Unit, City, Action],
  unknown[]
> {}
export default MissionTargets;
