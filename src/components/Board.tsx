import { Collapse, Empty, Typography } from "antd";
import { useAppStore } from "../store/AppStore";
import { useAllKinks, useCategories } from "../hooks/useKinks";
import { KinkItem } from "./KinkItem";
import { CategoryHeader } from "./CategoryHeader";

const { Title } = Typography;

export function Board({ editMode }: { editMode: boolean }) {
  const { state, dispatch } = useAppStore();
  const categories = useCategories();
  const allKinks = useAllKinks();
  const lists = [...state.lists].sort((a, b) => a.order - b.order);

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
                        label: <CategoryHeader category={category} count={kinks.length} editMode={editMode} />,
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
                                onEdit={() => {
                                  const name = window.prompt("Kink name", kink.name);
                                  if (!name) return;
                                  const description =
                                    window.prompt("Description", kink.description ?? "") ?? undefined;
                                  dispatch({ type: "UPDATE_KINK", id: kink.id, patch: { name, description } });
                                }}
                                onDelete={() => dispatch({ type: "DELETE_CUSTOM_KINK", id: kink.id })}
                                onReorderUp={() =>
                                  dispatch({ type: "REORDER_KINK", id: kink.id, direction: "up", categoryKinks: kinks })
                                }
                                onReorderDown={() =>
                                  dispatch({
                                    type: "REORDER_KINK",
                                    id: kink.id,
                                    direction: "down",
                                    categoryKinks: kinks,
                                  })
                                }
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
