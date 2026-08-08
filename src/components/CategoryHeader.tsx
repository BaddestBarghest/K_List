import { Button, Space } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useAppStore } from "../store/AppStore";
import { useCategories } from "../hooks/useKinks";
import type { Category } from "../types";

export function CategoryHeader({
  category,
  count,
  editMode,
}: {
  category: Category;
  count: number;
  editMode: boolean;
}) {
  const { dispatch } = useAppStore();
  const categories = useCategories();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>
        {category.name} ({count})
      </span>
      {editMode && (
        <Space onClick={(e) => e.stopPropagation()}>
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
        </Space>
      )}
    </div>
  );
}
