const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
const web_dictionary = require('./media/basic.json');
const bot = new Telegraf('');
const lang_codes = ['en', 'ru', 'be', 'uk', 'pl', 'cs', 'sk', 'sl', 'hr', 'sr', 'mk', 'bg'];
const lang_names = ['Anglijsky', 'Russky', 'Bělorusky', 'Ukrajinsky', 'Poljsky', 'Češsky', 'Slovačsky', 'Slovenečsky', 'Hrvatsky', 'Sŕbsky', 'Makedonsky', 'Bulgarsky'];
const emojis = [`\u{1F1EC}\u{1F1E7}`, `\u{1F1F7}\u{1F1FA}`, `\u{1F1E7}\u{1F1FE}`, `\u{1F1FA}\u{1F1E6}`, `\u{1F1F5}\u{1F1F1}`, `\u{1F1E8}\u{1F1FF}`, `\u{1F1F8}\u{1F1F0}`, `\u{1F1F8}\u{1F1EE}`, `\u{1F1ED}\u{1F1F7}`, `\u{1F1F7}\u{1F1F8}`, `\u{1F1F2}\u{1F1F0}`, `\u{1F1E7}\u{1F1EC}`];


   
function main() {
    var lang = 'en';
    var spelling = 'standart';
    var set_language;
    bot.start(async (ctx) => {
        await ctx.replyWithPhoto(
            { source: 'media/start.jpg' },
            { caption: 'Pozdråv! Jesm bot, funkcija ktorogo davati informaciju iz međuslovjanskogo slovnika.\n\n/setlang - izměniti język interfejsa\n@jesm_clovekom - sȯobćiti o pogrěškě' }
        );
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
                ctx.telegram.sendMessage(ctx.chat.id, 'Język interfejsa izbrany!');
                lang = lang_codes[i];
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
                        var interslavic_words = '';
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
            ctx.telegram.editMessageText(ctx.chat.id, answer.message_id, 0, '😕Ničto ne jest najdeno...\nPoględajte tu👇👇👇', Markup.inlineKeyboard([Markup.button.url('link', `https://interslavic-dictionary.com/?text=${ctx.message.text.toLowerCase()}&lang=${lang}-isv`)]));
            console.log(`@${ctx.message.from.username} (id: ${ctx.message.from.id}): ${ctx.message.text}\nBot: 😕\nLanguage: ${lang}\nSpelling: ${spelling}`);
            console.log(error);
            return;
        };
    });
    bot.launch();
};

main();
