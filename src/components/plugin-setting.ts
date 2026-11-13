// import ExamplePlugin from "./main";
import TypingAsstPlugin from "main";
import { App, PluginSettingTab, Setting, setIcon } from "obsidian";
import Sortable from "sortablejs";
import { CMD_CONFIG, HEADING_MENU } from "src/constants";

export type CMD_TYPE = (typeof HEADING_MENU)[number]
export interface ExamplePluginSettings {
    nonEmptyLineDisabled: boolean;
    showPlaceholder: boolean;
    disableSelectionMenu: boolean;
    cmdsSorting: CMD_TYPE[];
    disabledCmdsSorting: CMD_TYPE[];
}
export class ExampleSettingTab extends PluginSettingTab {
    plugin: TypingAsstPlugin;
    hasChanged: boolean;

    constructor(app: App, plugin: TypingAsstPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.hasChanged = false;
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
            .setName("Non-empty Line Disabled")
            .setDesc("The shortcut key `/` is only recognized at the first character of a blank line, ignoring lines of text in the input.")
            .addToggle((component) =>
                component
                    .setValue(this.plugin.settings.nonEmptyLineDisabled)
                    .onChange(async (value) => {
                        this.hasChanged = true;
                        this.plugin.settings.nonEmptyLineDisabled = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Typing Placeholder")
            .setDesc("Show \"💡Please input ‘ / ’ for more commands...\" prompt when typing on a blank line")
            .addToggle((component) =>
                component
                    .setValue(this.plugin.settings.showPlaceholder)
                    .onChange(async (value) => {
                        this.hasChanged = true;
                        this.plugin.settings.showPlaceholder = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Selection Options")
            .setDesc("Display shortcut options after selecting text")
            .addToggle((component) =>
                component
                    .setValue(!this.plugin.settings.disableSelectionMenu)
                    .onChange(async (value) => {
                        this.plugin.settings.disableSelectionMenu = !value;
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

        let cmdsSorting = [...(this.plugin.settings?.cmdsSorting || [])]
        const enabledSet = new Set(cmdsSorting)
        let disabledCmdsSorting = [
            ...(this.plugin.settings?.disabledCmdsSorting || []).filter(
                (cmd) => HEADING_MENU.includes(cmd) && !enabledSet.has(cmd)
            ),
        ]
        for (const cmd of HEADING_MENU) {
            if (!enabledSet.has(cmd) && !disabledCmdsSorting.includes(cmd)) {
                disabledCmdsSorting.push(cmd)
            }
        }
        const cmdsAll = [...cmdsSorting, ...disabledCmdsSorting]
        const toggleMap = new Map<CMD_TYPE, Setting>()

        const getCmdsFromContainer = (container: HTMLElement): CMD_TYPE[] => {
            return Array.from(container.children)
                .map((item) => item.getAttribute("data-cmd") as CMD_TYPE)
                .filter((cmd): cmd is CMD_TYPE => Boolean(cmd && HEADING_MENU.includes(cmd)))
        }

        const updateToggleDisabledStates = () => {
            for (const [cmd, setting] of toggleMap.entries()) {
                setting.setDisabled(cmdsSorting.length <= 5 && cmdsSorting.includes(cmd))
            }
        }

        const updateAndSaveOrder = async () => {
            cmdsSorting = getCmdsFromContainer(CmdsOn)
            disabledCmdsSorting = getCmdsFromContainer(CmdsOff)
            this.plugin.settings.cmdsSorting = [...cmdsSorting]
            this.plugin.settings.disabledCmdsSorting = [...disabledCmdsSorting]
            if (this.plugin.commands) {
                this.plugin.commands.defaultCmds = [...cmdsSorting]
                this.plugin.commands.allCmds = [...cmdsSorting, ...disabledCmdsSorting]
            }
            updateToggleDisabledStates()
            this.hasChanged = true
            await this.plugin.saveSettings()
        }

        for (let i = 0; i < cmdsAll.length; i++) {
            const cmd = cmdsAll[i]
            let HeaderItem: HTMLDivElement;
            const isChecked = cmdsSorting.includes(cmd)
            if (isChecked) {
                HeaderItem = CmdsOn.createDiv({ cls: 'heading-item', attr: { 'data-cmd': cmd } })
            } else {
                HeaderItem = CmdsOff.createDiv({ cls: 'heading-item', attr: { 'data-cmd': cmd } })
            }
            const IconDiv = HeaderItem.createDiv({ cls: 'heading-item-icon' })
            setIcon(IconDiv, CMD_CONFIG[cmd].icon);
            const settingItem = new Setting(HeaderItem)
                .setName(CMD_CONFIG[cmd].title)
                .addToggle((component) =>
                    component.setValue(isChecked)
                        .onChange(async () => {
                            if (cmdsSorting.includes(cmd)) {
                                CmdsOn.removeChild(HeaderItem)
                                CmdsOff.insertBefore(HeaderItem, CmdsOff.firstElementChild)
                            } else {
                                CmdsOff.removeChild(HeaderItem)
                                CmdsOn.appendChild(HeaderItem)
                            }
                            await updateAndSaveOrder()
                        })
                ).setDisabled(cmdsSorting.length <= 5 && cmdsSorting.includes(cmd))
            toggleMap.set(cmd, settingItem)
        }

        new Sortable(CmdsOn, {
            onEnd: async () => {
                await updateAndSaveOrder()
            },
        })

        new Sortable(CmdsOff, {
            onEnd: async () => {
                await updateAndSaveOrder()
            },
        })
    }

    hide() {
        if (this.hasChanged) {
            (this.app as any).commands.executeCommandById("app:reload");
        }
    }
}