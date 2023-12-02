import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { MyContext } from './config/session-config';
import { deleteAccountCommand, newDescriptionCommand } from "./handlers/commandHandler";
import { handleTimeSlotInput, planHandler } from './handlers/interviewHandler';
import { adminHandler, intervieweeHandler, interviewerHandler, registrationHandler } from './handlers/registrationHandler';
import { callbackQueryHandler } from "./service/registrationService";

dotenv.config();

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

bot.use(session());

bot.command('start', (ctx: any) => {
  ctx.reply("https://t.me/nodejs_ru")
  ctx.reply("https://t.me/react_js")
});
bot.command('deleteaccount', deleteAccountCommand);
bot.command('newdescription', newDescriptionCommand);

bot.hears('Интервьюер', interviewerHandler);
bot.hears('Собеседуемый', intervieweeHandler);
bot.hears('Админ', adminHandler);

bot.hears('Сделать план на неделю', planHandler);

bot.hears(/([А-Яа-я]+: \d{2}:\d{2}-\d{2}:\d{2})(?:\s+([А-Яа-я]+: \d{2}:\d{2}-\d{2}:\d{2})){0,6}/, handleTimeSlotInput);

bot.hears(/.*/, registrationHandler);


bot.on('callback_query', async (ctx) => {
  await callbackQueryHandler(ctx);
});

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

