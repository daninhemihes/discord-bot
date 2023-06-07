import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../.env.${process.env.NODE_ENV}` });
import areCommandsDifferent from './areCommandsDifferent'
import getAppCommands from './getAppCommands'
import getLocalCommands from './getLocalCommands'

module.exports = async (client) => {
    try {
      const localCommands = getLocalCommands();
      const appCommands = await getAppCommands(
        client,
        process.env.GUILD_ID
      );
  
      for (const localCommand of localCommands) {
        const { name, description, options } = localCommand;
  
        const existingCommand = await appCommands.cache.find(
          (cmd) => cmd.name === name
        );
  
        if (existingCommand) {
          if (localCommand.deleted) {
            await appCommands.delete(existingCommand.id);
            console.log(`🗑 Deleted command "${name}".`);
            continue;
          }
  
          if (areCommandsDifferent(existingCommand, localCommand)) {
            await appCommands.edit(existingCommand.id, {
              description,
              options,
            });
  
            console.log(`🔁 Edited command "${name}".`);
          }
        } else {
          if (localCommand.deleted) {
            console.log(
              `⏩ Skipping registering command "${name}" as it's set to delete.`
            );
            continue;
          }
          console.log(localCommands)
          await appCommands.create({
            name,
            description,
            options
          });
  
          console.log(`👍 Registered command "${name}."`);
        }
      }
    } catch (error) {
      console.log(`There was an error: ${error}`);
    }
  };