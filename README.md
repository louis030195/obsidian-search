# obsidian-search


⚠️ Extremely experimental and dirty code ⚠️

Currently exploring to use either
- https://jina.ai
- https://github.com/rom1504/clip-retrieval
- client-side inference using clip + onnx
- any new SOTA?


## Random

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
