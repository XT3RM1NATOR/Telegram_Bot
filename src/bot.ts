import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { cancelSlotCallbackHandler, cancelSlotRegistrationCallbackHandler, slotCallbackHandler } from './handlers/callbackHandler';
import { changeChatCommand, changeGMTCommand, deleteAccountCommand, newDescriptionCommand, startCommand } from "./handlers/commandHandler";
import { getSlotsByDate, getSlotsForWeek, interviewRegistrationHandler, planHandler, returnUserToMain, timeSlotHandler, viewUserSlots } from './handlers/interviewHandler';
import { announcementHandler } from './handlers/messageHandler';
import { adminHandler, changeChatCallbackHandler, intervieweeHandler, interviewerHandler, newInterviewerCallbackHandler, registrationHandler, startAction } from './handlers/registrationHandler';
import { MyContext } from './resource/customTypes/MyContext';
import { deleteExpiredSlots } from './service/interviewService';

dotenv.config();

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

bot.use(session());

bot.command('start', startCommand);
bot.command('deleteaccount', deleteAccountCommand);
bot.command('newdescription', newDescriptionCommand);
bot.command('changechat', changeChatCommand);
bot.command('changegmt', changeGMTCommand)

bot.action(["accept_nodejs", "accept_react", "accept_js"], startAction);
bot.action(/^accept_(react|nodejs|js)_change$/, changeChatCallbackHandler);
bot.action(/^select_slot_\d+_\d+$/, slotCallbackHandler);
bot.action(/^(accept|reject)_[0-9]+$/, newInterviewerCallbackHandler);
bot.action(/^cancel_slot_\d+_\d+$/, cancelSlotRegistrationCallbackHandler);
bot.action(/^cancel_slot_\d+$/, cancelSlotCallbackHandler);

bot.hears('Интервьюер', interviewerHandler);
bot.hears('Собеседуемый', intervieweeHandler);
bot.hears('Админ', adminHandler);
bot.hears('Cделать объявление', announcementHandler);
bot.hears('Сделать план на неделю', planHandler);
bot.hears('Зарегестрироваться на интервью', interviewRegistrationHandler);
bot.hears('Все слоты на неделю', getSlotsForWeek);
bot.hears('Домой', returnUserToMain);
bot.hears('Посмотреть мои слоты', viewUserSlots);

bot.hears(/^(20\d{2}-\d{2}-\d{2})$/, getSlotsByDate);
bot.hears(/([А-Яа-я]+: \d{2}:\d{2}-\d{2}:\d{2})(?:\s+([А-Яа-я]+: \d{2}:\d{2}-\d{2}:\d{2})){0,6}/, timeSlotHandler);
bot.hears(/.*/, registrationHandler);

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch({
  webhook: {
    domain: process.env.DOMAIN!,
    port: Number(process.env.PORT),
  }
}).then( async() => {
  await deleteExpiredSlots();
})

