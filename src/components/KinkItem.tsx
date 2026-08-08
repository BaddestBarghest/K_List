import { forwardRef, memo, useMemo } from "react";
import { Button, Select, Space, Tooltip, Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { Kink, ListDef } from "../types";

const { Text } = Typography;

interface KinkItemProps {
  kink: Kink;
  lists: ListDef[];
  currentListId: string | null;
  onAssign?: (kinkId: string, listId: string | null) => void;
  editMode?: boolean;
  reorderable?: boolean;
  onEdit?: (kink: Kink) => void;
  onDelete?: (kinkId: string) => void;
  onReorderUp?: (kinkId: string, listId: string) => void;
  onReorderDown?: (kinkId: string, listId: string) => void;
  onUnassign?: (kinkId: string) => void;
  highlighted?: boolean;
  readOnly?: boolean;
}

export const KinkItem = memo(
  forwardRef<HTMLDivElement, KinkItemProps>(function KinkItem(
    {
      kink,
      lists,
      currentListId,
      onAssign,
      editMode,
      reorderable = true,
      onEdit,
      onDelete,
      onReorderUp,
      onReorderDown,
      onUnassign,
      highlighted,
      readOnly,
    },
    ref,
  ) {
    const listOptions = useMemo(
      () => [
        { value: "none", label: "None" },
        ...lists
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((l) => ({ value: l.id, label: l.name })),
      ],
      [lists],
    );

    // Only tint by assignment color in the assign-able view 
    const assignedList = !readOnly && currentListId ? lists.find((l) => l.id === currentListId) : undefined;

    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "2px 8px",
          borderRadius: 4,
          borderLeft: `3px solid ${assignedList ? assignedList.color : "transparent"}`,
          transition: "background-color 0.6s ease, border-color 0.3s ease",
          backgroundColor: highlighted
            ? "rgba(235, 47, 150, 0.25)"
            : assignedList
              ? `${assignedList.color}22`
              : "transparent",
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
          {editMode && reorderable && (
            <>
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                onClick={() => currentListId && onReorderUp?.(kink.id, currentListId)}
              />
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                onClick={() => currentListId && onReorderDown?.(kink.id, currentListId)}
              />
            </>
          )}
          {editMode && kink.source === "custom" && (
            <>
              <Button size="small" icon={<EditOutlined />} onClick={() => onEdit?.(kink)} />
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete?.(kink.id)} />
            </>
          )}
          {editMode && onUnassign && (
            <Tooltip title="Remove from this list">
              <Button size="small" icon={<CloseOutlined />} onClick={() => onUnassign(kink.id)} />
            </Tooltip>
          )}
          {!readOnly && (
            <Select
              size="small"
              style={{ width: 140 }}
              value={currentListId ?? "none"}
              showSearch
              optionFilterProp="label"
              onChange={(value) => onAssign?.(kink.id, value === "none" ? null : value)}
              options={listOptions}
            />
          )}
        </Space>
      </div>
    );
  }),
);
