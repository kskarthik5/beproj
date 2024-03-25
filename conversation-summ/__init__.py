from flask import Flask, request, jsonify
from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
app = Flask(__name__)
tokenizer = AutoTokenizer.from_pretrained("knkarthick/MEETING_SUMMARY")
model = AutoModelForSeq2SeqLM.from_pretrained("knkarthick/MEETING_SUMMARY")
@app.post('/getSummary')
def getSummary():
    text = request.json
    res=""
    for i in text:
        ml=len(i.split())
        inputs = tokenizer(i, return_tensors="pt")
        summary_ids = model.generate(inputs["input_ids"], num_beams=4, max_length=ml, min_length=ml//2)
        ans=tokenizer.batch_decode(summary_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]
        res+=" "+ans
    print("Summary: ",res)
    return jsonify(res)

if __name__ == '__main__':
    app.run(port=4000)

@app.route("/")
def hello_world():
    return jsonify("convsum endpoint up and running")