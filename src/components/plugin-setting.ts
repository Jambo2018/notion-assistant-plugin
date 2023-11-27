// import ExamplePlugin from "./main";
import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import Sortable from "sortablejs";

export interface ExamplePluginSettings {
    showPlaceholder: boolean;
}

export default class ExamplePlugin extends Plugin {

    settings: ExamplePluginSettings;

    async loadSettings() {
        this.settings = Object.assign({}, { showPlaceholder: true }, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
export class ExampleSettingTab extends PluginSettingTab {
    plugin: ExamplePlugin;

    constructor(app: App, plugin: ExamplePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", { text: "Typing Assistant" });

        containerEl.createEl("p", { text: "For any questions or suggestions during use, please feel free to " }).createEl("a", {
            text: "contact me",
            href: "https://github.com/Jambo2018/notion-assistant-plugin",
        });


        new Setting(containerEl)
            .setName("Typing Placeholder")
            .setDesc("Show \"💡Please input ‘ / ’ for more commands...\" prompt when typing on a blank line")
            .addToggle((component) =>
                component
                    .setValue(this.plugin.settings.showPlaceholder)
                    .onChange(async (value) => {
                        this.plugin.settings.showPlaceholder = value;
                        await this.plugin.saveSettings();
                    })
            );


        const CmdSettings = containerEl.createDiv({ cls: "setting-heading" })

        const CmdsOn = containerEl.createDiv({ text: "using", attr: { id: 'cmds-on' }, cls: "setting-heading-container" });
        for (let i = 0; i < 5; i++) {
            CmdsOn.createDiv({ text: i.toString(), cls: "setting-heading-ele" })
        }

        const CmdsOff = containerEl.createDiv({ text: 'unused', attr: { id: 'cmds-off' }, cls: "setting-heading-container" });
        for (let i = 6; i < 10; i++) {
            CmdsOff.createDiv({ text: i.toString(), cls: "setting-heading-ele" })
        }
        CmdSettings.appendChild(CmdsOn)
        CmdSettings.appendChild(CmdsOff)

        new Sortable(document.getElementById('cmds-on'), {
            // group: 'cmds-setting',
            onEnd: e => console.log(e.newDraggableIndex),
            direction: "horizontal"
        })

        // new Sortable(document.getElementById('cmds-off'), {
        //     // group: 'cmds-setting',
        //     onEnd: e => console.log(e.newDraggableIndex),
        //     direction: "horizontal"
        // })
    }
}