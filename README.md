# obsidian-search

⚠️ Experimental ⚠️


https://user-images.githubusercontent.com/25003283/183289097-4427a19c-ddf0-476a-a2e4-0686976128af.mov

## Usage

Currently have to put the repository in YOUR_VAULT/.obsidian/plugins/obsidian-search/

(Until time is invested to provide a way with less friction to do this)

It is intended to run the API locally in order to have access to the vault content at all time.
Eventually some cloud deployment could be imagined.

### Sentence transformers

```bash
virtualenv env
source env/bin/activate
pip install sentence-transformers bottle obsidiantools cheroot
```

You might need `nltk`data:

```py
import nltk
nltk.download('all')
```

```bash
python3 api.py --port 3000 --model multi-qa-MiniLM-L6-cos-v1
```

Then use the hotkey in Obsidian to open the search modal.

#### Fine-tuning

For better results, you should fine-tune the model on your vault.

You can either look at [this notebook](./unsupervised_embedding_fine_tuning.ipynb),
or:

```bash
python3 ft.py fine_tune --use_wandb False
```

Using [Weights & Biases](https://wandb.ai/site):

```bash
wandb login
python3 ft.py fine_tune --use_wandb True
```

### Building the plugin

To generate the `main.js` for Obsidian to use:

```bash
npm install
npm build
```

### Jina

TODO

## TODO

- [x] sentence transformers api
- [ ] https://jina.ai
- [ ] https://github.com/rom1504/clip-retrieval
- [ ] client-side inference using clip + onnx
- [ ] better embeddings (weak labelling, [domain adaptation](https://www.sbert.net/examples/domain_adaptation/README.html), multimodal...)

## Development


### Jina

```bash
go install github.com/google/gnostic/cmd/protoc-gen-openapi@latest
wget https://raw.githubusercontent.com/jina-ai/jina/master/jina/proto/jina.proto
wget https://raw.githubusercontent.com/jina-ai/jina/master/jina/proto/docarray.proto
mkdir -p google/protobuf
wget https://raw.githubusercontent.com/protocolbuffers/protobuf/main/src/google/protobuf/timestamp.proto -O google/protobuf/timestamp.proto
wget https://raw.githubusercontent.com/protocolbuffers/protobuf/main/src/google/protobuf/struct.proto -O google/protobuf/struct.proto
# Please specify either:
#        • a "go_package" option in the .proto source file, or
#        • a "M" argument on the command line.
protoc jina.proto -I. --openapi_out=.
```
