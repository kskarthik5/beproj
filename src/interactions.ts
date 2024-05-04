import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, Snowflake } from 'discord.js';
import { createListeningStream } from './createListeningStream';
import { transcripted } from './transcriptStore';


async function join(
	interaction: CommandInteraction,
	_recordable: Set<Snowflake>,
	_client: Client,
	connection?: VoiceConnection,
) {
	await interaction.deferReply();
	if (!connection) {
		if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
			const channel = interaction.member.voice.channel;
			connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: channel.guild.id,
				selfDeaf: false,
				selfMute: true,
				// @ts-expect-error Currently voice is built in mind with API v10 whereas discord.js v13 uses API v9.
				adapterCreator: channel.guild.voiceAdapterCreator,
			});
			transcripted.text = []
		} else {
			await interaction.followUp('Join a voice channel and then try that again!');
			return;
		}
	}

	await interaction.followUp('Ready!');
}

async function record(
	interaction: any,
	recordable: Set<Snowflake>,
	client: any,
	connection?: VoiceConnection,
) {
	if (connection) {

		try {
			await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
			const receiver = connection.receiver;
			await interaction.reply({ ephemeral: true, content: 'Listening!' });
			receiver.speaking.on('start', (userId) => {
				const username = client.users.cache.get(userId)?.username as string
				if(!recordable.has(username)){
					recordable.add(username)
					createListeningStream(receiver, userId, username,recordable);
				}
			});

		} catch (error) {
			console.warn(error);
			await interaction.followUp('Something went wrong');
		}
	}
}

async function exit(
	interaction: CommandInteraction,
	recordable: Set<Snowflake>,
	_client: Client,
	connection?: VoiceConnection,
) {
	if (connection) {
		connection.destroy();
		recordable.clear();
		await interaction.reply({ ephemeral: true, content: 'Left the voice chat' });
	} else {
		await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' });
	}
}
async function transcript(
	interaction: CommandInteraction,
	_recordable: Set<Snowflake>,
	_client: Client,
	_connection?: VoiceConnection,
) {

		await interaction.reply({ ephemeral: true, content: transcripted.text.join("\n") });
}
async function gist(
	interaction: CommandInteraction,
	recordable: Set<Snowflake>,
	_client: Client,
	connection?: VoiceConnection,
) {
	if (connection) {
		connection.destroy();
		recordable.clear();
		await interaction.reply({ ephemeral: true, content: transcripted.text.join("\n") });
	} else {
		await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' });
	}
}
async function summary(
	interaction: CommandInteraction,
	_recordable: Set<Snowflake>,
	_client: Client,
	_connection?: VoiceConnection,
) {
	await interaction.reply({ content: 'Generating Summary .... '});
	const response: any = await fetch("http://127.0.0.1:7000/getSummary", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(transcripted.text)
	}).then(async response =>  await response.json());
	await interaction.editReply({ content: response });

}
export const interactionHandlers = new Map<
	string,
	(
		interaction: CommandInteraction,
		recordable: Set<Snowflake>,
		client: Client,
		connection?: VoiceConnection,
	) => Promise<void>
>();
interactionHandlers.set('join', join);
interactionHandlers.set('record', record);
interactionHandlers.set('exit', exit);
interactionHandlers.set('gist', gist);
interactionHandlers.set('transcript', transcript);
interactionHandlers.set('summary', summary);


