// import ExamplePlugin from "./main";
import TypingAsstPlugin from "main";
import { App, PluginSettingTab, Setting, ToggleComponent, setIcon } from "obsidian";
import Sortable from "sortablejs";
import { CMD_CONFIG, HEADING_MENU } from "src/constants";
import { normalizeCommandOrder } from "src/command-order";

export type CMD_TYPE = (typeof HEADING_MENU)[number]
export interface ExamplePluginSettings {
    nonEmptyLineDisabled: boolean;
    showPlaceholder: boolean;
    disableSelectionMenu: boolean;
    cmdsSorting: CMD_TYPE[];
    disabledCmdsSorting: CMD_TYPE[];
    commandOrder: CMD_TYPE[];
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
            .setDesc("Drag any command to set its order in the menu and search results. Toggles only control visibility in the initial `/` menu; hidden commands remain searchable and usable. Keep at least 5 commands visible.")

        const CmdSettings = containerEl.createDiv({ cls: "heading-config" })

        const enabledSet = new Set(this.plugin.settings.cmdsSorting)
        const cmdsAll = this.plugin.settings.commandOrder
        const toggleMap = new Map<CMD_TYPE, ToggleComponent>()

        const getCmdsFromContainer = (container: HTMLElement): CMD_TYPE[] => {
            return Array.from(container.children)
                .map((item) => item.getAttribute("data-cmd") as CMD_TYPE)
                .filter((cmd): cmd is CMD_TYPE => Boolean(cmd && HEADING_MENU.includes(cmd)))
        }

        const updateToggleDisabledStates = () => {
            for (const [cmd, toggle] of toggleMap.entries()) {
                toggle.setDisabled(enabledSet.size <= 5 && enabledSet.has(cmd))
            }
        }

        const updateAndSaveOrder = async () => {
            const order = normalizeCommandOrder({
                commandOrder: getCmdsFromContainer(CmdSettings),
                cmdsSorting: [...enabledSet],
            })
            Object.assign(this.plugin.settings, order)
            if (this.plugin.commands) {
                this.plugin.commands.defaultCmds = [...order.cmdsSorting]
                this.plugin.commands.allCmds = [...order.commandOrder]
            }
            updateToggleDisabledStates()
            this.hasChanged = true
            await this.plugin.saveSettings()
        }

        for (let i = 0; i < cmdsAll.length; i++) {
            const cmd = cmdsAll[i]
            const isChecked = enabledSet.has(cmd)
            const HeaderItem = CmdSettings.createDiv({
                cls: isChecked ? 'heading-item' : 'heading-item is-hidden-command',
                attr: { 'data-cmd': cmd },
            })
            const IconDiv = HeaderItem.createDiv({ cls: 'heading-item-icon' })
            setIcon(IconDiv, CMD_CONFIG[cmd].icon);
            new Setting(HeaderItem)
                .setName(CMD_CONFIG[cmd].title)
                .addToggle((component) => {
                    toggleMap.set(cmd, component)
                    component.setValue(isChecked)
                        .setTooltip("Show in the initial / menu")
                        .onChange(async (visible) => {
                            if (!visible && enabledSet.has(cmd) && enabledSet.size <= 5) {
                                component.setValue(true)
                                return
                            }
                            if (visible) {
                                enabledSet.add(cmd)
                                HeaderItem.removeClass('is-hidden-command')
                            } else {
                                enabledSet.delete(cmd)
                                HeaderItem.addClass('is-hidden-command')
                            }
                            await updateAndSaveOrder()
                        })
                })
        }
        updateToggleDisabledStates()

        new Sortable(CmdSettings, {
            filter: '.setting-item-control',
            preventOnFilter: false,
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
