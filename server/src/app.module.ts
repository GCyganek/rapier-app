import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FightsService } from './fights/fights.service';
import { JudgesGateway } from './judges/judges.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, JudgesGateway, FightsService],
})
export class AppModule {}
