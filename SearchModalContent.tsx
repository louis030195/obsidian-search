import { Chip, CircularProgress, Grid, InputAdornment, List, ListItemButton, TextField } from "@mui/material";
import { App } from "obsidian";
import * as React from "react";
import { Api, FakeApi, SearchResponse } from "./api";

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
    api.search(e.target.value)
      .then((res) => {
          setResults(res);
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
                const url = `obsidian://open?vault=brain&file=${encodeURI(e.filePath)}`;
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
