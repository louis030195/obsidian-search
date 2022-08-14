/* eslint-disable require-jsdoc */
import {ThemeProvider} from "@mui/material";
import {ChildProcess} from "child_process";
import {App, Modal, Plugin, PluginSettingTab} from "obsidian";
import {createRoot} from "react-dom/client";
import {FakeApi, SentenceTransformersApi} from "./api";
import {SearchModalContent} from "./SearchModalContent";
import {CustomSettings, DEFAULT_SETTINGS, SearchSettings} from "./Settings";
import {theme} from "./theme";


export default class SearchPlugin extends Plugin {
  settings: SearchSettings;
  api: ChildProcess;

  async onload() {
    await this.loadSettings();

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: "obsidian-search-semantic-search",
      name: "Run a semantic search",
      hotkeys: [{modifiers: ["Mod", "Shift"], key: "a"}],
      callback: () => {
        new SemanticSearchModal(this.app).open();
      },
    });

    this.addSettingTab(new SettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }


  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SemanticSearchModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const isFake = process.env.USE_FAKE_API;
    const api = !isFake ? new SentenceTransformersApi() : new FakeApi();
    const root = createRoot(this.containerEl.children[1]);
    root.render(
        <ThemeProvider theme={theme}>
          <SearchModalContent api={api} app={this.app} onClose={
            () => this.close()
          } />
        </ThemeProvider>,
    );
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}

class SettingTab extends PluginSettingTab {
  plugin: SearchPlugin;
  constructor(app: App, plugin: SearchPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const root = createRoot(this.containerEl);
    root.render(
        <ThemeProvider theme={theme}>
          <CustomSettings plugin={this.plugin} />
        </ThemeProvider>
    );
  }
}
