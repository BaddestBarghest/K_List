import { useState } from "react";
import { Button, Input, Select, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAppStore } from "../store/AppStore";
import { useCategories } from "../hooks/useKinks";

export function AddKinkForm() {
  const { dispatch } = useAppStore();
  const categories = useCategories();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("custom");

  function submit() {
    if (!name.trim() || !category) return;
    dispatch({
      type: "ADD_CUSTOM_KINK",
      name: name.trim(),
      category,
      description: description.trim() || undefined,
    });
    setName("");
    setDescription("");
  }

  return (
    <div style={{ marginBottom: 16, padding: 12, border: "1px dashed #444", borderRadius: 8 }}>
      <Space wrap>
        <Input placeholder="New kink name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 180 }} />
        <Select
          style={{ width: 200 }}
          value={category}
          showSearch
          optionFilterProp="label"
          onChange={setCategory}
          options={categories
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => ({ value: c.id, label: c.name }))}
        />
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
