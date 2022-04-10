import { Test } from '@nestjs/testing';
import { io } from 'socket.io-client';
import { Fight, FightState } from '../../src/interfaces/fight.interface';
import { ResponseStatus } from '../../src/interfaces/response.interface';
import { JudgesGateway } from '../../src/gateways/judges.gateway';
import { FightsService } from '../../src/services/fights.service';
import { Timer } from '../../src/classes/timer/timer.class';
import { INestApplication } from '@nestjs/common';

async function createNestApp(...providers): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: providers,
  }).compile();
  return testingModule.createNestApplication();
}

async function joinNewJudge(fightId: string, judgeId: string) {
  const ws = io('http://localhost:3001');

  ws.emit('join', {
    fightId: fightId,
    judgeId: judgeId,
  });

  await new Promise<void>((resolve) =>
    ws.on('join', (data) => {
      expect(data.status).toBe(ResponseStatus.OK);
      resolve();
    }),
  );

  return ws;
}

describe('JudgesGateway', () => {
  let app: INestApplication;
  let fight: Fight;

  beforeAll(async () => {
    app = await createNestApp(JudgesGateway, FightsService);
    await app.listen(3001);

    fight = {
      id: 'mockup',
      state: FightState.Scheduled,

      mainJudgeId: 'main',
      redJudgeId: 'red',
      blueJudgeId: 'blue',

      mainJudgeSocket: null,
      redJudgeSocket: null,
      blueJudgeSocket: null,

      redPlayerId: 'player1',
      bluePlayerId: 'player2',

      redEventsHistory: [],
      blueEventsHistory: [],

      timer: new Timer(1),
    };

    app.get(FightsService).newFight(fight);
  });

  afterAll(() => {
    app.close();
  });

  describe('join', () => {
    let ws;

    it('should join fight as a main judge', async () => {
      ws = io('http://localhost:3001');
      ws.emit('join', {
        fightId: fight.id,
        judgeId: fight.mainJudgeId,
      });

      await new Promise<void>((resolve) =>
        ws.on('join', (data) => {
          expect(data.status).toBe(ResponseStatus.OK);
          resolve();
        }),
      );
    });

    it('should join fight as a red judge', async () => {
      ws = io('http://localhost:3001');
      ws.emit('join', {
        fightId: fight.id,
        judgeId: fight.redJudgeId,
      });

      await new Promise<void>((resolve) =>
        ws.on('join', (data) => {
          expect(data.status).toBe(ResponseStatus.OK);
          resolve();
        }),
      );
    });

    it('should not join fight as a random judge', async () => {
      ws = io('http://localhost:3001');
      ws.emit('join', {
        fightId: fight.id,
        judgeId: 'test 123',
      });

      await new Promise<void>((resolve) =>
        ws.on('join', (data) => {
          expect(data.status).toBe(ResponseStatus.Unauthorized);
          resolve();
        }),
      );
    });

    it('should not join to the other fight', async () => {
      ws = io('http://localhost:3001');
      ws.emit('join', {
        fightId: 'test 123',
        judgeId: fight.mainJudgeId,
      });

      await new Promise<void>((resolve) =>
        ws.on('join', (data) => {
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
      fight.mainJudgeSocket = null;
      wsMain = await joinNewJudge(fight.id, fight.mainJudgeId);
      fight.redJudgeSocket = null;
      wsRed = await joinNewJudge(fight.id, fight.redJudgeId);
      fight.blueJudgeSocket = null;
      wsBlue = await joinNewJudge(fight.id, fight.blueJudgeId);
    });

    afterEach(() => {
      wsMain.close();
      wsRed.close();
      wsBlue.close();
    });

    describe('startFight', () => {
      it('should not start random fight', async () => {
        wsMain.emit('startFight', {
          fightId: 'test 123',
          judgeId: fight.mainJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsMain.on('startFight', (data) => {
            expect(data.status).toBe(ResponseStatus.NotFound);
            resolve();
          }),
        );
      });

      it('should not start fight without all judges', async () => {
        fight.blueJudgeSocket = null;

        wsMain.emit('startFight', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsMain.on('startFight', (data) => {
            expect(data.status).toBe(ResponseStatus.NotReady);
            resolve();
          }),
        );
      });

      it('should not start fight if not main judge', async () => {
        wsRed.emit('startFight', {
          fightId: fight.id,
          judgeId: fight.redJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsRed.on('startFight', (data) => {
            expect(data.status).toBe(ResponseStatus.Unauthorized);
            resolve();
          }),
        );
      });

      it('should start ready fight', async () => {
        wsMain.emit('startFight', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on('startFight', (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }

        fight.timer.endTimer();
      });

      it('should not start not running fight', async () => {
        fight.state = FightState.Finished;

        wsMain.emit('startFight', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsMain.on('startFight', (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });
    });

    describe('finishFight', () => {
      it('should not finish random fight', async () => {
        wsMain.emit('finishFight', {
          fightId: 'test 123',
          judgeId: fight.mainJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsMain.on('finishFight', (data) => {
            expect(data.status).toBe(ResponseStatus.NotFound);
            resolve();
          }),
        );
      });

      it('should not finish not running fight', async () => {
        fight.state = FightState.Finished;

        wsMain.emit('finishFight', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsMain.on('finishFight', (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });

      it('should finish running fight', async () => {
        fight.state = FightState.Running;

        wsMain.emit('finishFight', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on('finishFight', (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }
      });
    });

    describe('resumeTimer', () => {
      beforeEach(() => {
        fight.timer = new Timer(1);
      });

      afterEach(() => {
        fight.timer.endTimer();
      });

      it('not main judge should not resume timer when it was paused before timer ended', async () => {
        fight.state = FightState.Paused;
        const exactPauseTimeInMillis = Date.now();
        fight.timer.pauseTimer(exactPauseTimeInMillis);

        wsRed.emit('resumeTimer', {
          fightId: fight.id,
          judgeId: fight.redJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsRed.on('resumeTimer', (data) => {
            expect(data.status).toBe(ResponseStatus.Unauthorized);
            resolve();
          }),
        );
      });

      it('main judge should resume timer when it was paused before timer ended', async () => {
        fight.state = FightState.Paused;
        const exactPauseTimeInMillis = Date.now();
        fight.timer.pauseTimer(exactPauseTimeInMillis);

        wsMain.emit('resumeTimer', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on('resumeTimer', (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }
      });

      it('timer should not be resumed again when it is already running', async () => {
        fight.state = FightState.Running;

        wsMain.emit('resumeTimer', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        await new Promise<void>((resolve) =>
          wsMain.on('resumeTimer', (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });

      it('fight can be resumed even if fight time has already ended', async () => {
        fight.timer.endTimer();
        fight.state = FightState.Paused;

        wsMain.emit('resumeTimer', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on('resumeTimer', (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              resolve();
            }),
          );
        }
      });
    });

    describe('pauseTimer', () => {
      beforeEach(() => {
        fight.timer = new Timer(1);
      });

      afterEach(() => {
        fight.timer.endTimer();
      });

      it('not main judge should not pause timer when it is running before timer ended', async () => {
        fight.state = FightState.Running;
        const exactPauseTimeInMillis = Date.now();

        wsRed.emit('pauseTimer', {
          fightId: fight.id,
          judgeId: fight.redJudgeId,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        await new Promise<void>((resolve) =>
          wsRed.on('pauseTimer', (data) => {
            expect(data.status).toBe(ResponseStatus.Unauthorized);
            resolve();
          }),
        );
      });

      it('main judge should pause timer when it is running before timer ended', async () => {
        fight.state = FightState.Running;
        fight.timer.resumeTimer();
        const exactPauseTimeInMillis = Date.now();

        wsMain.emit('pauseTimer', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on('pauseTimer', (data) => {
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

        wsMain.emit('pauseTimer', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        await new Promise<void>((resolve) =>
          wsMain.on('pauseTimer', (data) => {
            expect(data.status).toBe(ResponseStatus.BadRequest);
            resolve();
          }),
        );
      });

      it('fight can be paused even if fight time has already ended', async () => {
        fight.state = FightState.Running;
        fight.timer.endTimer();
        const exactPauseTimeInMillis = Date.now();

        wsMain.emit('pauseTimer', {
          fightId: fight.id,
          judgeId: fight.mainJudgeId,
          exactPauseTimeInMillis: exactPauseTimeInMillis,
        });

        for (const ws of [wsMain, wsRed, wsBlue]) {
          await new Promise<void>((resolve) =>
            ws.on('pauseTimer', (data) => {
              expect(data.status).toBe(ResponseStatus.OK);
              expect(data.exactPauseTimeInMillis).toBe(exactPauseTimeInMillis);
              resolve();
            }),
          );
        }
      });
    });
  });
});
