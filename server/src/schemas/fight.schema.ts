import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  FightEndConditionName,
  FightState,
  PlayerState,
} from '../interfaces/fight.interface';

export type FightDocument = MongoFight & Document;

@Schema({ collection: 'fights', versionKey: false })
export class MongoFight {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  state: FightState;

  @Prop({ required: true })
  mainJudgeId: string;

  @Prop({ required: true })
  redJudgeId: string;

  @Prop({ required: true })
  blueJudgeId: string;

  @Prop({ required: true })
  redPlayer: PlayerState;

  @Prop({ required: true })
  bluePlayer: PlayerState;

  @Prop({ required: true })
  endConditions: Map<FightEndConditionName, number>;

  @Prop()
  eventsHistory: Event[];

  @Prop()
  startedAt: string;

  @Prop()
  finishedAt: string;

  @Prop()
  fightDuration: string;
}

export const FightSchema = SchemaFactory.createForClass(MongoFight);
