import { LoadingButton } from "@mui/lab";
import { Box, Chip, CircularProgress, Grid, InputAdornment, LinearProgress, LinearProgressProps, List, ListItem, ListItemButton, ListItemText, OutlinedInputProps, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Notice, App, WorkspaceLeaf, getLinkpath, requestUrl } from "obsidian";
import * as React from "react";
import { Api, FakeApi, ClipRetrievalApi, SearchResponse } from "./api";
import Vips from "wasm-vips";
import * as ort from "onnxruntime-web";
import fs from "fs";
import { Error } from "@mui/icons-material";

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress 
            color="primary"
            variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="primary.contrastText">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }

export const CustomSettings = () => {

    const [isLoading, setIsloading] = React.useState(false);
    const [progressImage, setProgressImage] = React.useState(0);
    const [progressText, setProgressText] = React.useState(0);
    const [downloadSizeProgressImage, setDownloadSizeProgressImage] = React.useState("");
    const [downloadSizeProgressText, setDownloadSizeProgressText] = React.useState("");
    const [numThreads, setNumThreads] = React.useState(1);
    const [modelPath, setModelPath] = React.useState("/Users/louisbeaumont/Downloads");
    const [error, setError] = React.useState("");
    const imageModelUrl = "clip-image-vit-32-float32.onnx"
    const textModelUrl = "clip-text-vit-32-float32-int32.onnx"


    React.useEffect(() => {
      if (fs.existsSync(`${modelPath}/${imageModelUrl}`)) {
        setProgressImage(100);
        setProgressText(100);
        setIsloading(false);
      }
    }, []);
    React.useEffect(() => {
      if (progressImage === 100 && progressText === 100) {
        testInference().catch((e) => {
          setError(e.toString());
          console.error(e);
        });
      }
    }, [progressImage, progressText]);
    
    const testInference = async () => {
      const imageWorkers = [];
      const onnxImageSessions = [];
      const numImageWorkers = Number(numThreads);
      
      // Inference latency is about 5x faster with wasm threads, but this requires these headers: https://web.dev/coop-coep/ I'm using this as a hack (in enable-threads.js) since Github pages doesn't allow setting headers: https://github.com/gzuidhof/coi-serviceworker
      if (self.crossOriginIsolated) {
        // divide by two to utilise only half the CPU's threads because trying to use all the cpu's threads actually makes it slower
        ort.env.wasm.numThreads = Math.ceil(navigator.hardwareConcurrency / numImageWorkers) / 2;
      }

      const imageModelExecutionProviders = ["wasm"];

      for (let i = 0; i < numImageWorkers; i++) {
        const session = await ort.InferenceSession.create(`${modelPath}/${imageModelUrl}`,
         { executionProviders: imageModelExecutionProviders });
        onnxImageSessions.push(session);
        imageWorkers.push({
          session,
          busy: false,
        });
      }
      console.log("Image model loaded.");

      const onnxTextSession = await ort.InferenceSession.create(
        `${modelPath}/${textModelUrl}`, { executionProviders: ["wasm"] }); 
      console.log("Text model loaded.");

      window.URL.revokeObjectURL(imageModelUrl);
      window.URL.revokeObjectURL(textModelUrl);

      const Tokenizer = (await import("https://deno.land/x/clip_bpe@v0.0.6/mod.js")).default;
      const textTokenizer = new Tokenizer();

      const vips = await Vips();
      let textTokens = textTokenizer.encodeForCLIP("this is a test");
      textTokens = Int32Array.from(textTokens);
      const feeds = {"input": new ort.Tensor("int32", textTokens, [1, 77])};

      console.log("Running inference...");
      const results = await onnxTextSession.run(feeds);
      console.log("Finished inference.");

      const data = results["output"].data;
      console.log("data of result tensor 'output'", data);
    };
    const downloadBlobWithProgress = (
        url: string,
        onProgress: (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any,
        to: string
    ): Promise<Blob> => {
        return new Promise((res, rej) => {
          let blob: Blob;
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = function(_) {
            blob = new Blob([this.response]);   
          };
          xhr.onprogress = onProgress;
          xhr.onloadend = function(_) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = to;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();    
            a.remove();  //afterwards we remove the element again    
            res(blob);
          }
          xhr.send();
        });
      }
    const initializeWorkers = async () => {
      setIsloading(true);

      const imageOnnxBlobPromise = downloadBlobWithProgress("https://huggingface.co/rocca/openai-clip-js/resolve/main/clip-image-vit-32-float32.onnx", (e) => {
        const ratio = (e.loaded / e.total) * 100;
        setProgressImage(ratio);
        setDownloadSizeProgressImage(Math.round(ratio * 352) + " MB");
        // console.log("progress", ratio);
      }, imageModelUrl);

      const textOnnxBlobPromise = downloadBlobWithProgress("https://huggingface.co/rocca/openai-clip-js/resolve/main/clip-text-vit-32-float32-int32.onnx", (e) => {
        const ratio = (e.loaded / e.total) * 100;
        setProgressText(ratio);
        setDownloadSizeProgressText(Math.round(ratio * 242) + " MB");
        // console.log("progress", ratio);
      }, textModelUrl);

      await Promise.all<Blob>([imageOnnxBlobPromise, textOnnxBlobPromise])
    }

    return (
        <List
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          subheader={
            error &&
            <Tooltip title={error}>
              <Error/>
            </Tooltip>
          }
        >
            <ListItem>
              <ListItemText primary="Settings"/>
            </ListItem>
            <ListItem>
                <TextField
                  variant="standard"
                  label="Model path"
                  value={modelPath}
                  color="primary"
                  InputProps={{ disableUnderline: true } as Partial<OutlinedInputProps>}
                  onChange={(e) => setModelPath(e.target.value)}
                  sx={{
                    "& label.Mui-focused": {
                      color: "white",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "white",
                      },
                      "&:hover fieldset": {
                        borderColor: "white",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                      },
                    },
                  }}
                />
            </ListItem>
            <ListItem>
                <LoadingButton
                    loading={isLoading}
                    disabled={progressImage === 100}
                    onClick={() => initializeWorkers()}
                    variant="contained"
                    color="primary"
                    sx={{
                        "& > .MuiLoadingButton-loadingIndicator": {
                            color: "primary.main",
                        },
                    }}
                >
                    Initialize
                </LoadingButton>
            </ListItem>
            <ListItem
              divider
            >
              <Stack
                  direction="row"
                >
                <Typography variant="subtitle1">Image model</Typography>
                <LinearProgressWithLabel 
                  value={progressImage} />
                <Typography variant="body1">
                  {
                    downloadSizeProgressImage
                  }
                </Typography>
              </Stack>
            </ListItem>
            <ListItem
              divider
            >
                <Stack
                  direction="row"
                >
                  <Typography variant="subtitle1">Text model</Typography>
                  <LinearProgressWithLabel 
                    value={progressText} />
                  <Typography variant="body1">
                  {
                    downloadSizeProgressText
                  }
                </Typography>
              </Stack>
            </ListItem>
        </List>
    );
}