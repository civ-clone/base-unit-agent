import {
  CAUGHT_CHECK,
  EscapeMode,
  HARD,
  ORDINARY,
  escape,
  escapeOdds,
  nearestCity,
  rollEscape,
} from '../lib/escape';
import {
  agentSurvives,
  chosenTarget,
  loseAgent,
  missionDetected,
  missionMode,
  missionTargets,
  targetName,
} from '../lib/mission';
import AgentLost from '../Rules/AgentLost';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import MissionMode from '../Rules/MissionMode';
import distanceFromPalace, { palaceTiles } from '../lib/distanceFromPalace';
import AgentSurvives from '../Rules/AgentSurvives';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import MissionDetected from '../Rules/MissionDetected';
import MissionTargets from '../Rules/MissionTargets';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Player from '@civ-clone/core-player/Player';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import PlayerTreasuryRegistry from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import World from '@civ-clone/core-world/World';
import Yield from '@civ-clone/core-yield/Yield';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import TransportManifest from '@civ-clone/core-unit-transport/TransportManifest';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import { expect } from 'chai';
import pay from '../lib/pay';

// A row of tiles, each a neighbour of the next.
class RowTile extends Tile {
  isNeighbourOf(other: Tile): boolean {
    return other !== this && Math.abs(other.x() - this.x()) <= 1;
  }

  distanceFrom(other: Tile): number {
    return Math.abs(other.x() - this.x());
  }
}

class Spy extends Unit {}
class Mission extends UnitAction {}
class Gold extends Yield {}
class Palace extends CityImprovement {}
class Temple extends CityImprovement {}

const rolls = (values: number[]): (() => number) & { left: number[] } => {
  const queue = [...values],
    draw = (): number => {
      const roll = queue.shift();

      if (roll === undefined) {
        throw new Error('Drew more numbers than expected.');
      }

      return roll;
    };

  return Object.assign(draw, { left: queue });
};

const setUp = () => {
  const ruleRegistry = new RuleRegistry(),
    cities: City[] = [],
    cityRegistry = {
      getByPlayer: (player: Player): City[] =>
        cities.filter((city: City): boolean => city.player() === player),
    } as unknown as CityRegistry,
    tile = (x: number): Tile =>
      new RowTile(x, 0, new Terrain(), null as unknown as World, ruleRegistry),
    city = (on: Tile, owner: Player): City => {
      const city = {
        player: (): Player => owner,
        tile: (): Tile => on,
      } as unknown as City;

      cities.push(city);

      return city;
    },
    player = new Player(),
    enemy = new Player(),
    from = tile(10),
    spy = new Spy(null, player, from, ruleRegistry),
    mission = new Mission(from, tile(11), spy, ruleRegistry),
    moved: [Unit, UnitAction][] = [];

  ruleRegistry.register(
    new Moved(
      new Effect((unit: Unit, action: UnitAction): void => {
        moved.push([unit, action]);
      })
    )
  );

  spy.moves().set(3);

  return {
    city,
    cityRegistry,
    enemy,
    from,
    mission,
    moved,
    player,
    ruleRegistry,
    spy,
    tile,
  };
};

describe('escapeOdds', (): void => {
  // `spy_try_escape`: `(mission_mode < 0) + 2`, doubled for a veteran, halved for mode 1.
  it('is 3 / 6 for a caught check, 2 / 4 ordinarily and 1 / 2 for a hard escape', (): void => {
    expect(escapeOdds(CAUGHT_CHECK, false)).to.equal(3);
    expect(escapeOdds(CAUGHT_CHECK, true)).to.equal(6);
    expect(escapeOdds(ORDINARY, false)).to.equal(2);
    expect(escapeOdds(ORDINARY, true)).to.equal(4);
    expect(escapeOdds(HARD, false)).to.equal(1);
    expect(escapeOdds(HARD, true)).to.equal(2);
  });
});

describe('rollEscape', (): void => {
  it('escapes on a roll that is not 0', (): void => {
    const escapes = rolls([0.5]),
      caught = rolls([0.4]);

    expect(rollEscape(2, escapes)).to.true;
    expect(rollEscape(2, caught)).to.false;
    expect(escapes.left).to.deep.equal([]);
    expect(caught.left).to.deep.equal([]);
  });

  it('flips a coin first for odds below 2, and draws nothing more at 1', (): void => {
    const flipped = rolls([0.4, 0.6]),
      unflipped = rolls([0.7]);

    expect(rollEscape(1, flipped)).to.true;
    expect(rollEscape(1, unflipped)).to.false;
    expect(flipped.left).to.deep.equal([]);
    expect(unflipped.left).to.deep.equal([]);
  });
});

