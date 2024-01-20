import { DiscordService } from './lib/discord';

const discord = new DiscordService();
(async () => {
  await discord.init();
  discord.setHandlers();
  await discord.startJobExecuteLoop();
})();
