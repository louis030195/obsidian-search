import {SmartToy} from "@mui/icons-material";
import {LoadingButton} from "@mui/lab";
import {List, ListItem, ListItemText, TextField} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import SearchPlugin from "./main";
import {exec} from "child_process";
export interface SearchSettings {
  pythonInterpreter: string;
  port: number;
  model: string;
}


export const DEFAULT_SETTINGS: SearchSettings = {
  pythonInterpreter:
    "$HOME/myvault/.obsidian/plugins/obsidian-search/env/bin/python3",
  port: 3000,
  model: "multi-qa-MiniLM-L6-cos-v1",
};

interface CustomSettingsProps {
  plugin: SearchPlugin;
}
export const CustomSettings = ({plugin}: CustomSettingsProps) => {
  const [pythonInterpreter, setPythonInterpreter] = useState(
      plugin.settings.pythonInterpreter || DEFAULT_SETTINGS.pythonInterpreter,
  );
  const [port, setPort] = useState(
      plugin.settings.port || DEFAULT_SETTINGS.port,
  );
  const [model, setModel] = useState(
      plugin.settings.model || DEFAULT_SETTINGS.model,
  );
  console.log("root", plugin.app.vault.configDir);
  // console.log current path
  console.log(process.cwd());
  const runModelInBackground = async () => {
    // run bash process and store the handle in settings
    const cmd =
        // eslint-disable-next-line max-len
        `${pythonInterpreter} /Users/louisbeaumont/Documents/brain/.obsidian/plugins/obsidian-search/api.py --port ${port} --model ${model}`;
    console.log(cmd);

    const handle = exec(cmd, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
    plugin.api = handle;
    // log
    handle.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    }).on("error", (err) => {
      console.log(`error: ${err}`);
    }).on("close", (code: any) => {
      console.log(`child process exited with code ${code}`);
    });
  };

  useEffect(() => {
    plugin.settings = {
      pythonInterpreter,
      port,
      model,
    };
    plugin.saveSettings();
  }, [pythonInterpreter, port, model]);

  return (
    <React.Fragment>
      <List>
        <ListItem>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Python Interpreter" />
          <TextField
            value={pythonInterpreter}
            onChange={(e) => setPythonInterpreter(e.target.value)}
            placeholder="/foo/bar/python3"
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="Port" />
          <TextField
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value))}
            placeholder="3000"
            inputProps={{type: "number"}}
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="Model" />
          <TextField
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="multi-qa-MiniLM-L6-cos-v1"
          />
        </ListItem>
        <ListItem>
          <LoadingButton
            startIcon={<SmartToy/>}
            onClick={runModelInBackground}
          >
            Run semantic search model in the background
          </LoadingButton>
        </ListItem>
      </List>
    </React.Fragment>
  );
};


