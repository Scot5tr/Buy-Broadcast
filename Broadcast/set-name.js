const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "set-name",
    async execute(message, args, client2) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

if (args.length < 2) {
            return message.reply(`** لإستعمال الأمر يُرجى كتابته بشكل صحيح :
 \`<set-name> <bot_id> <new_name>\` **`);
        }

        const botId = args[0];

        if (!client2 || botId !== client2.user.id) return;

        const newName = args.slice(1).join(" ");

        try {
            await client2.user.setUsername(newName);
            message.reply(`**Bots Name Updated Successfully 
تم تغيير الإسم بنجاح **`);
        } catch (error) {
            console.error("❌ خطأ أثناء تغيير اسم البوت:", error);
        }
    },
};