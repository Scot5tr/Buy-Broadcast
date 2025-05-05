const { Client, GatewayIntentBits, Collection, ChannelType, PermissionsBitField, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const QuickDB = require("quick.db");
const db = new QuickDB.QuickDB();
const axios = require("axios");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ]
});


const { tokenBot, prefix, categoryId, bankId, PREFIX } = require("./config.js");

const TOKENS_FILE = "tokens.json";
const CUSTOMERS_FILE = "customer.json";

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, "utf8"));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const getRandomToken = () => {
    let tokens = loadJSON(TOKENS_FILE);

    let botIds = Object.keys(tokens);
    if (botIds.length === 0) return null;

    let randomBotId = botIds[Math.floor(Math.random() * botIds.length)];
    let tokenList = tokens[randomBotId];

    if (!tokenList || tokenList.length === 0) {
        delete tokens[randomBotId]; 
        saveJSON(TOKENS_FILE, tokens);
        return getRandomToken(); 
    }

    let randomToken = tokenList.shift();
    saveJSON(TOKENS_FILE, tokens);

    return { token: randomToken, botId: randomBotId };
};

client.messageCommand = new Collection();

const messageFiles = fs.readdirSync(path.join(__dirname, 'messageCommand')).filter(file => file.endsWith('.js'));

for (const file of messageFiles) {
    const message = require(`./messageCommand/${file}`);
    client.messageCommand.set(message.name, message);
}

function loadBroadcastCommands(botClient) {
    botClient.commands = new Map();
    const commandsPath = path.join(__dirname, "Broadcast");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        botClient.commands.set(command.name, command);
    }
}

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(1).split(/ +/);
    const messageName = args.shift().toLowerCase();  

    const messagess = client.messageCommand.get(messageName) || client.messageCommand.find(cmd => cmd.alliases && cmd.alliases.includes(messageName));

    if (!messagess) return;

    try {
        messagess.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply(error);
    }
});




client.once("ready", async () => {
console.log("ready " + client.user.username);
    client.user.setActivity("discord.gg/veb", {
type: ActivityType.Playing
});
});



