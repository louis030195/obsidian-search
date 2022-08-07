# obsidian-search

⚠️ Experimental ⚠️


https://user-images.githubusercontent.com/25003283/183289097-4427a19c-ddf0-476a-a2e4-0686976128af.mov


## TODO

- [x] sentence transformers api
- [ ] https://jina.ai
- [ ] https://github.com/rom1504/clip-retrieval
- [ ] client-side inference using clip + onnx
- [ ] better embeddings (weak labelling, [domain adaptation](https://www.sbert.net/examples/domain_adaptation/README.html), multimodal...)

## Development

### Sentence transformers

```bash
virtualenv env
source env/bin/activate
pip install sentence-transformers bottle obsidiantools
```

You might need `nltk`data:

```py
import nltk
nltk.download('all')
```

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
