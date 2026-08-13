require("dotenv").config();

const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");

const CONFIG = require("./config");
const publishCommand = require("./commands/publish");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// Store commands in a Collection for lookup
client.commands = new Collection();
client.commands.set(publishCommand.data.name, publishCommand);

/**
 * Register /publish as a GUILD command for the target guild only.
 * No global commands are registered.
 */
async function registerCommands() {
  if (!CONFIG.DISCORD_TOKEN || !CONFIG.CLIENT_ID) {
    console.error(
      "[Danipedia] Missing DISCORD_TOKEN or CLIENT_ID in environment variables.",
    );
    process.exit(1);
  }

  const rest = new REST({ version: "10" }).setToken(CONFIG.DISCORD_TOKEN);

  try {
    console.log(
      `[Danipedia] Registering /publish for guild ${CONFIG.GUILD_ID}...`,
    );

    await rest.put(
      Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
      {
        body: [publishCommand.data.toJSON()],
      },
    );

    console.log("[Danipedia] /publish registered successfully.");
  } catch (error) {
    console.error("[Danipedia] Failed to register commands:", error);
    process.exit(1);
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`[Danipedia] Logged in as ${c.user.tag}`);
  console.log(`[Danipedia] Operating in guild: ${CONFIG.GUILD_ID}`);
  console.log(
    `[Danipedia] Event category: ${CONFIG.EVENT_CATEGORY_ID}`,
  );
  console.log(
    `[Danipedia] Authorized publishers: ${CONFIG.AUTHORIZED_USERS.length}`,
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Only handle chat input (slash) commands.
  if (!interaction.isChatInputCommand()) return;

  // Only handle /publish — nothing else.
  if (interaction.commandName !== "publish") return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("[Danipedia] Command execution error:", error);

    const replyPayload = {
      content:
        "❌ An unexpected error occurred while publishing the event. Please try again.",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload).catch(() => {});
    } else {
      await interaction.reply(replyPayload).catch(() => {});
    }
  }
});

// If run with --register, only register commands and exit.
if (process.argv.includes("--register")) {
  registerCommands().then(() => process.exit(0));
} else {
  // Register on boot, then login.
  (async () => {
    await registerCommands();
    await client.login(CONFIG.DISCORD_TOKEN);
  })();
}
