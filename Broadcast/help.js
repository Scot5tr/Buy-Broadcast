const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
module.exports = {
    name: 'help', 

    async execute(message, args) {
        
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        
        const embed = new EmbedBuilder()
        .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL({ format: "gif" })
        })
        .setTitle("**Bot Commands | أوامر البوت**")
        .setDescription(`**!set-name = Change your bots name | تغـيـيـر اسم البوت
!set-pfp = Set a new avatar for the bot | تـغـيـيـر صورة البوت
——————————————
!bc  { send a message to all members }  |  { إرسال رسالة الى جميع الأعضاء }
!obc  { send a message to online members}  | { إرسال رسالة إلى الأعضاء المُتاحة }**`)
        .setThumbnail(message.guild.iconURL({ format: "gif" }))
        .setColor("Red")
        .setTimestamp();
        
        const row = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
        .setLabel("VerDom BroadCast.")
        .setCustomId("1")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
        );
        
        message.reply({ embeds: [embed], components: [row] });
    }
}