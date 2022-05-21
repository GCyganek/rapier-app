import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { FightsService } from './services/fights.service';
import { JudgesGateway } from './gateways/judges.gateway';
import { PlayersService } from './services/players.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoPlayer, PlayerSchema } from './schemas/player.schema';
import { FightSchema, MongoFight } from './schemas/fight.schema';
import 'dotenv/config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    MongooseModule.forFeature([
      { name: MongoPlayer.name, schema: PlayerSchema },
      { name: MongoFight.name, schema: FightSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [JudgesGateway, FightsService, PlayersService],
})
export class AppModule {}
