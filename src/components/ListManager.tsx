import { Button, ColorPicker, Input, Space, Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppStore } from "../store/AppStore";
import { MAX_LISTS } from "../types";

const { Title } = Typography;

export function ListManager() {
  const { state, dispatch } = useAppStore();
  const lists = [...state.lists].sort((a, b) => a.order - b.order);
  const atCap = state.lists.length >= MAX_LISTS;

  return (
    <div style={{ marginBottom: 16, padding: 12, border: "1px dashed #444", borderRadius: 8 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        Manage lists ({state.lists.length}/{MAX_LISTS})
      </Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lists.map((list) => (
          <Space key={list.id} wrap>
            <ColorPicker
              value={list.color}
              onChangeComplete={(color) =>
                dispatch({ type: "UPDATE_LIST", id: list.id, patch: { color: color.toHexString() } })
              }
            />
            <Input
              value={list.name}
              style={{ width: 160 }}
              onChange={(e) => dispatch({ type: "UPDATE_LIST", id: list.id, patch: { name: e.target.value } })}
            />
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              onClick={() => dispatch({ type: "REORDER_LIST", id: list.id, direction: "up" })}
            />
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              onClick={() => dispatch({ type: "REORDER_LIST", id: list.id, direction: "down" })}
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => dispatch({ type: "DELETE_LIST", id: list.id })}
            />
          </Space>
        ))}
      </div>
      <Button
        style={{ marginTop: 12 }}
        icon={<PlusOutlined />}
        disabled={atCap}
        onClick={() => {
          const name = window.prompt("New list name");
          if (!name) return;
          dispatch({ type: "ADD_LIST", name, color: "#1677ff" });
        }}
      >
        Add list
      </Button>
    </div>
  );
}
