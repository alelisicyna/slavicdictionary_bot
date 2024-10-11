const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
require('dotenv').config()
const sqlite3 = require('sqlite3').verbose();
const web_dictionary = require('./assets/basic.json');
const bot = new Telegraf(process.env.TOKEN);
const lang_codes = ['en', 'ru', 'be', 'uk', 'pl', 'cs', 'sk', 'sl', 'hr', 'sr', 'mk', 'bg'];
const lang_names = ['Anglijsky', 'Russky', 'Bělorusky', 'Ukrajinsky',
                    'Poljsky', 'Češsky', 'Slovačsky', 'Slovenečsky',
                    'Hrvatsky', 'Sŕbsky', 'Makedonsky', 'Bulgarsky'];
const emojis = [
	`\u{1F1EC}\u{1F1E7}`, `\u{1F1F7}\u{1F1FA}`, `\u{1F1E7}\u{1F1FE}`,
	`\u{1F1FA}\u{1F1E6}`, `\u{1F1F5}\u{1F1F1}`, `\u{1F1E8}\u{1F1FF}`,
	`\u{1F1F8}\u{1F1F0}`, `\u{1F1F8}\u{1F1EE}`, `\u{1F1ED}\u{1F1F7}`,
	`\u{1F1F7}\u{1F1F8}`, `\u{1F1F2}\u{1F1F0}`, `\u{1F1E7}\u{1F1EC}`
];


   
function main() {
    console.log(`BOT RUN\nTOKEN: ${process.env.TOKEN}`);
    const db = new sqlite3.Database('database/users.db', (err) => {
        if(err) {
            console.log(err.message);
        }
        console.log('DATABASE IS CONNECTED');
    });

    var lang = 'en';
    var spelling = 'standart';
    var set_language;
    bot.start(async (ctx) => {
        await ctx.replyWithPhoto(
            { source: 'assets/start.jpg' },
            { caption: 'Pozdråv! Jesm bot, funkcija ktorogo davati informaciju iz međuslovjanskogo slovnika.\n\n/setlang - izměniti język interfejsa\n@jesm_clovekom - sȯobćiti o pogrěškě' }
        );
        set_language = await ctx.reply('Izberi język interfejsa:', {
            reply_markup: {
                inline_keyboard: [
                    [ { text: `${emojis[0]}Anglijsky`, callback_data: "en" } ],
                    [ { text: `${emojis[1]}Russky`, callback_data: "ru" }, { text: `${emojis[2]}Bělorusky`, callback_data: "be" }, { text: `${emojis[3]}Ukrajinsky`, callback_data: "uk" }, ],
                    [ { text: `${emojis[4]}Poljsky`, callback_data: "pl" }, { text: `${emojis[5]}Češsky`, callback_data: "cs" }, { text: `${emojis[6]}Slovačsky`, callback_data: "sk" }, ],
                    [ { text: `${emojis[7]}Slovenečsky`, callback_data: "sl" }, { text: `${emojis[8]}Hrvatsky`, callback_data: "hr" }, { text: `${emojis[9]}Sŕbsky`, callback_data: "sr" }],
                    [ { text: `${emojis[10]}Makedonsky`, callback_data: "mk" }, { text: `${emojis[11]}Bulgarsky`, callback_data: "bg" } ]
                ]
            }
        }

        );
        for(let i = 0; i < 12; i++) {
            if(i == 12) {
                i = 0;
            };
            bot.action(lang_codes[i], (ctx) => {
                ctx.telegram.deleteMessage(ctx.chat.id, set_language.message_id);
                ctx.telegram.sendMessage(ctx.chat.id, 'Język interfejsa izbrany!');
                lang = lang_codes[i];
                // тут функцыя не аднаўляе БД пасьля 2+ разу карыстаньня /start
                /* db.all("SELECT * FROM users", function(err, allRows) {
                    for(var j = 0; j < allRows.length; j++) {
                        if(allRows[j]['telegram_id'] == ctx.from.id) {
                            console.log('ты ужо ё');
                            if(allRows[j]['language'] != lang_codes[i]) {
                                console.log('мова зьменена');
                                return;
                            } else {
                                console.log('з мовай усё ок');
                                return;
                            };
                        } else {
                            let input_database = db.prepare("INSERT INTO users (telegram_id, language) VALUES(?, ?)");
                            input_database.run(ctx.from.id, lang_codes[i]);
                            input_database.finalize();
                            return;
                        };
                    };
                }); */
            });
        };
    });

    var set_language = 0;
    var main_msg;
    bot.command('setlang', async (ctx) => {
        main_msg = ctx.message.message_id;
        set_language = await ctx.reply('Izberi język interfejsa:', {
            reply_markup: {
                inline_keyboard: [
                    [ { text: "Anglijsky", callback_data: "en" } ],
                    [ { text: "Russky", callback_data: "ru" }, { text: "Bělorusky", callback_data: "be" }, { text: "Ukrajinsky", callback_data: "uk" }, ],
                    [ { text: "Poljsky", callback_data: "pl" }, { text: "Češsky", callback_data: "cs" }, { text: "Slovačsky", callback_data: "sk" }, ],
                    [ { text: "Slovenečsky", callback_data: "sl" }, { text: "Hrvatsky", callback_data: "hr" }, { text: "Sŕbsky", callback_data: "sr" }],
                    [ { text: "Makedonsky", callback_data: "mk" }, { text: "Bulgarsky", callback_data: "bg" } ]
                ]
            }
        }
        
        );
        for(let i = 0; i < 12; i++) {
            if(i == 12) {
                i = 0;
            };
            bot.action(lang_codes[i], (ctx) => {
                ctx.telegram.deleteMessage(ctx.chat.id, set_language.message_id);
                ctx.telegram.deleteMessage(ctx.chat.id, main_msg);
                ctx.telegram.sendMessage(ctx.chat.id, 'Język interfejsa izměnjeny!');
                set_language = 0;
                lang = lang_codes[i];
                return lang;
            });
        };
    });
    bot.on(message('text'), async (ctx) => {
        var answer = await ctx.telegram.sendMessage(ctx.chat.id, 'Iščų...');
        let word = web_dictionary['searchIndex'];
        try {
            for(let i = 0; i < word[lang].length; i++) {
                for(let j = 0; j < word[lang][i][1].length; j++) {
                    if(ctx.message.text.toLowerCase() == String(word[lang][i][1][j])) {
                        var langs = '';
                        for(let l = 0; l < lang_codes.length; l++) {
                            langs = langs + `\n${emojis[l]}${lang_names[l]}: ${word[lang_codes[l]][i][1][0]}`;
                        }
                        let text = `\u{1F9D1}\u{200D}\u{1F4BB}Međuslovjansky: ${word['isv-src'][i][1][0]}\n${langs}`;
                        ctx.telegram.editMessageText(ctx.chat.id, answer.message_id, 0, text);
                        console.log(`@${ctx.message.from.username} (id: ${ctx.message.from.id}): ${ctx.message.text}\nBot: ${word['isv-src'][i][1][0]}\nLanguage: ${lang}\nSpelling: ${spelling}`);
                        return;
                    };
                };
            };
            throw new Error('Nothing was found');
        } catch(error) {
            ctx.telegram.editMessageText(ctx.chat.id, answer.message_id, 0, '😕Ničto ne jest najdeno...\nPoględajte tu👇👇👇', Markup.inlineKeyboard([Markup.button.url(`\u{1F310}Link`, `https://interslavic-dictionary.com/?text=${ctx.message.text.toLowerCase()}&lang=${lang}-isv`)]));
            console.log(`@${ctx.message.from.username} (id: ${ctx.message.from.id}): ${ctx.message.text}\nBot: 😕\nLanguage: ${lang}\nSpelling: ${spelling}`);
            console.log(error);
            return;
        };
    });
    bot.launch();
};

main();

