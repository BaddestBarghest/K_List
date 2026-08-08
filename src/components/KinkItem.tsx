import { forwardRef } from "react";
import { Button, Select, Space, Tooltip, Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import type { Kink, ListDef } from "../types";

const { Text } = Typography;

interface KinkItemProps {
  kink: Kink;
  lists: ListDef[];
  currentListId: string | null;
  onAssign?: (listId: string | null) => void;
  editMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReorderUp?: () => void;
  onReorderDown?: () => void;
  highlighted?: boolean;
  readOnly?: boolean;
}

export const KinkItem = forwardRef<HTMLDivElement, KinkItemProps>(function KinkItem(
  {
    kink,
    lists,
    currentListId,
    onAssign,
    editMode,
    onEdit,
    onDelete,
    onReorderUp,
    onReorderDown,
    highlighted,
    readOnly,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "6px 8px",
        borderRadius: 6,
        transition: "background-color 0.6s ease",
        backgroundColor: highlighted ? "rgba(235, 47, 150, 0.25)" : "transparent",
      }}
    >
      <Tooltip title={kink.description || "No description"} placement="right">
        <Text style={{ cursor: "default" }}>
          {kink.name}
          {kink.source === "custom" && (
            <Text type="secondary" style={{ marginLeft: 6, fontSize: 11 }}>
              (custom)
            </Text>
          )}
        </Text>
      </Tooltip>

      <Space size={4}>
        {editMode && (
          <>
            <Button size="small" icon={<ArrowUpOutlined />} onClick={onReorderUp} />
            <Button size="small" icon={<ArrowDownOutlined />} onClick={onReorderDown} />
            {kink.source === "custom" && (
              <>
                <Button size="small" icon={<EditOutlined />} onClick={onEdit} />
                <Button size="small" danger icon={<CloseOutlined />} onClick={onDelete} />
              </>
            )}
          </>
        )}
        {!readOnly && (
          <Select
            size="small"
            style={{ width: 140 }}
            value={currentListId ?? "none"}
            showSearch
            optionFilterProp="label"
            onChange={(value) => onAssign?.(value === "none" ? null : value)}
            options={[
              { value: "none", label: "None" },
              ...lists
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((l) => ({ value: l.id, label: l.name })),
            ]}
          />
        )}
      </Space>
    </div>
  );
});
