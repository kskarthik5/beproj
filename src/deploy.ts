// import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { Guild } from 'discord.js';

export const deploy = async (guild: Guild) => {
	await guild.commands.set([
		{
			name: 'join',
			description: 'Joins the voice channel that you are in',
		},
		{
			name: 'record',
			description: 'Enables recording for a user',
		},
		{
			name: 'exit',
			description: 'Leave the voice channel',
		},
		{
			name: 'transcript',
			description: 'Leave the voice channel',
		},
		{
			name: 'summary',
			description: 'Leave the voice channel',
		},
		{
			name: 'gist',
			description: 'Leave the voice channel',
		},
	]);
};