import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { FightsService } from './services/fights.service';
import { JudgesGateway } from './gateways/judges.gateway';
import { PlayersService } from './services/players.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, JudgesGateway, FightsService, PlayersService],
})
export class AppModule {}
