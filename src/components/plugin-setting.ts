// import ExamplePlugin from "./main";
import TypingAsstPlugin from "main";
import { App, PluginSettingTab, Setting, setIcon } from "obsidian";
import Sortable from "sortablejs";
import { CMD_CONFIG, HEADING_MENU } from "src/constants";

type CMD_TYPE = (typeof HEADING_MENU)[number]
export interface ExamplePluginSettings {
    showPlaceholder: boolean;
    test: string;
    cmdsSorting: CMD_TYPE[]
}
export class ExampleSettingTab extends PluginSettingTab {
    plugin: TypingAsstPlugin;

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
            .setName("Commands")
            .setDesc("Commands Config and Sorting")

        const CmdSettings = containerEl.createDiv({ cls: "setting-heading" })

        const CmdsOn = containerEl.createDiv({ attr: { id: 'cmds-on' }, cls: "setting-heading-config-on" });
        const CmdsOff = containerEl.createDiv({ attr: { id: 'cmds-off' }, cls: "setting-heading-config-off" });

        CmdSettings.appendChild(CmdsOn)
        CmdSettings.appendChild(CmdsOff)

        let cmdsSorting = this.plugin.settings?.cmdsSorting || []
        const cmdsAll = [...new Set([...cmdsSorting, ...HEADING_MENU])]
        for (let i = 0; i < cmdsAll.length; i++) {
            const cmd = cmdsAll[i]
            let HeaderItem: HTMLDivElement;
            const isChecked = this.plugin.settings.cmdsSorting.includes(cmd)
            if (isChecked) {
                HeaderItem = CmdsOn.createDiv({ cls: 'setting-heading-item-on' })
            } else {
                HeaderItem = CmdsOff.createDiv({ cls: 'setting-heading-item-on' })
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
                            this.plugin.settings.cmdsSorting = [...cmdsSorting]
                            await this.plugin.saveSettings();
                        }))
        }

        new Sortable(CmdsOn, {
            onEnd: async (e) => {
                const cmdsSorting = Array.from(e.to.children).map(item => {
                    return HEADING_MENU.find(cmd => CMD_CONFIG[cmd].title === item.textContent)
                })
                this.plugin.settings.cmdsSorting = [...cmdsSorting] as CMD_TYPE[]
                await this.plugin.saveSettings();
            },
        })
    }
}