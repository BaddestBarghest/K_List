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
    if (!boardRef.current) return;
    try {
      const dataUrl = await toPng(boardRef.current, { backgroundColor: state.theme.darkMode ? "#141414" : "#ffffff" });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "k-list-board.png";
      a.click();
    } catch {
      messageApi.error("Image export failed");
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