describe('nearestCity', (): void => {
  it("is the unit's player's nearest city, the first of a tie, or null", (): void => {
    const { city, cityRegistry, enemy, player, spy, tile } = setUp();

    expect(nearestCity(spy, cityRegistry)).to.null;

    city(tile(10), enemy);
    const near = city(tile(13), player);
    city(tile(7), player);
    city(tile(0), player);

    expect(nearestCity(spy, cityRegistry)).to.equal(near);
  });
});

describe('escape', (): void => {
  it("sends an agent that escapes to its player's nearest city, with no moves, and runs `Moved`", (): void => {
    const {
        city,
        cityRegistry,
        mission,
        moved,
        player,
        ruleRegistry,
        spy,
        tile,
      } = setUp(),
      home = city(tile(12), player),
      escapedTo: [Unit, City | null, EscapeMode][] = [];

    expect(
      escape(spy, ORDINARY, {
        action: mission,
        cityRegistry,
        escaped: (unit, city, mode): void => {
          escapedTo.push([unit, city, mode]);
        },
        missionCost: 1,
        randomNumberGenerator: rolls([0.6]),
        ruleRegistry,
      })
    ).to.true;
    expect(spy.tile()).to.equal(home.tile());
    expect(spy.moves().value()).to.equal(0);
    expect(spy.active()).to.false;
    expect(moved).to.deep.equal([[spy, mission]]);
    expect(escapedTo).to.deep.equal([[spy, home, ORDINARY]]);
  });

  it('takes an agent aboard a transport off it when it escapes to a city, a caught check too (`unit_relocate`)', (): void => {
    const {
        city,
        cityRegistry,
        from,
        mission,
        player,
        ruleRegistry,
        spy,
        tile,
      } = setUp(),
      home = city(tile(12), player),
      transportRegistry = new TransportRegistry(),
      unloaded: Unit[] = [],
      ship = {
        tile: (): Tile => from,
        unload: (unit: Unit): boolean => {
          transportRegistry.unregister(transportRegistry.getByUnit(unit));
          unloaded.push(unit);

          return true;
        },
      } as unknown as ITransport,
      board = (): void => {
        transportRegistry.register(new TransportManifest(ship, spy, from));
        spy.setBusy({} as never);
        spy.setTile(from);
      };

    board();
    expect(
      escape(spy, ORDINARY, {
        action: mission,
        cityRegistry,
        randomNumberGenerator: rolls([0.6]),
        ruleRegistry,
        transportRegistry,
      })
    ).to.true;
    expect(spy.tile()).to.equal(home.tile());
    expect(transportRegistry.hasUnit(spy)).to.false;
    expect(spy.busy()).to.null;

    board();
    expect(
      escape(spy, CAUGHT_CHECK, {
        action: mission,
        cityRegistry,
        randomNumberGenerator: rolls([0.5]),
        relocates: true,
        ruleRegistry,
        transportRegistry,
      })
    ).to.true;
    expect(transportRegistry.hasUnit(spy)).to.false;
    expect(unloaded).to.deep.equal([spy, spy]);

    // One that escapes with no city to go to stays aboard.
    const alone = setUp(),
      aloneRegistry = new TransportRegistry();

    aloneRegistry.register(new TransportManifest(ship, alone.spy, alone.from));
    escape(alone.spy, ORDINARY, {
      cityRegistry: alone.cityRegistry,
      randomNumberGenerator: rolls([0.6]),
      ruleRegistry: alone.ruleRegistry,
      transportRegistry: aloneRegistry,
    });
    expect(aloneRegistry.hasUnit(alone.spy)).to.true;
  });

  it('charges the mission cost and leaves a caught agent where it is, for the mission to destroy', (): void => {
    const { city, cityRegistry, from, player, spy, tile } = setUp();

    city(tile(12), player);

    expect(
      escape(spy, ORDINARY, {
        cityRegistry,
        missionCost: 1,
        randomNumberGenerator: rolls([0.2]),
      })
    ).to.false;
    expect(spy.tile()).to.equal(from);
    expect(spy.moves().value()).to.equal(2);
    expect(spy.destroyed()).to.false;
  });

  it('costs nothing, moves nothing and promotes nothing for a caught check, at odds 3', (): void => {
    const { city, cityRegistry, from, player, spy, tile } = setUp(),
      escaped: Unit[] = [];

    city(tile(12), player);

    expect(
      escape(spy, CAUGHT_CHECK, {
        cityRegistry,
        escaped: (unit: Unit): void => {
          escaped.push(unit);
        },
        missionCost: 1,
        randomNumberGenerator: rolls([0.34]),
      })
    ).to.true;
    expect(escaped).to.deep.equal([]);
    expect(
      escape(spy, CAUGHT_CHECK, {
        cityRegistry,
        randomNumberGenerator: rolls([0.33]),
      })
    ).to.false;
    expect(spy.tile()).to.equal(from);
    expect(spy.moves().value()).to.equal(3);
  });

  it('takes its odds from `odds`', (): void => {
    const { cityRegistry, spy } = setUp(),
      veteran = (unit: Unit, mode: EscapeMode): number =>
        escapeOdds(mode, true);

    // Hard, veteran: 2, so 0.5 escapes; not a veteran: 1, a coin flip that fails, no roll.
    expect(
      escape(spy, HARD, {
        cityRegistry,
        odds: veteran,
        randomNumberGenerator: rolls([0.5]),
      })
    ).to.true;
    expect(
      escape(spy, HARD, {
        cityRegistry,
        randomNumberGenerator: rolls([0.5]),
      })
    ).to.false;
  });
});

