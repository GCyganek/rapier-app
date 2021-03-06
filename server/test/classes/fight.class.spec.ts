import { Manager } from 'socket.io-client';
import { FightImpl } from '../../src/classes/fight.class';
import {
  FightEndConditionName,
  FightState,
} from '../../src/interfaces/fight.interface';
import { FightEndConditionFulfilledObserver } from '../../src/interfaces/observers/fight-end-condition-fulfilled-observer.interface';
import { JudgeRole } from '../../src/interfaces/join-response.interface';
import { PlayerColor } from '../../src/interfaces/event.interface';

describe('FightImpl', () => {
  let manager: Manager;

  const fight = new FightImpl(
    'mockup',
    'main',
    'red',
    'blue',
    'player1',
    'player2',
    new Map<FightEndConditionName, number>([
      [FightEndConditionName.EnoughPoints, 5],
      [FightEndConditionName.TimeEnded, 1],
    ]),
  );

  const fightWithoutEndConditions = new FightImpl(
    'mockup',
    'main',
    'red',
    'blue',
    'player1',
    'player2',
    new Map<FightEndConditionName, number>([]),
  );

  beforeAll(async () => {
    manager = new Manager('wss://localhost:3000');
  });

  afterAll(() => {
    for (const socket of [
      fight.blueJudge.socket,
      fight.redJudge.socket,
      fight.mainJudge.socket,
    ]) {
      if (socket != null) {
        socket.disconnect();
      }
    }
  });

  describe('constructor', () => {
    it('should create timer that is observed when fight has end time condition', () => {
      expect(fight.timer).toBeDefined();
      expect(fight.timer.endTimeObservers.length).toBe(1);
      expect(fight.timer.endTimeObservers[0]).toBe(fight);
    });

    it('should not create timer in fight without end time condition', () => {
      expect(fightWithoutEndConditions.timer).toBeUndefined();
    });
  });

  describe('getConditionWithName', () => {
    it('should return FightEndCondition', () => {
      expect(fight.endConditions.get(FightEndConditionName.EnoughPoints)).toBe(
        5,
      );
      expect(fight.endConditions.get(FightEndConditionName.TimeEnded)).toBe(1);
    });

    it('should return null when called on a fight with no end conditions', () => {
      expect(
        fightWithoutEndConditions.endConditions.get(
          FightEndConditionName.EnoughPoints,
        ),
      ).toBeUndefined();
      expect(
        fightWithoutEndConditions.endConditions.get(
          FightEndConditionName.TimeEnded,
        ),
      ).toBeUndefined();
    });
  });

  describe('judgeSocketAlreadyAssigned', () => {
    it('should return false on checking judge with random judgeId', () => {
      const socket = manager.socket('/');
      expect(
        fight.judgeSocketAlreadyAssigned('abc 123', socket as any),
      ).toBeFalsy();
      socket.disconnect();
    });

    it('should return false on checking already assigned judge with the same data as assigned', () => {
      const socket = manager.socket('/');
      fight.mainJudge.socket = socket as any;
      expect(
        fight.judgeSocketAlreadyAssigned(fight.mainJudge.id, socket as any),
      ).toBeFalsy();
      socket.disconnect();
    });

    it('should return false on checking already assigned judge, but with disconnected socket', () => {
      const anotherSocket = manager.socket('/anotherNsp');
      expect(
        fight.judgeSocketAlreadyAssigned(
          fight.mainJudge.id,
          anotherSocket as any,
        ),
      ).toBeFalsy();
      anotherSocket.disconnect();
    });
  });

  describe('allJudgesAssigned', () => {
    it('should return false when not all judges assigned', () => {
      fight.mainJudge.socket = null;
      expect(fight.allJudgesAssigned()).toBeFalsy();
      const socket = manager.socket('/');
      fight.mainJudge.socket = socket as any;
      expect(fight.allJudgesAssigned()).toBeFalsy();
      fight.redJudge.socket = socket as any;
      expect(fight.allJudgesAssigned()).toBeFalsy();
      socket.disconnect();
    });

    it('should return true when all judges assigned', () => {
      const socket = manager.socket('/');
      fight.blueJudge.socket = socket as any;
      expect(fight.allJudgesAssigned()).toBeTruthy();
      socket.disconnect();
    });
  });

  describe('inProgress', () => {
    it('should return true when fight paused or running', () => {
      fight.state = FightState.Running;
      expect(fight.inProgress()).toBeTruthy;
      fight.state = FightState.Paused;
      expect(fight.inProgress()).toBeTruthy;
    });

    it('should return false when fight scheduled or finished', () => {
      fight.state = FightState.Scheduled;
      expect(fight.inProgress()).toBeFalsy;
      fight.state = FightState.Finished;
      expect(fight.inProgress()).toBeFalsy;
    });
  });

  describe('isJudge', () => {
    it('should return true on proper judgeId', () => {
      expect(fight.isJudge(fight.mainJudge.id)).toBeTruthy();
      expect(fight.isJudge(fight.redJudge.id)).toBeTruthy();
      expect(fight.isJudge(fight.blueJudge.id)).toBeTruthy();
    });

    it('should return false on random judgeId', () => {
      expect(fight.isJudge('random123')).toBeFalsy();
    });
  });

  describe('isMainJudge', () => {
    it('should return true on main judge judgeId', () => {
      expect(fight.isMainJudge(fight.mainJudge.id)).toBeTruthy();
    });

    it('should return false on other judgeIds', () => {
      expect(fight.isMainJudge(fight.redJudge.id)).toBeFalsy();
      expect(fight.isMainJudge(fight.blueJudge.id)).toBeFalsy();
      expect(fight.isMainJudge('random123')).toBeFalsy();
    });
  });

  describe('getJudgeRole', () => {
    it('should return role on proper judgeId', () => {
      expect(fight.getJudgeRole(fight.mainJudge.id)).toBe(JudgeRole.MainJudge);
      expect(fight.getJudgeRole(fight.redJudge.id)).toBe(JudgeRole.RedJudge);
      expect(fight.getJudgeRole(fight.blueJudge.id)).toBe(JudgeRole.BlueJudge);
    });

    it('should return undefined on random judgeIds', () => {
      expect(fight.getJudgeRole('random123')).toBeUndefined();
    });
  });

  describe('getConnectedJudgesStatus', () => {
    it('should return empty map when no judges are connected', () => {
      fight.blueJudge.socket = null;
      fight.redJudge.socket = null;
      fight.mainJudge.socket = null;
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.BlueJudge),
      ).toBeFalsy();
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.MainJudge),
      ).toBeFalsy();
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.RedJudge),
      ).toBeFalsy();
    });

    it('map should contain only connected judges', () => {
      const socket = manager.socket('/');
      fight.blueJudge.socket = socket as any;
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.BlueJudge),
      ).toBeTruthy();
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.MainJudge),
      ).toBeFalsy();
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.RedJudge),
      ).toBeFalsy();

      fight.blueJudge.socket = null;
      fight.mainJudge.socket = socket as any;
      fight.redJudge.socket = socket as any;
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.BlueJudge),
      ).toBeFalsy();
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.MainJudge),
      ).toBeTruthy();
      expect(
        fight.getConnectedJudgesStatus().has(JudgeRole.RedJudge),
      ).toBeTruthy();
      socket.disconnect();
    });

    it('stored value should be connected judge type status', () => {
      const socket = manager.socket('/');
      fight.blueJudge.socket = socket as any;
      expect(
        fight.getConnectedJudgesStatus().get(JudgeRole.BlueJudge).socket,
      ).toBe(socket);
      expect(fight.getConnectedJudgesStatus().get(JudgeRole.BlueJudge).id).toBe(
        fight.blueJudgeId,
      );
      socket.disconnect();
    });
  });

  describe('startFight', () => {
    it('should start fight and timer when fight with end time condition', () => {
      const timeInMillis = Date.now();
      expect(fight.startFight(timeInMillis)).toBeTruthy();
      expect(fight.timer.timeoutSet).toBeTruthy();
      expect(fight.state).toBe(FightState.Running);
    });

    it('should start fight with no end time condition', () => {
      const timeInMillis = Date.now();
      expect(fightWithoutEndConditions.startFight(timeInMillis)).toBeTruthy();
      expect(fightWithoutEndConditions.state).toBe(FightState.Running);
    });
  });

  describe('pauseFight', () => {
    it('should pause fight and timer when fight with end time condition', () => {
      expect(fight.pauseFight(Date.now())).toBeTruthy();
      expect(fight.timer.timeoutSet()).toBeFalsy();
      expect(fight.state).toBe(FightState.Paused);
    });

    it('should pause fight with no end time condition', () => {
      expect(fightWithoutEndConditions.pauseFight(Date.now())).toBeTruthy();
      expect(fightWithoutEndConditions.state).toBe(FightState.Paused);
    });
  });

  describe('resumeFight', () => {
    it('should resume fight and timer when fight with end time condition', () => {
      const timeInMillis = Date.now();
      expect(fight.resumeFight(timeInMillis)).toBeTruthy();
      expect(fight.timer.timeoutSet()).toBeTruthy();
      expect(fight.state).toBe(FightState.Running);
    });

    it('should resume fight with no end time condition', () => {
      const timeInMillis = Date.now();
      expect(fightWithoutEndConditions.resumeFight(timeInMillis)).toBeTruthy();
      expect(fightWithoutEndConditions.state).toBe(FightState.Running);
    });
  });

  describe('finishFight', () => {
    it('should finish fight and timer when fight with end time condition', () => {
      fight.finishFight();
      expect(fight.timer.timeoutSet()).toBeFalsy();
      expect(fight.timer.hasTimeEnded()).toBeTruthy();
      expect(fight.state).toBe(FightState.Finished);
    });

    it('should finish fight with no end time condition', () => {
      fightWithoutEndConditions.finishFight();
      expect(fightWithoutEndConditions.state).toBe(FightState.Finished);
    });
  });

  describe('addNewEvents', () => {
    const redPlayerPoints = 2;
    const bluePlayerPoints = 1;

    const events = [
      { id: 'a', playerColor: PlayerColor.Red },
      { id: 'b', playerColor: PlayerColor.Blue },
      { id: 'a', playerColor: PlayerColor.Red },
    ];

    it('should not add events with negative number of points', () => {
      expect(fight.addNewEvents(events, -1, bluePlayerPoints)).toBeFalsy();
    });

    it('should add events with 0 > number of points', () => {
      expect(
        fight.addNewEvents(events, redPlayerPoints, bluePlayerPoints),
      ).toBeTruthy();
      expect(fight.redPlayer.points).toBe(redPlayerPoints);
      expect(fight.bluePlayer.points).toBe(bluePlayerPoints);
      expect(fight.eventsHistory).toStrictEqual(events);
      expect(
        fight.addNewEvents(events, redPlayerPoints, bluePlayerPoints),
      ).toBeTruthy();
      expect(fight.redPlayer.points).toBe(2 * redPlayerPoints);
      expect(fight.bluePlayer.points).toBe(2 * bluePlayerPoints);
      expect(fight.eventsHistory).toStrictEqual(events.concat(events));
    });
  });

  class MockFightEndConditionFulfilledObserver
    implements FightEndConditionFulfilledObserver
  {
    fightEndConditionFulfilled(
      condition: FightEndConditionName,
      fightReceived: FightImpl,
    ): void {
      expect(condition).toBe(FightEndConditionName.EnoughPoints);
      expect(fightReceived).toBe(fight);
      return;
    }
  }

  const mockFightEndConditionFulfilledObserver =
    new MockFightEndConditionFulfilledObserver();

  describe('addFightEndConditionFulfilledObserver', () => {
    it('should add observer to an empty observers list', () => {
      fight.addFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
      expect(fight.fightEndConditionFulfilledObservers.length).toBe(1);
    });

    it('should not add the same observer twice', () => {
      fight.addFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
      fight.addFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
      expect(fight.fightEndConditionFulfilledObservers.length).toBe(1);
    });

    it('should not add observer if there are no end conditions', () => {
      fightWithoutEndConditions.addFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
      expect(
        fightWithoutEndConditions.fightEndConditionFulfilledObservers.length,
      ).toBe(0);
    });
  });

  describe('removeFightEndConditionFulfilledObserver', () => {
    it('should remove observer from observers list', () => {
      fight.addFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
      expect(fight.fightEndConditionFulfilledObservers.length).toBe(1);
      fight.removeFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
      expect(fight.fightEndConditionFulfilledObservers.length).toBe(0);
    });
  });

  describe('checkIfEnoughPointsToEndFight', () => {
    let notifySpy, conditionFulfilledSpy;
    beforeAll(() => {
      notifySpy = jest.spyOn(fight, 'notifyFightEndConditionFulfilled');
      conditionFulfilledSpy = jest.spyOn(
        mockFightEndConditionFulfilledObserver,
        'fightEndConditionFulfilled',
      );
      fight.addFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
    });

    afterEach(() => {
      notifySpy.mockReset();
      conditionFulfilledSpy.mockReset();
    });

    describe('should call notifyFightEndConditionFulfilled()', () => {
      it('for red: 5 blue: 5 | pointsToEnd: 5 (plus should call fightEndConditionFulfilled() in observer)', () => {
        fight.bluePlayer.points = 5;
        fight.redPlayer.points = 5;
        fight.checkIfEnoughPointsToEndFight();
        expect(notifySpy).toBeCalledTimes(1);
        expect(conditionFulfilledSpy).toBeCalledTimes(1);
      });

      it('for red: 5 blue: 4 | pointsToEnd: 5', () => {
        fight.bluePlayer.points = 5;
        fight.redPlayer.points = 5;
        fight.checkIfEnoughPointsToEndFight();
        expect(notifySpy).toBeCalledTimes(0); // fight has fightEndAlreadyNotified on true now, will never notify again
        expect(conditionFulfilledSpy).toBeCalledTimes(0);
      });

      it('for red: 4 blue: 5 | pointsToEnd: 5', () => {
        fight.bluePlayer.points = 5;
        fight.redPlayer.points = 5;
        fight.checkIfEnoughPointsToEndFight();
        expect(notifySpy).toBeCalledTimes(0);
        expect(conditionFulfilledSpy).toBeCalledTimes(0);
      });
    });

    describe('should not call notifyFightEndConditionFulfilled()', () => {
      it('for red: 4 blue: 4 | pointsToEnd: 5', () => {
        fight.bluePlayer.points = 4;
        fight.redPlayer.points = 4;
        fight.checkIfEnoughPointsToEndFight();
        expect(notifySpy).toBeCalledTimes(0);
        expect(conditionFulfilledSpy).toBeCalledTimes(0);
      });
    });
  });
});
