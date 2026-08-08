import { useMemo, useRef, useState } from "react";
import { AutoComplete, Button, Collapse, Input, Space, Typography } from "antd";
import { useAppStore } from "../store/AppStore";
import { useCategories, useKinksByCategory } from "../hooks/useKinks";
import { fuzzySearch } from "../utils/search";
import { KinkItem } from "./KinkItem";
import { CategoryHeader } from "./CategoryHeader";
import type { Kink } from "../types";

const { Title } = Typography;

export function AllKinksList({ editMode }: { editMode: boolean }) {
  const { state, dispatch } = useAppStore();
  const rawCategories = useCategories();
  // Always alphabetical here, independent of any per-list reorder-via-arrows on the Board —
  // this section is for finding/assigning, not arranging, so it never reflects that ordering.
  const categories = useMemo(
    () => [...rawCategories].sort((a, b) => a.name.localeCompare(b.name)),
    [rawCategories],
  );
  const kinksByCategory = useKinksByCategory();
  const [query, setQuery] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>(categories.map((c) => c.id));
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const allKinks = useMemo(() => [...kinksByCategory.values()].flat(), [kinksByCategory]);
  const searchResults = useMemo(() => fuzzySearch(query, allKinks), [query, allKinks]);
  const visibleCategoryIds = useMemo(
    () => categories.filter((c) => (kinksByCategory.get(c.id)?.length ?? 0) > 0).map((c) => c.id),
    [categories, kinksByCategory],
  );

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
      <Title level={4}>All kinks</Title>
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

      <Space style={{ marginBottom: 8 }}>
        <Button size="small" onClick={() => setActiveKeys(visibleCategoryIds)}>
          Expand all
        </Button>
        <Button size="small" onClick={() => setActiveKeys([])}>
          Collapse all
        </Button>
      </Space>

      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        items={categories
          .filter((c) => (kinksByCategory.get(c.id)?.length ?? 0) > 0)
          .map((category) => {
            const kinks = (kinksByCategory.get(category.id) ?? [])
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name));
            return {
              key: category.id,
              label: (
                <CategoryHeader category={category} count={kinks.length} editMode={editMode} reorderable={false} />
              ),
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
                      reorderable={false}
                      highlighted={highlightId === kink.id}
                      onEdit={() => {
                        const name = window.prompt("Kink name", kink.name);
                        if (!name) return;
                        const description = window.prompt("Description", kink.description ?? "") ?? undefined;
                        dispatch({ type: "UPDATE_KINK", id: kink.id, patch: { name, description } });
                      }}
                      onDelete={() => dispatch({ type: "DELETE_CUSTOM_KINK", id: kink.id })}
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
