const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
require('dotenv').config()
const sqlite3 = require('sqlite3').verbose();
const web_dictionary = require('./assets/basic.json');
const bot = new Telegraf(process.env.TOKEN);
const lang = {
    "code": ['en', 'ru', 'be', 'uk', 'pl', 'cs', 'sk', 'sl', 'hr', 'sr', 'mk', 'bg'],
    "full_name": ['Anglijsky', 'Russky', 'Bělorusky', 'Ukrajinsky', 'Poljsky', 'Češsky', 'Slovačsky', 'Slovenečsky', 'Hrvatsky', 'Sŕbsky', 'Makedonsky', 'Bulgarsky'],
    "emoji": [`\u{1F1EC}\u{1F1E7}`, `\u{1F1F7}\u{1F1FA}`, `\u{1F1E7}\u{1F1FE}`, `\u{1F1FA}\u{1F1E6}`, `\u{1F1F5}\u{1F1F1}`, `\u{1F1E8}\u{1F1FF}`, `\u{1F1F8}\u{1F1F0}`, `\u{1F1F8}\u{1F1EE}`, `\u{1F1ED}\u{1F1F7}`, `\u{1F1F7}\u{1F1F8}`, `\u{1F1F2}\u{1F1F0}`, `\u{1F1E7}\u{1F1EC}`]
};

var user_message = 0;
var bot_message = 0;


async function setlang(bot, ctx, lang) {
    if(user_message != 0 && bot_message != 0) {
        ctx.telegram.deleteMessage(ctx.chat.id, bot_message.message_id);
        ctx.telegram.deleteMessage(ctx.chat.id, user_message);
        user_message = 0;
        bot_message = 0;
    };
    user_message = ctx.message.message_id;
    bot_message = await ctx.reply('Izberi język interfejsa:', {
        reply_markup: {
            inline_keyboard: [
                [ { text: `${lang["emoji"][0]}Anglijsky`, callback_data: "en" } ],
                [ { text: `${lang["emoji"][1]}Russky`, callback_data: "ru" }, { text: `${lang["emoji"][2]}Bělorusky`, callback_data: "be" }, { text: `${lang["emoji"][3]}Ukrajinsky`, callback_data: "uk" }, ],
                [ { text: `${lang["emoji"][4]}Poljsky`, callback_data: "pl" }, { text: `${lang["emoji"][5]}Češsky`, callback_data: "cs" }, { text: `${lang["emoji"][6]}Slovačsky`, callback_data: "sk" }, ],
                [ { text: `${lang["emoji"][7]}Slovenečsky`, callback_data: "sl" }, { text: `${lang["emoji"][8]}Hrvatsky`, callback_data: "hr" }, { text: `${lang["emoji"][9]}Sŕbsky`, callback_data: "sr" }],
                [ { text: `${lang["emoji"][10]}Makedonsky`, callback_data: "mk" }, { text: `${lang["emoji"][11]}Bulgarsky`, callback_data: "bg" } ]
            ]
        }
    });
    for(let i = 0; i < 12; i++) {
        if(i == 12) {
            i = 0;
        };
        bot.action(lang["code"][i], (ctx) => {
            ctx.telegram.deleteMessage(ctx.chat.id, bot_message.message_id);
            ctx.telegram.deleteMessage(ctx.chat.id, user_message);
            ctx.telegram.sendMessage(ctx.chat.id, 'Język interfejsa jest izměnjeny!');
            user_message = 0;
            bot_message = 0;
            return lang["code"][i];
        });
    };
};


function search(bot, message, web_dictionary, lang) {
    bot.on(message('text'), async (ctx) => {
        var answer = await ctx.telegram.sendMessage(ctx.chat.id, 'Iščų...');
        let word = web_dictionary['searchIndex'];
        try {
            for(let i = 0; i < word[lang["code"][0]].length; i++) {
                for(let j = 0; j < word[lang["code"][0]][i][1].length; j++) {
                    if(ctx.message.text.toLowerCase() == String(word[lang["code"][0]][i][1][j])) {
                        var langs = '';
                        for(let l = 0; l < lang["code"].length; l++) {
                            langs = langs + `\n${lang["emoji"][l]}${lang["full_name"][l]}: ${word[lang["code"][l]][i][1][0]}`;
                        }
                        let text = `\u{1F9D1}\u{200D}\u{1F4BB}Međuslovjansky: ${word['isv-src'][i][1][0]}\n${langs}`;
                        ctx.telegram.editMessageText(ctx.chat.id, answer.message_id, 0, text);
                        console.log(`@${ctx.message.from.username} (id: ${ctx.message.from.id}): ${ctx.message.text}\nBot: ${word['isv-src'][i][1][0]}\nLanguage: ${lang["code"][0]}`);
                        return;
                    };
                };
            };
            ctx.telegram.editMessageText(ctx.chat.id, answer.message_id, 0, '😕Ničto ne jest najdeno...\nPoględajte tu👇👇👇', Markup.inlineKeyboard([Markup.button.url(`\u{1F310}Link`, `https://interslavic-dictionary.com/?text=${ctx.message.text.toLowerCase()}&lang=${lang}-isv`)]));
            console.log(`@${ctx.message.from.username} (id: ${ctx.message.from.id}): ${ctx.message.text}\nBot: 😕\nLanguage: ${lang["code"][0]}`);
            return;
        } catch(error) {
            console.log(error);
            return;
        };
    });
};


function start(bot, lang) {
    bot.start(async (ctx) => {
        await ctx.replyWithPhoto(
            { source: 'assets/start.jpg' },
            { caption: 'Pozdråv! Jesm bot, funkcija ktorogo davati informaciju iz međuslovjanskogo slovnika.\n\n/setlang - izměniti język interfejsa\n@jesm_clovekom - sȯobćiti o pogrěškě' }
        );
        setlang(bot, ctx, lang);
                // lang = lang["code"][i];
                // тут функцыя не аднаўляе БД пасьля 2+ разу карыстаньня /start
                /* db.all("SELECT * FROM users", function(err, allRows) {
                    for(var j = 0; j < allRows.length; j++) {
                        if(allRows[j]['telegram_id'] == ctx.from.id) {
                            console.log('ты ужо ё');
                            if(allRows[j]['language'] != lang["code"][i]) {
                                console.log('мова зьменена');
                                return;
                            } else {
                                console.log('з мовай усё ок');
                                return;
                            };
                        } else {
                            let input_database = db.prepare("INSERT INTO users (telegram_id, language) VALUES(?, ?)");
                            input_database.run(ctx.from.id, lang["code"][i]);
                            input_database.finalize();
                            return;
                        };
                    };
                }); */
    });
};


function main() {
    console.log(`BOT RUN\nTOKEN: ${process.env.TOKEN}`);
    const db = new sqlite3.Database('database/users.db', (err) => {
        if(err) {
            console.log(err.message);
        }
        console.log('DATABASE IS CONNECTED');
    });
    start(bot, lang);
    bot.command('setlang', async (ctx) => { setlang(bot, ctx, lang); });
    search(bot, message, web_dictionary, lang);
    bot.launch();
};

main();

