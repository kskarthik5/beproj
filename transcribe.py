import wave
import json

from vosk import Model, KaldiRecognizer

model_path = r".\vosk_models\vosk-model-en-us-0.22"
audio_filename = "audio.ogg"

model = Model(model_path)
wf = wave.open(audio_filename, "rb")
rec = KaldiRecognizer(model, wf.getframerate())
rec.SetWords(True)  # Include the start and end times for each word in the output

# get the list of JSON dictionaries
results = []
# recognize speech using vosk model
while True:
    data = wf.readframes(4000)
    if len(data) == 0:
        break
    if rec.AcceptWaveform(data):
        part_result = json.loads(rec.Result())
        results.append(part_result)
part_result = json.loads(rec.FinalResult())
results.append(part_result)

wf.close() 
