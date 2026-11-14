import { HEADING_MENU } from "./constants";
import type { CMD_TYPE } from "./components/plugin-setting";

interface CommandOrderSettings {
    commandOrder: CMD_TYPE[];
    cmdsSorting: CMD_TYPE[];
    disabledCmdsSorting: CMD_TYPE[];
}

/** Keep visibility separate from order; migrate the two legacy groups without reshuffling them. */
export function normalizeCommandOrder(settings: Partial<CommandOrderSettings>): CommandOrderSettings {
    const initialMenu = HEADING_MENU.filter(cmd => cmd === "insert-note-callout" || !cmd.includes("callout"));
    const validCommands = (value: unknown): CMD_TYPE[] => Array.isArray(value)
        ? value.filter((cmd): cmd is CMD_TYPE => HEADING_MENU.includes(cmd))
        : [];
    const enabled = validCommands(settings.cmdsSorting ?? initialMenu);
    const hidden = validCommands(settings.disabledCmdsSorting);
    const commandOrder = [...new Set([
        ...validCommands(settings.commandOrder),
        ...enabled,
        ...hidden,
        ...HEADING_MENU,
    ])];
    const enabledSet = new Set(enabled);
    return {
        commandOrder,
        // Retain the old fields as ordered projections for existing installations.
        cmdsSorting: commandOrder.filter(cmd => enabledSet.has(cmd)),
        disabledCmdsSorting: commandOrder.filter(cmd => !enabledSet.has(cmd)),
    };
}
