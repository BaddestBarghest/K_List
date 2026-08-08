import { useMemo, useRef, useState } from "react";
import { AutoComplete, Collapse, Input, Typography } from "antd";
import { useAppStore } from "../store/AppStore";
import { useCategories, useUnassignedKinksByCategory } from "../hooks/useKinks";
import { fuzzySearch } from "../utils/search";
import { KinkItem } from "./KinkItem";
import { CategoryHeader } from "./CategoryHeader";
import type { Kink } from "../types";

const { Title } = Typography;

export function UnassignedList({ editMode }: { editMode: boolean }) {
  const { state, dispatch } = useAppStore();
  const categories = useCategories();
  const kinksByCategory = useUnassignedKinksByCategory();
  const [query, setQuery] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>(categories.map((c) => c.id));
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const allUnassigned = useMemo(() => [...kinksByCategory.values()].flat(), [kinksByCategory]);
  const searchResults = useMemo(() => fuzzySearch(query, allUnassigned), [query, allUnassigned]);

  function goToKink(kink: Kink) {
    setActiveKeys((keys) => (keys.includes(kink.category) ? keys : [...keys, kink.category]));
    setQuery("");
    setTimeout(() => {
      const el = itemRefs.current.get(kink.id);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightId(kink.id);
      setTimeout(() => setHighlightId((id) => (id === kink.id ? null : id)), 1500);
    }, 50);
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={4}>Unassigned kinks</Title>
      <AutoComplete
        style={{ width: "100%", marginBottom: 16 }}
        value={query}
        onChange={setQuery}
        options={searchResults.map((r) => ({ value: r.kink.name, kink: r.kink }))}
        onSelect={(_, option) => goToKink((option as { kink: Kink }).kink)}
        filterOption={false}
      >
        <Input.Search placeholder="Search kinks..." allowClear />
      </AutoComplete>

      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        items={categories
          .filter((c) => (kinksByCategory.get(c.id)?.length ?? 0) > 0)
          .map((category) => {
            const kinks = (kinksByCategory.get(category.id) ?? []).slice().sort((a, b) => a.order - b.order);
            return {
              key: category.id,
              label: <CategoryHeader category={category} count={kinks.length} editMode={editMode} />,
              children: (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {kinks.map((kink) => (
                    <KinkItem
                      key={kink.id}
                      ref={(el) => {
                        if (el) itemRefs.current.set(kink.id, el);
                        else itemRefs.current.delete(kink.id);
                      }}
                      kink={kink}
                      lists={state.lists}
                      currentListId={state.assignments[kink.id] ?? null}
                      onAssign={(listId) => dispatch({ type: "ASSIGN_KINK", kinkId: kink.id, listId })}
                      editMode={editMode}
                      highlighted={highlightId === kink.id}
                      onEdit={() => {
                        const name = window.prompt("Kink name", kink.name);
                        if (!name) return;
                        const description = window.prompt("Description", kink.description ?? "") ?? undefined;
                        dispatch({ type: "UPDATE_KINK", id: kink.id, patch: { name, description } });
                      }}
                      onDelete={() => dispatch({ type: "DELETE_CUSTOM_KINK", id: kink.id })}
                      onReorderUp={() =>
                        dispatch({ type: "REORDER_KINK", id: kink.id, direction: "up", categoryKinks: kinks })
                      }
                      onReorderDown={() =>
                        dispatch({ type: "REORDER_KINK", id: kink.id, direction: "down", categoryKinks: kinks })
                      }
                    />
                  ))}
                </div>
              ),
            };
          })}
      />
    </div>
  );
}
