import { Test } from '@nestjs/testing';
import { io } from 'socket.io-client';
import {
  FightEndConditionName,
  FightState,
} from '../../src/interfaces/fight.interface';
import { ResponseStatus } from '../../src/interfaces/response.interface';
import { JudgesGateway } from '../../src/gateways/judges.gateway';
import { FightsService } from '../../src/services/fights.service';
import { Timer } from '../../src/classes/timer.class';
import { INestApplication } from '@nestjs/common';
import { Event } from '../../src/interfaces/event.interface';
import { FightImpl } from '../../src/classes/fight.class';
import { Player } from '../../src/interfaces/player.interface';
import { PlayersService } from '../../src/services/players.service';
import { JudgesSocketEvents } from '../../src/interfaces/judges-socket-events.enum';
import { JudgeRole } from '../../src/interfaces/join-response.interface';

async function createNestApp(...providers): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: providers,
  }).compile();
  return testingModule.createNestApplication();
}

async function joinNewJudge(fightId: string, judgeId: string) {
  const ws = io('http://localhost:3001');

  ws.emit(JudgesSocketEvents.Join, {
    fightId: fightId,
    judgeId: judgeId,
  });

  await new Promise<void>((resolve) =>
    ws.on(JudgesSocketEvents.Join, (data) => {
      expect(data.status).toBe(ResponseStatus.OK);
      resolve();
    }),
  );

  return ws;
}

