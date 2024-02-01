import { createWriteStream } from 'node:fs';
import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice';
// import type { User } from 'discord.js';
import * as prism from 'prism-media';
import vosk from 'vosk';
const model: vosk.Model = new vosk.Model('models/vosk-model-en-in-0.5');
const param: vosk.BaseRecognizerParam = { model: model, sampleRate: 16000 }
vosk.setLogLevel(0);

export function createListeningStream(receiver: VoiceReceiver, userId: string, userName: string) {
	const rec = new vosk.Recognizer(param)
	rec.setWords(true);
	rec.setPartialWords(true);
	const filename = `./recordings/${Date.now()}-${userId}-${userName}.pcm`;
	console.log(`👂 Started recording ${filename}`);
	//const opusStream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 30000 } });
	const opusStream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.Manual } });
	const decoder = new prism.opus.Decoder({ frameSize: 480, channels: 1, rate: 16000 });
	const stream = opusStream.pipe(decoder).pipe(createWriteStream(filename))
	stream.on("finish", () => {
		console.log(`👂 Finished recording ${filename}`);
	})// const opusStream = 
	decoder.on('data', (data) => {
		let end_of_speech:any = rec.acceptWaveform(data);
		if (end_of_speech) {
			console.log(userName+": "+rec.result()["text"]);
		} else {
			// console.log(JSON.stringify(rec.partialResult(), null, 4));
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