client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "2") {
        try {
            const existingTicket = await db.get(`ticket_${interaction.user.id}`);

            if (existingTicket) {
                return interaction.reply({ content: "Ticket limit reached, You already have 1 ticket open.", ephemeral: true });
            }

            const channel = await interaction.guild.channels.create({
                name: `buy-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            await db.set(`ticket_${interaction.user.id}`, channel.id);
            await db.set(`ticket_channel_${channel.id}`, interaction.user.id);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Continue")
                        .setCustomId("3")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setLabel("Close")
                        .setCustomId("4")
                        .setStyle(ButtonStyle.Danger)
                );

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL() || undefined
                })
                .setDescription(`Welcome to VerDom Broadcast, مرحباً بك في خادم فيردوم
** - To Buy a Broadcast bot please click on \`Continue\`
 - لشراء بوت برودكاست يُـرجـى الضَـغـط على \`Continue\` **`)
                .setThumbnail(interaction.guild.iconURL() || undefined)
                .setTimestamp()
                .setColor("Red");

            await interaction.reply({ content: `✔ Ticket Created ${channel.toString()}`, ephemeral: true });

            channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
        } catch (error) {
            console.error("Error creating ticket channel:", error);
            await interaction.reply({ content: "❌ An error occurred while creating the ticket", ephemeral: true });
        }
    }

    if (interaction.customId === "4") {
        try {
            const channel = interaction.channel;
            const ticketOwnerId = await db.get(`ticket_channel_${channel.id}`);

            if (!ticketOwnerId) {
                return interaction.reply({ content: "❌ Unable to find ticket owner.", ephemeral: true });
            }

            await db.delete(`ticket_${ticketOwnerId}`);
            await db.delete(`ticket_channel_${channel.id}`);

            await interaction.reply({ content: "✔ The ticket is being closed" });

            setTimeout(() => channel.delete(), 3000);
        } catch (error) {
            console.error("Error closing ticket:", error);
            await interaction.reply({ content: "❌ An error occurred while closing the ticket", ephemeral: true });
        }
    }

    if (interaction.customId === "3") {
        const ticketOwner = await db.get(`ticket_${interaction.user.id}`);

        if (!ticketOwner) {
            return interaction.reply({ content: "**You can't click the button!**", ephemeral: true });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("5")
                    .setLabel("MultiCast")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("6")
                    .setLabel("BroadCast")
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ content: `**Please specify the type of bot you want**
-
**يرجى اختيار نوع البوت الذي تريده**`, components: [row] });
    }

    if (interaction.customId === "5") {
        const ticketOwner = await db.get(`ticket_${interaction.user.id}`);

        if (!ticketOwner) {
            return interaction.reply({ content: "**You can't click the button!**", ephemeral: true });
        }

        await interaction.reply({ content: `قريباً` });
    }
});


    client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "6") {
        const ticketOwner = await db.get(`ticket_${interaction.user.id}`);

        if (!ticketOwner) {
            return interaction.reply({ content: "**You can't click the button!**", ephemeral: true });
        }
        
        const price = await db.get('amount');

        const tax = Math.floor(price * (20 / 19) + 1);

        await interaction.reply({ content: `#credit ${bankId} ${tax}` });

        const filter = (response) =>
            response.content.includes(`:moneybag: | ${interaction.user.username}, has transferred \`$${price}\` to <@!${bankId}>`) &&
            response.author.id === "282859044593598464";

        const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });

        collector.on("collect", async (response) => {
            let tokenData = getRandomToken();
            if (!tokenData) {
                return interaction.channel.send({ content: "❌ لا توجد توكنات متاحة." });
            }

            let { token, botId } = tokenData;

            let customers = loadJSON(CUSTOMERS_FILE);
            customers[interaction.user.id] = { token, botId };
            saveJSON(CUSTOMERS_FILE, customers);

            startSecondBot(token, interaction);

            collector.stop();
        });

        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                interaction.channel.send({ content: `❌ لم يتم تحويل المبلغ في الوقت المحدد.` });
            }
        });
    }
});


function startSecondBot(token, interaction) {
    const client2 = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildPresences
        ]
    });

    client2.commands = new Collection();
    loadBroadcastCommands(client2);

    client2.on("messageCreate", async message => {
        if (message.author.bot) return;
        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = client2.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args, client2);
        } catch (error) {
            console.error(error);
            await message.reply("❌ حدث خطأ أثناء تنفيذ الأمر.");
        }
    });

    client2.login(token)
        .then(async () => {
            console.log(`✅ تم تشغيل البوت الثاني بنجاح: ${client2.user.username}`);

            const inviteButton = new ButtonBuilder()
                .setLabel("Add Broadcast | إدخال البوت")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/oauth2/authorize?client_id=${client2.user.id}&permissions=8&scope=bot`);

            const row = new ActionRowBuilder().addComponents(inviteButton);

            await interaction.channel.send({
                content: `**- Your Broadcast bot has been created :
- تم إنشاء بوت البرودكاست الخاص بك بنجاح :**`,
                components: [row],
                ephemeral: true
            });

            const buyLog = client.channels.cache.get("1351990999630483507");
            const tokenLog = client.channels.cache.get("1351992265920348230");

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL({ format: "gif" })
                })
                .setTitle("**VerDom Broadcast | برودكاست فيردوم**")
                .setDescription(`**${interaction.user} Successfully bought a broadcast bot.
${interaction.user} قام بشراء بوت برودكاست بنجاح**`)
                .setThumbnail(interaction.user.displayAvatarURL({ format: "gif" }))
                .setTimestamp()
                .setColor("Red");

            buyLog.send({ embeds: [embed] });
            tokenLog.send({ content: `${interaction.user}: \n${token}` });

        })
        .catch(async err => {
            console.error("❌ فشل تشغيل البوت الثاني:", err);
            await interaction.reply({ content: "❌ التوكن غير صالح أو لا يحتوي على الأذونات المطلوبة!", ephemeral: true });
        });
}



client.login(tokenBot);

