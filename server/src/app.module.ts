import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { FightsService } from './services/fights.service';
import { JudgesGateway } from './gateways/judges.gateway';
import { PlayersService } from './services/players.service';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_DB_URL)],
  controllers: [AdminController],
  providers: [JudgesGateway, FightsService, PlayersService],
})
export class AppModule {}