describe('JudgesGateway', () => {
  let app: INestApplication;
  let fight: FightImpl;
  let player1: Player;
  let player2: Player;
  let playersService: PlayersService;

  beforeAll(async () => {
    app = await createNestApp(JudgesGateway, FightsService, PlayersService);
    await app.listen(3001);

    fight = new FightImpl(
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

    player1 = {
      id: 'player1',
      firstName: 'Ala',
      lastName: 'Kowalska',
    };

    player2 = {
      id: 'player2',
      firstName: 'Jan',
      lastName: 'Kowalski',
    };
    playersService = app.get(PlayersService);
    app.get(FightsService).newFight(fight);
    playersService.newPlayer(player1);
    playersService.newPlayer(player2);
  });

  afterAll(() => {
    app.close();
  });

  describe('join', () => {
    let ws;

    it('should join fight as a main judge', async () => {
      ws = io('http://localhost:3001');
      ws.emit(JudgesSocketEvents.Join, {
        fightId: fight.id,
        judgeId: fight.mainJudge.id,
      });

      await new Promise<void>((resolve) =>
        ws.on(JudgesSocketEvents.Join, (data) => {
          expect(data.status).toBe(ResponseStatus.OK);
          expect(data.role).toBe(JudgeRole.MainJudge);
          expect(data.redPlayer).toStrictEqual(
            playersService.getPlayer(fight.redPlayer.id),
          );
          expect(data.bluePlayer).toStrictEqual(
            playersService.getPlayer(fight.bluePlayer.id),
          );
          resolve();
        }),
      );
    });

    it('should join fight as a red judge', async () => {
      ws = io('http://localhost:3001');
      ws.emit(JudgesSocketEvents.Join, {
        fightId: fight.id,
        judgeId: fight.redJudge.id,
      });

      await new Promise<void>((resolve) =>
        ws.on(JudgesSocketEvents.Join, (data) => {
          expect(data.status).toBe(ResponseStatus.OK);
          expect(data.role).toBe(JudgeRole.RedJudge);
          expect(data.redPlayer).toStrictEqual(
            playersService.getPlayer(fight.redPlayer.id),
          );
          expect(data.bluePlayer).toStrictEqual(
            playersService.getPlayer(fight.bluePlayer.id),
          );
          resolve();
        }),
      );
    });

    it('should not join fight as a random judge', async () => {
      ws = io('http://localhost:3001');
      ws.emit(JudgesSocketEvents.Join, {
        fightId: fight.id,
        judgeId: 'test 123',
      });

      await new Promise<void>((resolve) =>
        ws.on(JudgesSocketEvents.Join, (data) => {
          expect(data.status).toBe(ResponseStatus.Unauthorized);
          resolve();
        }),
      );
    });

    it('should not join to the other fight', async () => {
      ws = io('http://localhost:3001');
      ws.emit(JudgesSocketEvents.Join, {
        fightId: 'test 123',
        judgeId: fight.mainJudge.id,
      });

      await new Promise<void>((resolve) =>
        ws.on(JudgesSocketEvents.Join, (data) => {
          expect(data.status).toBe(ResponseStatus.NotFound);
          resolve();
        }),
      );
    });

    afterEach(() => ws.close());
  });

  describe('withJudgesSockets', () => {
    let wsMain, wsRed, wsBlue;

    beforeEach(async () => {
      fight.mainJudge.socket = null;
      wsMain = await joinNewJudge(fight.id, fight.mainJudge.id);
      fight.redJudge.socket = null;
      wsRed = await joinNewJudge(fight.id, fight.redJudge.id);
      fight.blueJudge.socket = null;
      wsBlue = await joinNewJudge(fight.id, fight.blueJudge.id);
    });

    afterEach(() => {
      wsMain.close();
      wsRed.close();
      wsBlue.close();
    });

    describe('startFight', () => {
      it('should not start random fight', async () => {
        wsMain.emit(JudgesSocketEvents.StartFight, {
          fightId: 'test 123',
          judgeId: fight.mainJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsMain.on(JudgesSocketEvents.StartFight, (data) => {
            expect(data.status).toBe(ResponseStatus.NotFound);
            resolve();
          }),
        );
      });

      it('should not start fight without all judges', async () => {
        fight.blueJudge.socket = null;

        wsMain.emit(JudgesSocketEvents.StartFight, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsMain.on(JudgesSocketEvents.StartFight, (data) => {
            expect(data.status).toBe(ResponseStatus.NotReady);
            resolve();
          }),
        );
      });

      it('should not start fight if not main judge', async () => {
        wsRed.emit(JudgesSocketEvents.StartFight, {
          fightId: fight.id,
          judgeId: fight.redJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsRed.on(JudgesSocketEvents.StartFight, (data) => {
            expect(data.status).toBe(ResponseStatus.Unauthorized);
            resolve();
          }),
        );
      });

      it('should start ready fight', async () => {
        wsMain.emit(JudgesSocketEvents.StartFight, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on(JudgesSocketEvents.StartFight, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }

        fight.timer.endTimer();
      });

      it('should not start finished fight', async () => {
        fight.state = FightState.Finished;

        wsMain.emit(JudgesSocketEvents.StartFight, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsMain.on(JudgesSocketEvents.StartFight, (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });
    });

    describe('finishFight', () => {
      it('should not finish random fight', async () => {
        wsMain.emit(JudgesSocketEvents.FinishFight, {
          fightId: 'test 123',
          judgeId: fight.mainJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsMain.on(JudgesSocketEvents.FinishFight, (data) => {
            expect(data.status).toBe(ResponseStatus.NotFound);
            resolve();
          }),
        );
      });

      it('should not finish not running fight', async () => {
        fight.state = FightState.Finished;

        wsMain.emit(JudgesSocketEvents.FinishFight, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsMain.on(JudgesSocketEvents.FinishFight, (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });

      it('should finish running fight', async () => {
        fight.state = FightState.Running;

        wsMain.emit(JudgesSocketEvents.FinishFight, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on(JudgesSocketEvents.FinishFight, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }
      });
    });

    describe('resumeTimer', () => {
      beforeEach(() => {
        fight.timer = new Timer(1, fight);
      });

      afterEach(() => {
        fight.timer.endTimer();
      });

      it('not main judge should not resume timer when it was paused before timer ended', async () => {
        fight.state = FightState.Paused;
        const exactPauseTimeInMillis = Date.now();
        fight.timer.pauseTimer(exactPauseTimeInMillis);

        wsRed.emit(JudgesSocketEvents.ResumeTimer, {
          fightId: fight.id,
          judgeId: fight.redJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsRed.on(JudgesSocketEvents.ResumeTimer, (data) => {
            expect(data.status).toBe(ResponseStatus.Unauthorized);
            resolve();
          }),
        );
      });

      it('main judge should resume timer when it was paused before timer ended', async () => {
        fight.state = FightState.Paused;
        const exactPauseTimeInMillis = Date.now();
        fight.timer.pauseTimer(exactPauseTimeInMillis);

        wsMain.emit(JudgesSocketEvents.ResumeTimer, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on(JudgesSocketEvents.ResumeTimer, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }
      });

      it('timer should not be resumed again when it is already running', async () => {
        fight.state = FightState.Running;

        wsMain.emit(JudgesSocketEvents.ResumeTimer, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        await new Promise<void>((resolve) =>
          wsMain.on(JudgesSocketEvents.ResumeTimer, (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });

      it('fight should be resumed even if fight time has already ended', async () => {
        fight.timer.endTimer();
        fight.state = FightState.Paused;

        wsMain.emit(JudgesSocketEvents.ResumeTimer, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on(JudgesSocketEvents.ResumeTimer, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }
      });
    });

    describe('pauseTimer', () => {
      beforeEach(() => {
        fight.timer = new Timer(1, fight);
      });

      afterEach(() => {
        fight.timer.endTimer();
      });

      it('not main judge should not pause timer when it is running before timer ended', async () => {
        fight.state = FightState.Running;
        const exactPauseTimeInMillis = Date.now();

        wsRed.emit(JudgesSocketEvents.PauseTimer, {
          fightId: fight.id,
          judgeId: fight.redJudge.id,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        await new Promise<void>((resolve) =>
          wsRed.on(JudgesSocketEvents.PauseTimer, (data) => {
            expect(data.status).toBe(ResponseStatus.Unauthorized);
            resolve();
          }),
        );
      });

      it('main judge should pause timer when it is running before timer ended', async () => {
        fight.state = FightState.Running;
        fight.timer.resumeTimer();
        const exactPauseTimeInMillis = Date.now();

        wsMain.emit(JudgesSocketEvents.PauseTimer, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on(JudgesSocketEvents.PauseTimer, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              expect(data.exactPauseTimeInMillis).toBe(exactPauseTimeInMillis);
              resolve();
            }),
          );
        }
      });

      it('timer should not be paused again when it is already paused', async () => {
        fight.state = FightState.Paused;
        const exactPauseTimeInMillis = Date.now();
        fight.timer.pauseTimer(exactPauseTimeInMillis);

        wsMain.emit(JudgesSocketEvents.PauseTimer, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        await new Promise<void>((resolve) =>
          wsMain.on(JudgesSocketEvents.PauseTimer, (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });

      it('fight should be paused even if fight time has already ended', async () => {
        fight.state = FightState.Running;
        fight.timer.endTimer();
        const exactPauseTimeInMillis = Date.now();

        wsMain.emit(JudgesSocketEvents.PauseTimer, {
          fightId: fight.id,
          judgeId: fight.mainJudge.id,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on(JudgesSocketEvents.PauseTimer, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              expect(data.exactPauseTimeInMillis).toBe(exactPauseTimeInMillis);
              resolve();
            }),
          );
        }
      });
    });

    describe('events handling', () => {
      let events: Event[];
      let redPlayerPoints: number;
      let bluePlayerPoints: number;

      beforeEach(() => {
        redPlayerPoints = 2;
        bluePlayerPoints = 1;

        events = [
          { id: 'a', playerColor: 'red' },
          { id: 'b', playerColor: 'blue' },
          { id: 'a', playerColor: 'red' },
        ];
      });

      describe('newEvents', () => {
        it('should not add events to random fight', async () => {
          wsMain.emit(JudgesSocketEvents.NewEvents, {
            fightId: 'test 123',
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.NewEvents, (data) => {
              expect(data.status).toBe(ResponseStatus.NotFound);
              resolve();
            }),
          );
        });

        it('should not add events when not main judge', async () => {
          wsMain.emit(JudgesSocketEvents.NewEvents, {
            fightId: fight.id,
            judgeId: fight.redJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.NewEvents, (data) => {
              expect(data.status).toBe(ResponseStatus.Unauthorized);
              resolve();
            }),
          );
        });

        it('should not add events with negative number of points', async () => {
          wsMain.emit(JudgesSocketEvents.NewEvents, {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: -1,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.NewEvents, (data) => {
              expect(data.status).toBe(ResponseStatus.BadRequest);
              resolve();
            }),
          );
        });

        it('should add events to started fight', async () => {
          fight.state = FightState.Running;

          wsMain.emit(JudgesSocketEvents.NewEvents, {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.NewEvents, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              expect(fight.redPlayer.points).toBe(2);
              expect(fight.bluePlayer.points).toBe(1);
              expect(fight.eventsHistory).toStrictEqual(events);
              resolve();
            }),
          );
        });

        it('should add events to paused fight', async () => {
          wsMain.emit('pauseFight', {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
          });

          wsMain.emit(JudgesSocketEvents.NewEvents, {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.NewEvents, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              expect(fight.redPlayer.points).toBe(2 + 2);
              expect(fight.bluePlayer.points).toBe(1 + 1);
              expect(fight.eventsHistory).toStrictEqual(events.concat(events));
              resolve();
            }),
          );
        });

        it('should not add events to finished fight', async () => {
          wsMain.emit(JudgesSocketEvents.FinishFight, {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
          });

          wsMain.emit(JudgesSocketEvents.NewEvents, {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.NewEvents, (data) => {
              expect(data.status).toBe(ResponseStatus.BadRequest);
              resolve();
            }),
          );
        });

        it('should add events to started fight and send back fightEndConditionFulfilled', async () => {
          fight.state = FightState.Running;

          wsMain.emit(JudgesSocketEvents.NewEvents, {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints, // now will have 6 points > fight.pointsToEnd
            bluePlayerPoints: bluePlayerPoints,
          });

          for (const ws of [wsMain, wsRed, wsBlue]) {
            await new Promise<void>((resolve) =>
              ws.on(JudgesSocketEvents.FightEndConditionFulfilled, (data) => {
                expect(data.status).toBe(ResponseStatus.OK);
                expect(data.conditionName).toBe(
                  FightEndConditionName.EnoughPoints,
                );
                resolve();
              }),
            );
          }
        });
      });

      describe('eventsSuggestion', () => {
        it('should not suggest events to random fight', async () => {
          wsBlue.emit(JudgesSocketEvents.EventsSuggestion, {
            fightId: 'test 123',
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsBlue.on(JudgesSocketEvents.EventsSuggestion, (data) => {
              expect(data.status).toBe(ResponseStatus.NotFound);
              resolve();
            }),
          );
        });

        it('should not suggest events when main judge', async () => {
          wsMain.emit(JudgesSocketEvents.EventsSuggestion, {
            fightId: fight.id,
            judgeId: fight.mainJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.EventsSuggestion, (data) => {
              expect(data.status).toBe(ResponseStatus.Unauthorized);
              resolve();
            }),
          );
        });

        it('should not suggest events with negative number of points', async () => {
          wsBlue.emit(JudgesSocketEvents.EventsSuggestion, {
            fightId: fight.id,
            judgeId: fight.blueJudge.id,
            events: events,
            redPlayerPoints: -1,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsBlue.on(JudgesSocketEvents.EventsSuggestion, (data) => {
              expect(data.status).toBe(ResponseStatus.BadRequest);
              resolve();
            }),
          );
        });

        it('should not suggest events to scheduled', async () => {
          fight.state = FightState.Scheduled;

          wsBlue.emit(JudgesSocketEvents.EventsSuggestion, {
            fightId: fight.id,
            judgeId: fight.blueJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsBlue.on(JudgesSocketEvents.EventsSuggestion, (data) => {
              expect(data.status).toBe(ResponseStatus.BadRequest);
              resolve();
            }),
          );
        });

        it('should not suggest events to finished fight', async () => {
          fight.state = FightState.Finished;

          wsBlue.emit(JudgesSocketEvents.EventsSuggestion, {
            fightId: fight.id,
            judgeId: fight.blueJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsBlue.on(JudgesSocketEvents.EventsSuggestion, (data) => {
              expect(data.status).toBe(ResponseStatus.BadRequest);
              resolve();
            }),
          );
        });

        const correctEventsSuggestionEmitAndCheck = async () => {
          wsBlue.emit(JudgesSocketEvents.EventsSuggestion, {
            fightId: fight.id,
            judgeId: fight.blueJudge.id,
            events: events,
            redPlayerPoints: redPlayerPoints,
            bluePlayerPoints: bluePlayerPoints,
          });

          await new Promise<void>((resolve) =>
            wsBlue.on(JudgesSocketEvents.EventsSuggestion, (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );

          await new Promise<void>((resolve) =>
            wsMain.on(JudgesSocketEvents.EventsSuggestion, (data) => {
              expect(data.judgeColor).toBe('blue');
              expect(data.events).toStrictEqual(events);
              expect(data.redPlayerPoints).toBe(redPlayerPoints);
              expect(data.bluePlayerPoints).toBe(bluePlayerPoints);
              resolve();
            }),
          );
        };

        it('should be able to suggest events to running fight', async () => {
          fight.state = FightState.Running;
          await correctEventsSuggestionEmitAndCheck();
        });

        it('should be able to suggest events to paused fight', async () => {
          fight.state = FightState.Paused;
          await correctEventsSuggestionEmitAndCheck();
        });
      });
    });
  });
});
