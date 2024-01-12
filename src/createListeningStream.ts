import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice';
// import type { User } from 'discord.js';
import * as prism from 'prism-media';
import vosk from 'vosk';
const model: vosk.Model = new vosk.Model('models/vosk-model-small-en-us-0.15');
const param: vosk.BaseRecognizerParam = { model: model, sampleRate: 16000 }
vosk.setLogLevel(0);

export function createListeningStream(receiver: VoiceReceiver, userId: string, userName: string) {
	const rec = new vosk.Recognizer(param)
	rec.setMaxAlternatives(10);
	rec.setWords(true);
	rec.setPartialWords(true);
	const decoder = new prism.opus.Decoder({ frameSize: 640, channels: 1, rate: 16000 });
	const opusStream = receiver.subscribe(userId, {
		end: {
			behavior: EndBehaviorType.Manual,
		},
	}).pipe(decoder);

	const oggStream = new prism.opus.OggLogicalBitstream({
		opusHead: new prism.opus.OpusHead({
			channelCount: 2,
			sampleRate: 48000,
		}),
		pageSizeControl: {
			maxPackets: 10,
		},
	});
	decoder.on('data', (data) => {
		console.log(data)
		const end_of_speech = rec.acceptWaveform(data);
		if (end_of_speech) {
			console.log(JSON.stringify(rec.result(), null, 4));
		} else {

			console.log(JSON.stringify(rec.partialResult(), null, 4));
		}
	});
	const filename = `./recordings/${Date.now()}-${userId}-${userName}.ogg`;

	const out = createWriteStream(filename);

	console.log(`👂 Started recording ${filename}`);

	pipeline(opusStream, oggStream, out, (err) => {
		if (err) {
			console.log(JSON.stringify(rec.finalResult(), null, 4));
			console.warn(`❌ Error recording file ${filename} - ${err.message}`);
		} else {
			console.log(`✅ Recorded ${filename}`);
		}
	});
}

// async function performSpeechRecognition(voiceConn, model, ch) {
// 	//const recognizer = new KaldiRecognizer(model, 16000);

// 	recognizer.setVoice(voiceConn);

// 	const audioPlayer = createAudioPlayer();
// 	voiceConn.subscribe(audioPlayer);

// 	audioPlayer.on('data', (audioData) => {
// 		recognizer.acceptWaveform(audioData);
// 	});

// 	audioPlayer.on('error', (error) => {
// 		console.error('Audio player error:', error);
// 	});

// 	recognizer.on('result', (result) => {
// 		const text = result.text;
// 		console.log('Recognized text:', text);
// 		// Do whatever you want with the recognized text
// 		// For example, you can send it to a transcript channel:
// 		if (ch) {
// 			ch.send({ content: text });
// 		}
// 	});

// 	recognizer.on('error', (error) => {
// 		console.error('Recognition error:', error);
// 	});
// }