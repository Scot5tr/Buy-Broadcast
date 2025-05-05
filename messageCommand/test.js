const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");

module.exports = {
name: "test",
async execute(message, args){
    
    if(message.author.id !== "1212361716785217560") return;
const row = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setLabel("token")
.setCustomId("7")
.setStyle(ButtonStyle.Success)
);

message.channel.send({ components: [row] });
}
}