const fs = require('fs');

const owners = ["1048922338005110804", "1212361716785217560"];
const TOKENS_FILE = 'tokens.json';

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

module.exports = {
    name: "add-token",
    execute(message, args) {
        
        if (!owners.includes(message.author.id)) return;

        if (args.length < 2) {
            return message.reply("❌ Please use the command like this: `$add-token <TOKEN> <BOT_ID>`");
        }

        const token = args[0];
        const botId = args[1];

        let tokens = loadJSON(TOKENS_FILE);

        if (!tokens[botId]) {
            tokens[botId] = [];
        }

        tokens[botId].push(token);
        saveJSON(TOKENS_FILE, tokens);

        message.reply("✅ The token has been saved successfully!");
    }
};