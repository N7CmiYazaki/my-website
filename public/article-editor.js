document.querySelectorAll("form.cms-form").forEach((form) => {
  const editor = form.querySelector("[data-article-body]");
  const status = form.querySelector("[data-editor-status]");
  const fileInput = form.querySelector("[data-image-file]");

  if (!editor || !status || !fileInput) {
    return;
  }

  const insertText = (text) => {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText(text, start, end, "end");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus();
  };

  form.querySelectorAll("[data-insert-prefix]").forEach((button) => {
    button.addEventListener("click", () => {
      const prefix = button.dataset.insertPrefix;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selection = editor.value.slice(start, end);
      const inserted = selection
        ? selection.split("\n").map((line) => `${prefix}${line}`).join("\n")
        : prefix;
      insertText(inserted);
    });
  });

  form.querySelector("[data-insert-link]")?.addEventListener("click", () => {
    const label = window.prompt("リンクに表示する文字を入力してください。");
    if (!label) return;
    const url = window.prompt("リンク先のURLを入力してください。", "https://");
    if (url) insertText(`[${label}](${url})`);
  });

  form.querySelector("[data-insert-anchor]")?.addEventListener("click", () => {
    const label = window.prompt("リンクに表示する文字を入力してください。");
    if (!label) return;
    const id = window.prompt("リンク先の見出しIDを入力してください。");
    if (id) insertText(`[${label}](#${id})`);
  });

  form.querySelector("[data-insert-heading-anchor]")?.addEventListener("click", () => {
    const title = window.prompt("見出しを入力してください。");
    if (!title) return;
    const id = window.prompt("飛びリンク用のIDを入力してください（英数字とハイフン）。");
    if (id) insertText(`## ${title} {#${id}}\n\n`);
  });

  form.querySelector("[data-insert-image-url]")?.addEventListener("click", () => {
    const url = window.prompt("画像URLを入力してください。");
    if (!url) return;
    const alt = window.prompt("画像の説明を入力してください。", "");
    insertText(`![${alt ?? ""}](${url})`);
  });

  form.querySelector("[data-upload-image]")?.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("image", file);
    status.textContent = "画像をアップロードしています…";

    try {
      const response = await fetch("/admin/article-images", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const result = isJson ? await response.json() : null;
      if (!response.ok || typeof result?.url !== "string") {
        throw new Error(
          result?.error || "画像をアップロードできませんでした。ログイン状態と画像形式を確認してください。",
        );
      }

      const alt = window.prompt("画像の説明を入力してください。", file.name) ?? file.name;
      insertText(`![${alt}](${result.url})`);
      status.textContent = "画像を本文に追加しました。";
    } catch (error) {
      status.textContent = error instanceof Error
        ? error.message
        : "画像をアップロードできませんでした。";
    } finally {
      fileInput.value = "";
    }
  });
});
