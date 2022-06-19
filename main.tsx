import { ThemeProvider } from "@mui/material";
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FakeApi, ClipRetrievalApi } from "./api";
import { SearchModalContent } from "./SearchModalContent";
import { CustomSettings } from "./Settings";
import { theme } from "./theme";
interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default"
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon("dice", "Obsidian Search", (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice("This is a notice!");
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "a" }],
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			// console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000));
	}

	// onunload() {

	// }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		// TODO?
		const isFake = true;//process.env.USE_FAKE_API;
		const api = !isFake ?
			new ClipRetrievalApi() :
			new FakeApi();
		// new Notice(`api ${api} ${isFake}`, 5000);
		// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;
// TODO: https://github.com/marcusolsson/obsidian-vale/tree/main/src/settings
	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		console.log("dir", __dirname);
		ReactDOM.render(
			<ThemeProvider theme={theme}>
				<CustomSettings />
			</ThemeProvider>,
			this.containerEl
		);
		// const {containerEl} = this;

		// containerEl.empty();

		// containerEl.createEl("h2", {text: "Settings for my awesome plugin."});

		// new Setting(containerEl)
		// 	.setName("Setting #1")
		// 	.setDesc("It's a secret")
		// 	.addText(text => text
		// 		.setPlaceholder("Enter your secret")
		// 		.setValue(this.plugin.settings.mySetting)
		// 		.onChange(async (value) => {
		// 			console.log("Secret: " + value);
		// 			this.plugin.settings.mySetting = value;
		// 			await this.plugin.saveSettings();
		// 		}));
	}
}
