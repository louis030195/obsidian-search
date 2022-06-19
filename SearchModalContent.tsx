import { Chip, CircularProgress, Grid, InputAdornment, List, ListItem, ListItemButton, ListItemText, TextField } from "@mui/material";
import { Notice, App, WorkspaceLeaf, getLinkpath } from "obsidian";
import * as React from "react";
import { Api, FakeApi, ClipRetrievalApi, SearchResponse } from "./api";

interface ReactViewProps {
  api: Api
  app: App
  onClose: () => void
}
export const SearchModalContent = ({api, app, onClose}: ReactViewProps) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const onQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setQuery(e.target.value)
    setResults([]);
    setIsLoading(true);
    new FakeApi /*ClipRetrievalApi*/().search(e.target.value)
      .then((res) => {
          setResults(res);
          console.log("query", e.target.value, "got results", res)
        })
        .finally(() => setIsLoading(false));
  };
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      {
        // if api is instance of FakeApi
        api instanceof FakeApi &&
        <Grid item>
          <Chip
            label="Fake"
            color="primary"
          />
        </Grid>
      }
        <Grid item>

    <TextField
      value={query}
      onChange={onQueryChange}
      focused
      InputProps={
        isLoading &&
        {
        endAdornment: (
          <InputAdornment position='end'>
            <CircularProgress/>
          </InputAdornment>
        ),
      }}
    />
        </Grid>

        <Grid item>
    <List>
      {
        results?.map((e, i) =>
          
            <ListItemButton
              key={i}
              onClick={() => {
                if (!results) return;
                console.log("clicked", e);
                const url = `obsidian://open?vault=brain&file=${encodeURI(e.filePath)}`;
                console.log("url", url)
                app.workspace.openLinkText(e.fileName, url, false, {});
                onClose();
              }}
            >
              {e.fileName}
            </ListItemButton>
        )
      }
    </List>
    </Grid>
  </Grid>
  )
};