describe('agentSurvives', (): void => {
  it('passes a caught check and uses the agent up after a mission when no rule answers, drawing nothing', (): void => {
    const { mission, ruleRegistry, spy } = setUp();

    expect(agentSurvives(spy, mission, CAUGHT_CHECK, ruleRegistry)).to.true;
    expect(agentSurvives(spy, mission, ORDINARY, ruleRegistry)).to.false;
    expect(agentSurvives(spy, mission, HARD, ruleRegistry)).to.false;
  });

  it("uses the mission's own fallback when no rule answers", (): void => {
    const { mission, ruleRegistry, spy } = setUp();

    expect(agentSurvives(spy, mission, ORDINARY, ruleRegistry, () => true)).to
      .true;
  });

  it('survives when every rule that answers says so, and passes the resolved mode', (): void => {
    const { mission, ruleRegistry, spy } = setUp(),
      asked: [Unit, UnitAction, EscapeMode, EscapeMode][] = [];

    ruleRegistry.register(
      new AgentSurvives(
        new Effect(
          (
            unit: Unit,
            action: UnitAction,
            mode: EscapeMode,
            resolved: EscapeMode
          ) => {
            asked.push([unit, action, mode, resolved]);

            return true;
          }
        )
      ),
      new AgentSurvives(
        new Criterion(
          (unit: Unit, action: UnitAction, mode: EscapeMode): boolean =>
            mode === HARD
        ),
        new Effect((): boolean => false)
      )
    );

    expect(agentSurvives(spy, mission, ORDINARY, ruleRegistry)).to.true;
    expect(agentSurvives(spy, mission, HARD, ruleRegistry)).to.false;
    expect(
      agentSurvives(spy, mission, CAUGHT_CHECK, ruleRegistry, undefined, HARD)
    ).to.true;
    expect(asked).to.deep.equal([
      [spy, mission, ORDINARY, ORDINARY],
      [spy, mission, HARD, HARD],
      [spy, mission, CAUGHT_CHECK, HARD],
    ]);
  });

  it('counts an undefined answer as no', (): void => {
    const { mission, ruleRegistry, spy } = setUp();

    ruleRegistry.register(
      new AgentSurvives(new Effect((): boolean => undefined as never))
    );

    expect(agentSurvives(spy, mission, CAUGHT_CHECK, ruleRegistry)).to.false;
  });
});

describe('missionMode', (): void => {
  it('is the default with no rules, and the first answer otherwise', (): void => {
    const { mission, ruleRegistry, spy } = setUp(),
      asked: EscapeMode[] = [];

    expect(missionMode(spy, mission, ORDINARY, ruleRegistry)).to.equal(
      ORDINARY
    );

    ruleRegistry.register(
      new MissionMode(
        new Effect(
          (unit: Unit, action: UnitAction, defaultMode: EscapeMode) => {
            asked.push(defaultMode);

            return HARD;
          }
        )
      )
    );

    expect(missionMode(spy, mission, ORDINARY, ruleRegistry)).to.equal(HARD);
    expect(asked).to.deep.equal([ORDINARY]);
  });

  it('passes over an answer that is not ORDINARY or HARD', (): void => {
    const { mission, ruleRegistry, spy } = setUp();

    ruleRegistry.register(
      new MissionMode(new Effect(() => undefined as never)),
      new MissionMode(new Effect(() => CAUGHT_CHECK as never))
    );

    expect(missionMode(spy, mission, HARD, ruleRegistry)).to.equal(HARD);

    ruleRegistry.register(new MissionMode(new Effect(() => ORDINARY)));

    expect(missionMode(spy, mission, HARD, ruleRegistry)).to.equal(ORDINARY);
  });
});

