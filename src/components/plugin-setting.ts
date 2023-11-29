// import ExamplePlugin from "./main";
import TypingAsstPlugin from "main";
import { App, Editor, Notice, PluginSettingTab, Setting, setIcon } from "obsidian";
import Sortable from "sortablejs";
import { CMD_CONFIG, HEADING_MENU } from "src/constants";

export type CMD_TYPE = (typeof HEADING_MENU)[number]
export interface ExamplePluginSettings {
    showPlaceholder: boolean;
    cmdsSorting: CMD_TYPE[]
}
export class ExampleSettingTab extends PluginSettingTab {
    plugin: TypingAsstPlugin;
    hasChanged: boolean;

    constructor(app: App, plugin: TypingAsstPlugin) {
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

        new Setting(containerEl)
            .setName("Commands Menu")
            .setDesc("Supports custom command combinations and drag-and-drop sorting; please ensure that at least 5 commands are open")

        const CmdSettings = containerEl.createDiv({ cls: "heading-config" })

        const CmdsOn = containerEl.createDiv({ attr: { id: 'cmds-on' }, cls: "heading-config-on" });
        const CmdsOff = containerEl.createDiv({ attr: { id: 'cmds-off' }, cls: "heading-config-off" });

        CmdSettings.appendChild(CmdsOn)
        CmdSettings.appendChild(CmdsOff)

        let cmdsSorting = this.plugin.settings?.cmdsSorting || []
        const cmdsAll = [...new Set([...cmdsSorting, ...HEADING_MENU])]
        for (let i = 0; i < cmdsAll.length; i++) {
            const cmd = cmdsAll[i]
            let HeaderItem: HTMLDivElement;
            const isChecked = this.plugin.settings.cmdsSorting.includes(cmd)
            if (isChecked) {
                HeaderItem = CmdsOn.createDiv({ cls: 'heading-item' })
            } else {
                HeaderItem = CmdsOff.createDiv({ cls: 'heading-item' })
            }
            setIcon(HeaderItem, CMD_CONFIG[cmd].icon);
            new Setting(HeaderItem)
                .setName(CMD_CONFIG[cmd].title)
                .addToggle((component) =>
                    component.setValue(isChecked)
                        .onChange(async () => {
                            if (cmdsSorting.includes(cmd)) {
                                cmdsSorting = cmdsSorting.filter(i => i !== cmd)
                                CmdsOn.removeChild(HeaderItem)
                                CmdsOff.insertBefore(HeaderItem, CmdsOff.firstElementChild)
                            } else {
                                cmdsSorting.push(cmd)
                                CmdsOff.removeChild(HeaderItem)
                                CmdsOn.appendChild(HeaderItem)
                            }
                            this.hasChanged = true;
                            this.plugin.settings.cmdsSorting = [...cmdsSorting]
                            await this.plugin.saveSettings();
                        })
                ).setDisabled(cmdsSorting.length <= 5 && cmdsSorting.includes(cmd))
        }

        new Sortable(CmdsOn, {
            onEnd: async (e) => {
                const cmdsSorting = Array.from(e.to.children).map(item => {
                    return HEADING_MENU.find(cmd => CMD_CONFIG[cmd].title === item.textContent)
                })
                this.plugin.settings.cmdsSorting = [...cmdsSorting] as CMD_TYPE[]
                this.hasChanged = true;
                await this.plugin.saveSettings();
            },
        })
    }

    hide() {
        if (this.hasChanged) {
            (this.app as any).commands.executeCommandById("app:reload");
        }
    }
}