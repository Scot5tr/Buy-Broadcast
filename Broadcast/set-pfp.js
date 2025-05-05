const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "set-pfp",
    async execute(message, args, client2) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

if (args.length < 2) {
            return message.reply(`** لإستعمال الأمر يُرجى كتابته بشكل صحيح :
 \`<set-name> <bot_id> <new_url>\` **`);
        }

        const botId = args[0];

        if (!client2 || botId !== client2.user.id) return;

        const imageUrl = args[1];

        try {
            await client2.user.setAvatar(imageUrl);
            message.reply(`** Profile Picture Updated Successfully
تم تغيير الصورة بنجاح **`);
        } catch (error) {
            console.error("❌ خطأ أثناء تغيير اسم البوت:", error);
        }
    },
};