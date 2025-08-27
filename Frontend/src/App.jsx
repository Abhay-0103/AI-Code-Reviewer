import React, { useState, useCallback, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import axios from "axios";
import "./App.css";

function App() {
  const [language, setLanguage] = useState(""); // ask language first
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const providersRegisteredRef = useRef(false);

  // Register providers once Monaco is ready
  useEffect(() => {
    if (!monaco || providersRegisteredRef.current) return;

    const disposables = [];

    const registerProvider = (langId, items, triggerChars = [".", "(", " "]) => {
      const provider = monaco.languages.registerCompletionItemProvider(langId, {
        triggerCharacters: triggerChars,
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = items.map((it) => ({
            label: it.label,
            kind: it.kind,
            documentation: it.documentation,
            insertText: it.insertText,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          }));

          return { suggestions };
        },
      });

      disposables.push(provider);
    };

    // JavaScript suggestions
    registerProvider(
      "javascript",
      [
        {
          label: "console.log",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "console.log(${1})",
          documentation: "Log output to console",
        },
        {
          label: "for-loop",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for (let ${1:i} = 0; ${1} < ${2:10}; ${1}++) {\n\t$0\n}",
          documentation: "Classic for loop",
        },
        {
          label: "arrow-fn",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "(${1:args}) => {\n\t$0\n}",
          documentation: "Arrow function",
        },
      ],
      [".", "(", " ", "="]
    );

    // Python suggestions
    registerProvider(
      "python",
      [
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "print(${1})",
          documentation: "Print to stdout",
        },
        {
          label: "def",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'def ${1:func_name}(${2:args}):\n\t"""${3:docstring}"""\n\t$0',
          documentation: "Function definition with docstring",
        },
        {
          label: "for-range",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for ${1:elem} in ${2:iterable}:\n\t$0",
          documentation: "For loop",
        },
      ],
      [".", "(", ":"]
    );

    // Java suggestions
    registerProvider(
      "java",
      [
        {
          label: "psvm",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "public static void main(String[] args) {\n\t$0\n}",
          documentation: "public static void main snippet",
        },
        {
          label: "System.out.println",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "System.out.println(${1});",
          documentation: "Print to console (Java)",
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public class ${1:ClassName} {\n\t$0\n}",
          documentation: "Class template",
        },
      ],
      [".", "(", " "]
    );

    // C++ suggestions
    registerProvider(
      "cpp",
      [
        {
          label: "#include iostream",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "#include <iostream>\nusing namespace std;\n$0",
          documentation: "Include iostream and using namespace std",
        },
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "int main(int argc, char** argv) {\n\t$0\n\treturn 0;\n}",
          documentation: "Main function",
        },
        {
          label: "cout",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "cout << ${1:var} << endl;",
          documentation: "C++ cout output",
        },
      ],
      [".", ":", "<"]
    );

    providersRegisteredRef.current = true;

    return () => {
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch (e) {}
      });
    };
  }, [monaco]);

  // Quick server-side review call
  const reviewCode = useCallback(
    async (evt) => {
      if (!code.trim()) {
        setReview("⚠️ Please enter some code before requesting a review.");
        return;
      }
      try {
        setLoading(true);
        setReview("");
        const { data } = await axios.post("http://localhost:3000/ai/get-review", {
          code,
          language,
        });
        setReview(data);
      } catch (err) {
        console.error(err);
        setReview("⚠️ Error fetching review. Try again later.");
      } finally {
        setLoading(false);
      }
    },
    [code, language]
  );

  // Small language-aware right-panel hints (keeps UX friendly)
  const computeHint = (lang, value) => {
    if (!value) return "";
    const v = value.trim();
    if (lang === "javascript") {
      if (v.includes("function") || v.includes("=>")) {
        return "💡 JS tip: Consider using `const`/`let` instead of `var`. Use arrow functions for callbacks.";
      }
      if (v.includes("console.log")) return "💡 Tip: Remove debug logs before committing.";
    }
    if (lang === "python") {
      if (v.includes("def ")) return "💡 Python tip: Add type hints (e.g., `def fn(x: int) -> int:`) for clarity.";
      if (v.includes("print(")) return "💡 Tip: Use logging for production code (`import logging`).";
    }
    if (lang === "java") {
      if (v.includes("class ")) return "💡 Java tip: Keep public classes in separate files named after the class.";
      if (v.includes("System.out.println")) return "💡 Tip: Use a logging framework for real apps.";
    }
    if (lang === "cpp") {
      if (v.includes("main(")) return "💡 C++ tip: Manage resources with RAII; prefer std::vector over raw arrays.";
      if (v.includes("cout")) return "💡 Tip: Consider using std::ostringstream for complex formatting.";
    }
    return "";
  };

  // Capture editor instance and set up automatic suggestion trigger
  const handleEditorMount = (editor /*, monacoInstance */) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value) => {
    setCode(value || "");
    const computed = computeHint(language, value || "");
    setHint(computed);

    // auto-open suggestion dropdown while typing (only if editor exists)
    if (editorRef.current && (value || "").trim().length > 0) {
      // trigger suggestions (safe-guard in try/catch)
      try {
        editorRef.current.trigger("keyboard", "editor.action.triggerSuggest", {});
      } catch (e) {
        // ignore if suggestion trigger fails
      }
    }
  };

  // Language selector screen
  if (!language) {
    return (
      <div className="language-select">
        <h2>🔹 Choose a language to start</h2>
        <select
          className="language-dropdown"
          defaultValue=""
          onChange={(e) => {
            setLanguage(e.target.value);
            setCode("");
            setReview("");
            setHint("");
          }}
        >
          <option value="" disabled>
            -- Select Language --
          </option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <p className="small-note">Suggestions will appear while you type (or press <kbd>Ctrl</kbd>+<kbd>Space</kbd>). Highly Supported for JavaScript</p>
      </div>
    );
  }

  return (
    <main className="app-container">
      {/* Editor */}
      <section className="editor-section">
        {!code && <div className="editor-placeholder">💡 Start typing {language} code here...</div>}

        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "Fira Code, monospace",
            minimap: { enabled: false },
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            wordWrap: "off",
            suggestOnTriggerCharacters: true,
            tabSize: 2,
            quickSuggestions: true,
          }}
        />

        <div className="editor-actions">
          <button onClick={reviewCode} className="review-button" disabled={loading}>
            {loading ? "Reviewing..." : "Review"}
          </button>
          <button
            className="reset-button"
            onClick={() => {
              setCode("");
              setReview("");
              setHint("");
            }}
          >
            Clear
          </button>
          <button
            className="switch-button"
            onClick={() => {
              setLanguage("");
              setCode("");
              setReview("");
              setHint("");
            }}
          >
            Switch Language
          </button>
        </div>
      </section>

      {/* Right panel: hints / review */}
      <section className="review-section">
        {loading ? (
          <p className="loading-text">🔄 Reviewing your {language} code...</p>
        ) : review ? (
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        ) : hint ? (
          <p className="suggestion-text">{hint}</p>
        ) : (
          <p className="placeholder-text">✅ Suggestions & reviews will appear here...</p>
        )}
      </section>
    </main>
  );
}

export default App;
