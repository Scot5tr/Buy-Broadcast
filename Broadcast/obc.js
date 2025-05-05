const { PermissionsBitField } = require("discord.js");
module.exports = {
    name: 'obc', 

    async execute(message, args) {
        
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        
        const Msg = message.content.split(' ').slice(1).join(' ');
        const onlineMembers = message.guild.members.cache.filter(member => 
    ['online', 'dnd', 'idle'].includes(member.presence?.status)
);
        const totalMembers = onlineMembers.size;
        let sentCount = 0;

        if (!Msg) {
            return message.reply({ content: "يرجى كتابة الرسالة" });
        }

        const sentMessage = await message.reply({ 
            content: `**- Sent To : ${sentCount}/${totalMembers} 
- تم الإرسال إلى : ${sentCount}/${totalMembers}**` 
        });

        onlineMembers.forEach(async (member) => {
            if (!member.user.bot) {
                try {
                    await member.send(Msg);
                    sentCount++;

                    await sentMessage.edit({ 
            content: `**- Sent To : ${sentCount}/${totalMembers} 
- تم الإرسال إلى : ${sentCount}/${totalMembers}**` 
        });
                } catch (error) {
                    console.error(`❌ فشل إرسال الرسالة إلى ${member.user.tag}: ${error.message}`);
                }
            }
        });

        setTimeout(() => {
            sentMessage.edit({ 
            content: `**- Sent To : ${sentCount}/${totalMembers} 
- تم الإرسال إلى : ${sentCount}/${totalMembers}**` 
        });
        }, 5000);
    }
};