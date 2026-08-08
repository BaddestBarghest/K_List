import { Button, Input, Space, Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppStore } from "../store/AppStore";
import { useCategories } from "../hooks/useKinks";

const { Title, Text } = Typography;

export function CategoryManager() {
  const { dispatch } = useAppStore();
  const categories = useCategories();

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
                onClick={() => {
                  if (!window.confirm(`Delete category "${category.name}"? It must have no kinks in it.`)) return;
                  dispatch({ type: "DELETE_CATEGORY", id: category.id });
                }}
              />
            )}
          </Space>
        ))}
      </div>
      <Button
        style={{ marginTop: 12 }}
        icon={<PlusOutlined />}
        onClick={() => {
          const name = window.prompt("New category name");
          if (!name) return;
          dispatch({ type: "ADD_CATEGORY", name });
        }}
      >
        Add category
      </Button>
    </div>
  );
}
