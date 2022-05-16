import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerDocument = MongoPlayer & Document;

@Schema({ collection: 'players', versionKey: false })
export class MongoPlayer {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
}

export const PlayerSchema = SchemaFactory.createForClass(MongoPlayer);
