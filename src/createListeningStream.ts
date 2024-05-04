
import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice';
// import type { User } from 'discord.js';
import vosk from 'vosk';
import { OpusEncoder } from '@discordjs/opus';
import type { Snowflake } from 'discord.js';
const model: vosk.Model = new vosk.Model('models/vosk-model-en-in-0.5');
const param: vosk.BaseRecognizerParam = { model: model, sampleRate: 48000 }
vosk.setLogLevel(0);
import { transcripted } from './transcriptStore';
async function convert_audio(input:any) {
    try {
        // stereo to mono channel
        const data = new Int16Array(input)
        const ndata = data.filter((_el, idx) => idx % 2);
        return Buffer.from(ndata);
    } catch (e) {
        console.log(e)
        console.log('convert_audio: ' + e)
        throw e;
    }
}
export function createListeningStream(receiver: VoiceReceiver, userId: string, userName: string,recordable:Set<Snowflake>) {
	const rec = new vosk.Recognizer(param)
	console.log(`recording ${userName}`)
	// rec.setWords(true);
	// rec.setPartialWords(true);
	const audioStream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 } });
	//const opusStream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.Manual } });
	const encoder = new OpusEncoder(48000, 2);
	
	let buffer : any  = []; 
    audioStream.on("data", chunk => { buffer.push( encoder.decode( chunk ) ) }); 
    audioStream.once("end", async () => { 

      buffer = Buffer.concat(buffer)
      try {
        let new_buffer = await convert_audio(buffer)
        rec.acceptWaveform(new_buffer);
         let tst = rec.result().text;
		if(tst.trim().length == 0) return
		if(transcripted.text.at(-1)?.startsWith(userName)){
			transcripted.text[transcripted.text.length-1]+="\n"+tst
			console.log(tst)
		}
		else{
			let res=userName+": "+tst
			transcripted.text.push(res)
			console.log(res);
		}
		  recordable.delete(userName)
		 
      } catch (e) {
		  recordable.delete(userName)
      }1    }); 

}
// decoder.on('data', (data) => {
// 	let end_of_speech:any = rec.acceptWaveform(data);
// 	if (end_of_speech) {
// 		let tst=rec.result()["text"]
// 		if(tst.trim().length == 0) return
// 		if(transcripted.text.at(-1)?.startsWith(userName)){
// 			transcripted.text[transcripted.text.length-1]+="\n"+tst
// 			console.log(tst)
// 		}
// 		else{
// 			let res=userName+": "+tst
// 			transcripted.text.push(res)
// 			console.log(res);
// 		}
// 	} else {
// 		// console.log(JSON.stringify(rec.partialResult(), null, 4));
// 	}
	
// });

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