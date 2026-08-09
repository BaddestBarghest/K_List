import { useRef } from "react";
import { Button, Space, Upload, message } from "antd";
import { DownloadOutlined, FileImageOutlined, UploadOutlined } from "@ant-design/icons";
import { toPng } from "html-to-image";
import { useAppStore } from "../store/AppStore";
import { decryptJson, encryptJson } from "../utils/crypto";
import type { AppState } from "../types";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportImport({ boardRef }: { boardRef: React.RefObject<HTMLDivElement | null> }) {
  const { state, dispatch } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const busyRef = useRef(false);

  async function exportImage() {
    const root = boardRef.current;
    if (!root) return;
    
    const restore: Array<() => void> = [];
    function setStyle(el: HTMLElement, prop: "overflow" | "overflowX" | "overflowY" | "maxHeight" | "width" | "height" | "padding" | "paddingBottom", value: string) {
      const prev = el.style[prop];
      el.style[prop] = value;
      restore.push(() => {
        el.style[prop] = prev;
      });
    }

    const exportPadding = 16;

    const scrollRoots = Array.from(root.querySelectorAll<HTMLElement>(".board-scroll-root"));
    const columnContents = Array.from(root.querySelectorAll<HTMLElement>(".board-column-content"));
    const scrollRootWidth = scrollRoots.reduce((max, el) => Math.max(max, el.scrollWidth), 0);
    const columnContentHeights = columnContents.map((el) => el.scrollHeight);

    scrollRoots.forEach((el) => {
      setStyle(el, "overflowX", "visible");
      setStyle(el, "paddingBottom", "0");
      // box-sizing is border-box here, so padding eats into the width we set
      // rather than adding to it -- pad the width out first so the content
      // area still ends up exactly scrollRootWidth after padding is applied.
      setStyle(el, "width", `${scrollRootWidth + exportPadding * 2}px`);
      setStyle(el, "padding", `${exportPadding}px`);
    });
    root.querySelectorAll<HTMLElement>(".board-column").forEach((el) => {
      setStyle(el, "overflow", "visible");
      setStyle(el, "maxHeight", "none");
    });
    columnContents.forEach((el, i) => {
      setStyle(el, "overflowY", "visible");
      setStyle(el, "height", `${columnContentHeights[i]}px`);
    });

    // .board-scroll-root is the actual sized content box (it's an explicit
    // width now, so its own dimensions are trustworthy); `root` is just an
    // unstyled wrapper that stays parent-width regardless of how wide its
    // child renders, so capturing it directly would still crop the right edge.
    const exportTarget = scrollRoots[0] ?? root;

    try {
      // Let layout settle after the style changes before measuring/capturing.
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const dataUrl = await toPng(exportTarget, {
        backgroundColor: state.theme.darkMode ? "#141414" : "#ffffff",
        width: exportTarget.offsetWidth,
        height: exportTarget.offsetHeight,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "k-list-board.png";
      a.click();
    } catch {
      messageApi.error("Image export failed");
    } finally {
      restore.forEach((fn) => fn());
    }
  }

  async function exportData() {
    const encrypted = await encryptJson(state);
    download("k-list-save.json", encrypted, "application/json");
  }

  async function importData(file: File) {
    if (busyRef.current) return false;
    busyRef.current = true;
    try {
      const text = await file.text();
      const imported = await decryptJson<AppState>(text);
      if (imported.version !== 1) throw new Error("Unsupported save version");
      if (!window.confirm("Importing will replace your current lists and assignments. Continue?")) {
        return false;
      }
      dispatch({ type: "REPLACE_STATE", state: imported });
      messageApi.success("Save imported");
    } catch {
      messageApi.error("Could not read that save file");
    } finally {
      busyRef.current = false;
    }
    return false;
  }

  return (
    <Space wrap>
      {contextHolder}
      <Button icon={<FileImageOutlined />} onClick={exportImage}>
        Export image
      </Button>
      <Button icon={<DownloadOutlined />} onClick={exportData}>
        Export save
      </Button>
      <Upload accept=".json" showUploadList={false} beforeUpload={importData}>
        <Button icon={<UploadOutlined />}>Import save</Button>
      </Upload>
    </Space>
  );
}
