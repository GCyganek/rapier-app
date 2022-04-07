import { Test, TestingModule } from '@nestjs/testing';
import { Manager } from 'socket.io-client';
import { FightInterface, FightState } from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { JudgesGateway } from './judges.gateway';
import { FightsService } from '../fights/fights.service';

describe('JudgesGateway', () => {
  let app: TestingModule;
  const fight: FightInterface = {
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
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [JudgesGateway, FightsService],
    }).compile();

    app.get(FightsService).newFight(fight);
  });

  describe('join', () => {
    it('should join fight as a main judge', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/join');

      socket.emit('join', {
        fightId: fight.id,
        judgeId: fight.mainJudgeId,
      });

      socket.on('join', (message) => {
        expect(message.status).toBe(ResponseStatus.OK);
      });
    });

    it('should join fight as a red judge', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/join');

      socket.emit('join', {
        fightId: fight.id,
        judgeId: fight.redJudgeId,
      });

      socket.on('join', (message) => {
        expect(message.status).toBe(ResponseStatus.OK);
      });
    });

    it('should not join fight as a random judge', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/join');

      socket.emit('join', {
        fightId: fight.id,
        judgeId: 'test 123',
      });

      socket.on('join', (message) => {
        expect(message.status).toBe(ResponseStatus.BadRequest);
      });
    });

    it('should not join to the other fight', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/join');

      socket.emit('join', {
        fightId: 'test 123',
        judgeId: fight.mainJudgeId,
      });

      socket.on('join', (message) => {
        expect(message.status).toBe(ResponseStatus.NotFound);
      });
    });
  });

  describe('startFight', () => {
    it('should not start random fight', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/startFight');
      socket.emit('startFight', {
        fightId: 'test 123',
        judgeId: fight.mainJudgeId,
      });

      socket.on('startFight', (message) => {
        expect(message.status).toBe(ResponseStatus.NotFound);
      });
    });

    it('should not start fight without all judges', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/startFight');

      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.mainJudgeId,
      });
      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.redJudgeId,
      });

      let counter = 0;
      socket.on('startFight', (message) => {
        if (counter == 1) {
          expect(message.status).toBe(ResponseStatus.NotReady);
        }
        counter++;
      });
    });

    it('should start ready fight', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/startFight');

      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.mainJudgeId,
      });
      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.redJudgeId,
      });
      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.blueJudgeId,
      });

      let counter = 0;
      socket.on('startFight', (message) => {
        if (counter == 2) {
          expect(message.status).toBe(ResponseStatus.OK);
        }
        counter++;
      });
    });

    it('should not start not running fight', () => {
      const fightService = app.get(FightsService);
      fightService.getFight(fight.id).state = FightState.Finished;

      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/startFight');

      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.mainJudgeId,
      });
      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.redJudgeId,
      });
      socket.emit('startFight', {
        fightId: fight.id,
        judgeId: fight.blueJudgeId,
      });

      let counter = 0;
      socket.on('startFight', (message) => {
        if (counter == 2) {
          expect(message.status).toBe(ResponseStatus.BadRequest);
        }
        counter++;
      });
    });
  });

  describe('finishFight', () => {
    it('should not finish random fight', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/finishFight');
      socket.emit('finishFight', {
        fightId: 'test 123',
        judgeId: fight.mainJudgeId,
      });

      socket.on('finishFight', (message) => {
        expect(message.status).toBe(ResponseStatus.NotFound);
      });
    });

    it('should not finish not running fight', () => {
      const fightService = app.get(FightsService);
      fightService.getFight(fight.id).state = FightState.Finished;

      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/finishFight');
      socket.emit('finishFight', {
        fightId: fight.id,
        judgeId: fight.mainJudgeId,
      });

      socket.on('finishFight', (message) => {
        expect(message.status).toBe(ResponseStatus.BadRequest);
      });
    });

    it('should finish running fight', () => {
      const fightService = app.get(FightsService);
      fightService.getFight(fight.id).state = FightState.Running;

      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/finishFight');
      socket.emit('finishFight', {
        fightId: fight.id,
        judgeId: fight.mainJudgeId,
      });

      socket.on('finishFight', (message) => {
        expect(message.status).toBe(ResponseStatus.OK);
      });
    });
  });
});
