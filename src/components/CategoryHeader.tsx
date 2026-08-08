import { memo } from "react";
import { Button, Space } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { Category } from "../types";

export const CategoryHeader = memo(function CategoryHeader({
  category,
  count,
  editMode,
  reorderable = true,
  onReorderUp,
  onReorderDown,
}: {
  category: Category;
  count: number;
  editMode: boolean;
  reorderable?: boolean;
  onReorderUp?: (categoryId: string) => void;
  onReorderDown?: (categoryId: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>
        {category.name} ({count})
      </span>
      {editMode && reorderable && (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button size="small" icon={<ArrowUpOutlined />} onClick={() => onReorderUp?.(category.id)} />
          <Button size="small" icon={<ArrowDownOutlined />} onClick={() => onReorderDown?.(category.id)} />
        </Space>
      )}
    </div>
  );
});
