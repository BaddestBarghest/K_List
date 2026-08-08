import { useState } from "react";
import { Button, Input, Modal, Space, Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppStore } from "../store/AppStore";
import { useCategories } from "../hooks/useKinks";

const { Title, Text } = Typography;

export function CategoryManager() {
  const { dispatch } = useAppStore();
  const categories = useCategories();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  function submitAdd() {
    if (!newName.trim()) return;
    dispatch({ type: "ADD_CATEGORY", name: newName.trim() });
    setNewName("");
    setAddOpen(false);
  }

  function confirmDelete(id: string, name: string) {
    Modal.confirm({
      title: `Delete category "${name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: "It must have no kinks in it, or this will have no effect.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => dispatch({ type: "DELETE_CATEGORY", id }),
    });
  }

  return (
    <div style={{ marginBottom: 16, padding: 12, border: "1px dashed #444", borderRadius: 8 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        Manage categories
      </Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map((category) => (
          <Space key={category.id} wrap>
            {category.source === "custom" ? (
              <Input
                value={category.name}
                style={{ width: 200 }}
                onChange={(e) => dispatch({ type: "RENAME_CATEGORY", id: category.id, name: e.target.value })}
              />
            ) : (
              <Text style={{ width: 200, display: "inline-block" }}>{category.name}</Text>
            )}
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              onClick={() => dispatch({ type: "REORDER_CATEGORY", id: category.id, direction: "up", categories })}
            />
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              onClick={() => dispatch({ type: "REORDER_CATEGORY", id: category.id, direction: "down", categories })}
            />
            {category.source === "custom" && (
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => confirmDelete(category.id, category.name)}
              />
            )}
          </Space>
        ))}
      </div>
      <Button style={{ marginTop: 12 }} icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
        Add category
      </Button>

      <Modal
        title="Add category"
        open={addOpen}
        onOk={submitAdd}
        onCancel={() => {
          setAddOpen(false);
          setNewName("");
        }}
        okButtonProps={{ disabled: !newName.trim() }}
        destroyOnHidden
      >
        <Input
          placeholder="Category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={submitAdd}
          autoFocus
        />
      </Modal>
    </div>
  );
}
