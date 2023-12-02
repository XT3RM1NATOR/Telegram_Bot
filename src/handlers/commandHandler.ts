import dotenv from 'dotenv';
import { checkUser, deleteAccount } from '../service/registrationService';
import { deleteSessionById, saveNewSession, updateSessionStage } from '../service/sessionService';

dotenv.config();

export const startCommand = async (ctx: any) => {

  const user = await checkUser(ctx);

  if(user) {
    if(user.role === 'interviewee'){
      ctx.reply("poop")
    }else {
      const options = [
        ['Сделать план на неделю', 'Проверить занятые слоты']
      ];

      ctx.reply('Вы уже зарегестрированы что бы удалить аккаунт нажмите /deleteaccount', {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }
  }else{
    const session = await saveNewSession(ctx, ctx.chat.id);
    
    if (session) {
      ctx.session ??= { 
        id: session.id,
        role: "",
        stageId: 0,
        timezone_hour: 0,
        timezone_minute: 0,
        description: "",
        interviewer: false,
        chat_id: ctx.chat.id
      };
    }
    
    const options = [
      ['Админ', 'Интервьюер', 'Собеседуемый']
    ];

    ctx.reply('Выбери подходящий вариант:', {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }
};

export const newDescriptionCommand = async (ctx: any) => {
  if (ctx.session) {
    ctx.session.stageId = 4;
    ctx.reply("Кидай новое описание");
    await updateSessionStage(ctx.session.id, 4);
  } else {
    ctx.reply("Для начала нажми /start");
  }
};

export const deleteAccountCommand = async (ctx: any) => {
  const chatId = ctx.message.chat.id;
  if (ctx.session?.id) await deleteSessionById(ctx.session.id);
  await deleteAccount(ctx, chatId);
};