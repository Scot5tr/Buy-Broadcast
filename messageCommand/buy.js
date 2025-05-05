const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
name: "buy",
    async execute(message, args, client){
if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        
        const embed = new EmbedBuilder()
        .setAuthor({
            name: message.guild.name,
            iconURL: message.guild.iconURL({ format: "gif" })
        })
        .setDescription(`** VerDom Broadcast ;
- للقيام بإستخدام خدماتنا | Broadcast Bot
- يُـرجـى الـضغـط على \`Buy Broadcast\` .**`)
        .setThumbnail(message.guild.iconURL({ format: "gif" }))
        .setTimestamp()
        .setColor("Red");
        
        const row = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
        .setLabel("Buy Broadcast")
        .setCustomId("2")
        .setStyle(ButtonStyle.Primary)
        );
        
        message.channel.send({ embeds: [embed], components: [row] });
}
};