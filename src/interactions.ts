import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, Snowflake } from 'discord.js';
import { createListeningStream } from './createListeningStream';
import { transcripted } from './transcriptStore';

async function join(
	interaction: CommandInteraction,
	recordable: Set<Snowflake>,
	client: Client,
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

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
		const receiver = connection.receiver;

		receiver.speaking.on('start', (userId) => {
			if (recordable.has(userId)) {
				const username = client.users.cache.get(userId)?.username as string
				createListeningStream(receiver, userId, username);
			}
		});
	} catch (error) {
		console.warn(error);
		await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
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
		recordable.add("");
		if (!interaction.member) return
		let channel = interaction.member.voice.channel;
		let users = client.channels.cache.get(channel.id).members
		const receiver = connection.receiver;
		users.forEach((user: any) => {
			if (user.user.id === "1194971976914178079") return
			console.log(`Recording ${user.user.username}`)
			createListeningStream(receiver, user.user.id, user.user.username);
		});

		await interaction.reply({ ephemeral: true, content: 'Listening!' });
	} else {
		await interaction.reply({ ephemeral: true, content: 'Join a voice channel and then try that again!' });
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
		await interaction.reply({ ephemeral: true, content: transcripted.text.join("\n") });
	} else {
		await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' });
	}
}
async function transcript(
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
	recordable: Set<Snowflake>,
	_client: Client,
	connection?: VoiceConnection,
) {
	if (connection) {
		connection.destroy();
		recordable.clear();
	}
	const response:any=await fetch("http://127.0.0.1:7000/getSummary", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body:JSON.stringify(transcripted.text)
	}).then(response => response.json());
	await interaction.reply({ ephemeral: true, content:response });

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


