import { useState } from "react";
import { Button, Input, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAppStore } from "../store/AppStore";

export function AddKinkForm() {
  const { dispatch } = useAppStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!name.trim()) return;
    dispatch({ type: "ADD_CUSTOM_KINK", name: name.trim(), description: description.trim() || undefined });
    setName("");
    setDescription("");
  }

  return (
    <div style={{ marginBottom: 16, padding: 12, border: "1px dashed #444", borderRadius: 8 }}>
      <Space wrap>
        <Input placeholder="New kink name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 180 }} />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: 260 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={submit}>
          Add custom kink
        </Button>
      </Space>
    </div>
  );
}
