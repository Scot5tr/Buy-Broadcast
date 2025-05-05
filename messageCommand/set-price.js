const owners = ["1048922338005110804", "1212361716785217560"];
const QuickDB = require("quick.db");
const db = new QuickDB.QuickDB();

module.exports = {
    name: "set-price",
    execute(message, args) {
        
        if (!owners.includes(message.author.id)) return;
        
        const newPrice = args[0];
        if (!newPrice || isNaN(newPrice)) {
            return message.reply("الرجاء إدخال سعر صالح.");
        }

        db.set('amount', newPrice);

        message.reply(`تم تغيير السعر إلى ${newPrice}`);
    }
};