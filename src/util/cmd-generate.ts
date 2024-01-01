import { Editor, MarkdownView } from "obsidian";
import { CONTENT_MAP } from "src/constants";

/**
 * create customized cmds
 */
export function loadCommands() {

    const formatUnderline = (
        editor: Editor,
        line: number,
        left: number,
        right: number
    ) => {
        // range of selected content
        const selectedRange = [
            { line, ch: left },
            { line, ch: right },
        ] as const;
        let selection = editor.getRange(...selectedRange);
        if (/((?!u>).*?)((<u>(?!u>).*<\/u>)+)((?!u>).*?)/.test(selection)) {
            selection = selection.replace(/<\/?u>/g, "");
        }
        editor.replaceRange(`<u>${selection}</u>`, ...selectedRange);
        const content = editor.getLine(line);
        const arr = content.split(/<\/?u>/g);
        let joinContent = "";
        arr.forEach((item, index) => {
            if (index % 2 === 0) {
                joinContent += item ?? "";
                if (index < arr.length - 1) {
                    joinContent += "<u>";
                }
            } else {
                joinContent += (item ?? "") + "</u>";
            }
        });
        joinContent = joinContent.replace(/(<\/u><u>)|(<u><\/u>)/g, "");
        editor.setLine(line, joinContent);
    };



    const generateCommand = (content: string) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (view) {
            const cursor = view.editor.getCursor();
            const editLine = view.editor.getLine(cursor.line);

            if (editLine.length > 1) {
                view.editor.replaceRange(
                    `\n${content}`,
                    { line: cursor.line, ch: cursor.ch - 1 },
                    cursor
                );
                view.editor.setCursor({
                    line: cursor.line + 1,
                    ch: content.length,
                });
            } else {
                view.editor.setLine(cursor.line, content);
                view.editor.setCursor({
                    line: cursor.line,
                    ch: content.length,
                });
            }
            view.editor.focus();
        }
    }

    this.addCommand({
        id: "insert-text",
        name: "Insert normal text",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['text'])
        },
    });

    this.addCommand({
        id: "insert-heading1",
        name: "Insert Heading-1",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['heading1'])
        },
    });
    this.addCommand({
        id: "insert-heading2",
        name: "Insert Heading-2",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['heading2'])
        },
    });
    this.addCommand({
        id: "insert-heading3",
        name: "Insert Heading-3",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['heading3'])
        },
    });
    this.addCommand({
        id: "insert-heading4",
        name: "Insert Heading-4",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['heading4'])
        },
    });
    this.addCommand({
        id: "insert-heading5",
        name: "Insert Heading-5",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['heading5'])
        },
    });
    this.addCommand({
        id: "insert-heading6",
        name: "Insert Heading-6",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['heading6'])
        },
    });
    this.addCommand({
        id: "insert-todo",
        name: "Insert TodoList",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['todoList'])
        },
    });
    this.addCommand({
        id: "insert-bulletList",
        name: "Insert BulletList",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['bulletList'])
        },
    });
    this.addCommand({
        id: "insert-numberList",
        name: "Insert NumberList",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['numberList'])
        },
    });
    this.addCommand({
        id: "insert-divide",
        name: "Insert Divide",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['divide'])
        },
    });
    this.addCommand({
        id: "insert-quote",
        name: "Insert Quote",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['quote'])
        },
    });
	this.addCommand({
		id: "insert-note-callout",
		name: "Insert Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["noteCallout"]);
		}
	});
	this.addCommand({
		id: "insert-abstract-callout",
		name: "Insert Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["abstractCallout"]);
		}
	});
	this.addCommand({
		id: "insert-info-callout",
		name: "Insert Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["infoCallout"]);
		}
	});
	this.addCommand({
		id: "insert-todo-callout",
		name: "Insert Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["todoCallout"]);
		}
	});
	this.addCommand({
		id: "insert-tip-callout",
		name: "Insert Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["tipCallout"]);
		}
	});
	this.addCommand({
		id: "insert-success-callout",
		name: "Success Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["successCallout"]);
		}
	});
	this.addCommand({
		id: "insert-question-callout",
		name: "Question Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["questionCallout"]);
		}
	});
	this.addCommand({
		id: "insert-warning-callout",
		name: "Warning Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["warningCallout"]);
		}
	});
	this.addCommand({
		id: "insert-failure-callout",
		name: "Failure Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["failureCallout"]);
		}
	});
	this.addCommand({
		id: "insert-danger-callout",
		name: "Danger Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["dangerCallout"]);
		}
	});
	this.addCommand({
		id: "insert-bug-callout",
		name: "Bug Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["bugCallout"]);
		}
	});
	this.addCommand({
		id: "insert-example-callout",
		name: "Example Callout",
		editorCallback: (editor) => {
			generateCommand(CONTENT_MAP["exampleCallout"]);
		}
	});
    this.addCommand({
        id: "insert-mathblock",
        name: "Insert Math Block",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['math'])
            CONTENT_MAP['code']
            const view = this.app.workspace.getActiveViewOfType(MarkdownView)
            if (view) {
                const cursor = view.editor.getCursor();
                const editLine = view.editor.getLine(cursor.line);
                view.editor.setCursor(cursor.line - 1)
                view.editor.focus();
            }
        },
    });
    this.addCommand({
        id: "insert-codeblock",
        name: "Insert Math Block",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['code'])
            const view = this.app.workspace.getActiveViewOfType(MarkdownView)
            if (view) {
                const cursor = view.editor.getCursor();
                const editLine = view.editor.getLine(cursor.line);
                view.editor.setCursor(cursor.line - 1)
                view.editor.focus();
            }
        },
    });
    this.addCommand({
        id: "insert-tag",
        name: "Insert Tag",
        editorCallback: (editor: Editor) => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView)
            if (view) {
                const cursor = view.editor.getCursor();
                const editLine = view.editor.getLine(cursor.line);
                let content = editLine.length > 1 ? " #" : '#'
                view.editor.replaceRange(
                    content,
                    { line: cursor.line, ch: cursor.ch - 1 },
                    cursor
                );
                view.editor.focus();
            }
        },
    });

    this.addCommand({
        id: "insert-embed",
        name: "Insert Embed",
        editorCallback: (editor: Editor) => {
            generateCommand(CONTENT_MAP['embed'])
            const view = this.app.workspace.getActiveViewOfType(MarkdownView)
            if (view) {
                const cursor = view.editor.getCursor();
                view.editor.setCursor({ ...cursor, ch: cursor.ch - 2 })
                view.editor.focus();
            }
        },
    });


    // This adds a simple command that can be triggered anywhere
    this.addCommand({
        id: "underline",
        name: "Underline/Cancel underline",
        editorCallback: (editor: Editor) => {
            const from = editor.getCursor("from");
            const to = editor.getCursor("to");
            for (let i = from.line; i <= to.line; i++) {
                const len = editor.getLine(i).length;
                if (from.line === to.line) {
                    formatUnderline(editor, i, from.ch, to.ch);
                } else if (i === from.line && i < to.line) {
                    formatUnderline(editor, i, from.ch, len);
                } else if (i > from.line && i < to.line) {
                    formatUnderline(editor, i, 0, len);
                } else if (i > from.line && i === to.line) {
                    formatUnderline(editor, i, 0, to.ch);
                }
            }
        },
    });
    this.addCommand({
        id: "todo-list",
        name: "Add TodoList",
        editorCallback: (editor: Editor) => {
            const { line, ch } = editor.getCursor();
            const content = editor.getLine(line);
            if (content.startsWith("[ ] ")) {
                editor.replaceRange("", { line, ch: 0 }, { line, ch: 4 });
            } else {
                editor.replaceRange(
                    `- [ ] `,
                    { line, ch: 0 },
                    { line, ch: 0 }
                );
            }
        },
    });

}