describe('loseAgent', (): void => {
  it('runs the `AgentLost` rules, then destroys the agent, by whoever is given', (): void => {
    const { enemy, mission, ruleRegistry, spy } = setUp(),
      log: string[] = [],
      city = {} as City;

    ruleRegistry.register(
      new AgentLost(
        new Effect(
          (
            unit: Unit,
            at: City | null,
            action: UnitAction,
            caught: boolean
          ) => {
            log.push(
              `lost ${unit === spy} ${at === city} ${
                action === mission
              } ${caught}`
            );
          }
        )
      ),
      new Destroyed(
        new Effect((unit: Unit, by: Player | null): void => {
          log.push(`destroyed ${unit === spy} ${by === enemy ? 'enemy' : by}`);
        })
      )
    );

    loseAgent(spy, city, mission, true, ruleRegistry, enemy);
    loseAgent(spy, null, mission, false, ruleRegistry);

    expect(log).to.deep.equal([
      'lost true true true true',
      'destroyed true enemy',
      'lost true false true false',
      'destroyed true null',
    ]);
  });
});

describe('missionTargets, chosenTarget and targetName', (): void => {
  it('is empty with no rules, so any choice is ignored', (): void => {
    const { mission, ruleRegistry, spy } = setUp(),
      city = {} as City;

    expect(missionTargets(spy, city, mission, ruleRegistry)).to.deep.equal([]);
    expect(chosenTarget('Temple', [])).to.undefined;
  });

  it("joins the rules' lists, and finds a choice by itself or by its name", (): void => {
    const { mission, ruleRegistry, spy } = setUp(),
      city = {} as City,
      temple = new Temple(city);

    ruleRegistry.register(
      new MissionTargets(new Effect((): unknown[] => [Palace, 'production'])),
      new MissionTargets(new Effect((): unknown[] => [temple]))
    );

    const targets = missionTargets(spy, city, mission, ruleRegistry);

    expect(targets).to.deep.equal([Palace, 'production', temple]);
    expect(targets.map(targetName)).to.deep.equal([
      'Palace',
      'production',
      'Temple',
    ]);
    expect(chosenTarget('Palace', targets)).to.equal(Palace);
    expect(chosenTarget(Palace, targets)).to.equal(Palace);
    expect(chosenTarget('Temple', targets)).to.equal(temple);
    expect(chosenTarget('production', targets)).to.equal('production');
    expect(chosenTarget('Barracks', targets)).to.undefined;
    expect(chosenTarget(Temple, targets)).to.undefined;
    expect(chosenTarget(undefined, targets)).to.undefined;
  });
});

describe('missionDetected', (): void => {
  it('is false with no rules, and true when any rule says so', (): void => {
    const { mission, ruleRegistry, spy } = setUp(),
      city = {} as City;

    expect(missionDetected(spy, city, mission, ruleRegistry)).to.false;

    ruleRegistry.register(
      new MissionDetected(new Effect((): boolean => false)),
      new MissionDetected(new Effect((): boolean => true))
    );

    expect(missionDetected(spy, city, mission, ruleRegistry)).to.true;
  });
});

describe('distanceFromPalace and palaceTiles', (): void => {
  it("is the distance from the nearest of a player's standing palaces, capped, and the cap with none", (): void => {
    const { enemy, player, ruleRegistry, tile } = setUp(),
      registry = new CityImprovementRegistry(),
      cityOn = (x: number, owner: Player): City =>
        ({ player: () => owner, tile: () => tile(x) } as unknown as City),
      near = new Palace(cityOn(5, player), ruleRegistry),
      far = new Palace(cityOn(40, player), ruleRegistry),
      destroyed = new Palace(cityOn(9, player), ruleRegistry),
      theirs = new Palace(cityOn(10, enemy), ruleRegistry),
      temple = new Temple(cityOn(10, player), ruleRegistry),
      isPalace = (improvement: CityImprovement): boolean =>
        improvement instanceof Palace,
      distance = (palace: Tile, to: Tile): number => palace.distanceFrom(to);

    registry.register(near, far, destroyed, theirs, temple);
    destroyed.destroy();

    const palaces = palaceTiles(player, isPalace, registry);

    expect(palaces.map((palace: Tile): number => palace.x())).to.deep.equal([
      5, 40,
    ]);
    expect(distanceFromPalace(palaces, tile(10), distance)).to.equal(5);
    expect(distanceFromPalace(palaces, tile(30), distance)).to.equal(10);
    expect(distanceFromPalace(palaces, tile(25), distance, 8)).to.equal(8);
    expect(distanceFromPalace([], tile(10), distance)).to.equal(16);
  });
});

describe('pay', (): void => {
  it('pays from the treasury when it holds enough, and refuses otherwise', (): void => {
    const { player, ruleRegistry } = setUp(),
      registry = new PlayerTreasuryRegistry(),
      treasury = new PlayerTreasury(player, Gold, undefined, ruleRegistry);

    registry.register(treasury);
    treasury.add(50);

    expect(pay(player, 30, Gold, registry)).to.true;
    expect(treasury.value()).to.equal(20);
    expect(pay(player, 30, Gold, registry)).to.false;
    expect(treasury.value()).to.equal(20);
    expect(pay(player, 20, Gold, registry)).to.true;
    expect(treasury.value()).to.equal(0);
  });
});
