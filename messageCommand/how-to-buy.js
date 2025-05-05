const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
name: "how-to-buy",
    async execute(message, args, client){
if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        
        const embed = new EmbedBuilder()
        .setAuthor({
            name: message.guild.name,
            iconURL: message.guild.iconURL({ format: "gif" })
        })
        .setDescription(`test`)
        .setThumbnail(message.guild.iconURL({ format: "gif" }))
        .setTimestamp()
        .setColor("Red");
        
        const row = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
        .setLabel("VerDom BroadCast.")
        .setCustomId("1")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
        );
        
        message.channel.send({ embeds: [embed], components: [row] });
}
};