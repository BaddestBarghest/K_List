import { useCallback } from "react";
import { Collapse, Empty, Typography } from "antd";
import { useAppStore } from "../store/AppStore";
import { useAllKinks, useCategories } from "../hooks/useKinks";
import { KinkItem } from "./KinkItem";
import { CategoryHeader } from "./CategoryHeader";
import type { Kink } from "../types";

const { Title } = Typography;

export function Board({ editMode }: { editMode: boolean }) {
  const { state, dispatch } = useAppStore();
  const categories = useCategories();
  const allKinks = useAllKinks();
  const lists = [...state.lists].sort((a, b) => a.order - b.order);

  const handleEdit = useCallback(
    (kink: Kink) => {
      const name = window.prompt("Kink name", kink.name);
      if (!name) return;
      const description = window.prompt("Description", kink.description ?? "") ?? undefined;
      dispatch({ type: "UPDATE_KINK", id: kink.id, patch: { name, description } });
    },
    [dispatch],
  );
  const handleDelete = useCallback(
    (kinkId: string) => dispatch({ type: "DELETE_CUSTOM_KINK", id: kinkId }),
    [dispatch],
  );
  const handleUnassign = useCallback(
    (kinkId: string) => dispatch({ type: "ASSIGN_KINK", kinkId, listId: null }),
    [dispatch],
  );
  const handleReorderUp = useCallback(
    (kinkId: string, listId: string) => dispatch({ type: "REORDER_KINK", id: kinkId, direction: "up", listId }),
    [dispatch],
  );
  const handleReorderDown = useCallback(
    (kinkId: string, listId: string) => dispatch({ type: "REORDER_KINK", id: kinkId, direction: "down", listId }),
    [dispatch],
  );
  const handleCategoryUp = useCallback(
    (id: string) => dispatch({ type: "REORDER_CATEGORY", id, direction: "up" }),
    [dispatch],
  );
  const handleCategoryDown = useCallback(
    (id: string) => dispatch({ type: "REORDER_CATEGORY", id, direction: "down" }),
    [dispatch],
  );

  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
      {lists.map((list) => {
        const listKinks = allKinks.filter((k) => state.assignments[k.id] === list.id);
        const byCategory = new Map<string, typeof listKinks>();
        for (const kink of listKinks) {
          const arr = byCategory.get(kink.category) ?? [];
          arr.push(kink);
          byCategory.set(kink.category, arr);
        }

        return (
          <div
            key={list.id}
            style={{
              minWidth: 260,
              maxWidth: 300,
              flex: "0 0 auto",
              border: `1px solid ${list.color}`,
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              maxHeight: "70vh",
            }}
          >
            <div
              style={{
                backgroundColor: list.color,
                padding: "8px 12px",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            >
              <Title level={5} style={{ margin: 0, color: "#fff" }}>
                {list.name} ({listKinks.length})
              </Title>
            </div>
            <div style={{ overflowY: "auto", padding: 8 }}>
              {listKinks.length === 0 ? (
                <Empty description="Nothing sorted here yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Collapse
                  size="small"
                  defaultActiveKey={categories.map((c) => c.id)}
                  items={categories
                    .filter((c) => byCategory.has(c.id))
                    .map((category) => {
                      const kinks = (byCategory.get(category.id) ?? []).slice().sort((a, b) => a.order - b.order);
                      return {
                        key: category.id,
                        label: (
                          <CategoryHeader
                            category={category}
                            count={kinks.length}
                            editMode={editMode}
                            onReorderUp={handleCategoryUp}
                            onReorderDown={handleCategoryDown}
                          />
                        ),
                        children: (
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {kinks.map((kink) => (
                              <KinkItem
                                key={kink.id}
                                kink={kink}
                                lists={state.lists}
                                currentListId={list.id}
                                readOnly
                                editMode={editMode}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onUnassign={handleUnassign}
                                onReorderUp={handleReorderUp}
                                onReorderDown={handleReorderDown}
                              />
                            ))}
                          </div>
                        ),
                      };
                    })}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
