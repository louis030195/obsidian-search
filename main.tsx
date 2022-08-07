import { ThemeProvider } from "@mui/material";
import { App, Modal, Plugin, PluginSettingTab } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FakeApi, SentenceTransformersApi } from "./api";
import { SearchModalContent } from "./SearchModalContent";
import { CustomSettings } from "./Settings";
import { theme } from "./theme";
interface SearchSettings {
	setting: string;
}

const DEFAULT_SETTINGS: SearchSettings = {
	setting: "default"
}

export default class SearchPlugin extends Plugin {
	settings: SearchSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "obsidian-search-semantic-search",
			name: "Run a semantic search",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "a" }],
			callback: () => {
				new SemanticSearchModal(this.app).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
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
		const api = !isFake ?
			new SentenceTransformersApi() :
			new FakeApi();
		ReactDOM.render(
			<ThemeProvider theme={theme}>
				<SearchModalContent api={api} app={this.app} onClose={
					() => this.close()
				} />
			</ThemeProvider>,
			this.containerEl.children[1]
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
		ReactDOM.render(
			<ThemeProvider theme={theme}>
				<CustomSettings />
			</ThemeProvider>,
			this.containerEl
		);
	}
}
