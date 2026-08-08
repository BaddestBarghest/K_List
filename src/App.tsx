import { useRef, useState } from "react";
import { ColorPicker, ConfigProvider, Layout, Space, Switch, Typography, theme as antTheme } from "antd";
import { useAppStore } from "./store/AppStore";
import { AgeGate } from "./components/AgeGate";
import { AllKinksList } from "./components/AllKinksList";
import { Board } from "./components/Board";
import { ListManager } from "./components/ListManager";
import { CategoryManager } from "./components/CategoryManager";
import { AddKinkForm } from "./components/AddKinkForm";
import { ExportImport } from "./components/ExportImport";

const { Header, Content } = Layout;
const { Title } = Typography;

function AppShell() {
  const { state, dispatch } = useAppStore();
  const [editMode, setEditMode] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const headerTextColor = state.theme.darkMode ? "#fff" : undefined;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AgeGate />
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          height: "auto",
          padding: "12px 24px",
        }}
      >
        <Title level={3} style={{ margin: 0, color: headerTextColor }}>
          K-List
        </Title>
        <Space align="center" wrap>
          <span style={{ color: headerTextColor }}>Edit mode</span>
          <Switch checked={editMode} onChange={setEditMode} />
          <span style={{ color: headerTextColor }}>Accent</span>
          <ColorPicker
            size="small"
            value={state.theme.accentColor}
            onChangeComplete={(color) => dispatch({ type: "SET_THEME", patch: { accentColor: color.toHexString() } })}
          />
          <span style={{ color: headerTextColor }}>Dark mode</span>
          <Switch
            checked={state.theme.darkMode}
            onChange={(darkMode) => dispatch({ type: "SET_THEME", patch: { darkMode } })}
          />
        </Space>
      </Header>
      <Content style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <ExportImport boardRef={boardRef} />
        </div>
        {editMode && (
          <>
            <ListManager />
            <CategoryManager />
            <AddKinkForm />
          </>
        )}
        <AllKinksList editMode={editMode} />
        <Title level={4}>Lists</Title>
        <div ref={boardRef}>
          <Board editMode={editMode} />
        </div>
      </Content>
    </Layout>
  );
}

export default function App() {
  const { state } = useAppStore();
  const { darkMode, accentColor } = state.theme;
  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: darkMode
          ? {
              colorPrimary: accentColor,
              colorBgLayout: "#1a1a1a",
              colorBgContainer: "#2a2a2a",
              colorBgElevated: "#2a2a2a",
            }
          : {
              colorPrimary: accentColor,
              colorBgLayout: "#fffcf2",
              colorBgContainer: "#ccc5b9",
              colorBgElevated: "#ccc5b9",
            },
        components: {
          Layout: darkMode
            ? { headerBg: "#1a1a1a", bodyBg: "#1a1a1a" }
            : { headerBg: "#fffcf2", bodyBg: "#fffcf2" },
        },
      }}
    >
      <AppShell />
    </ConfigProvider>
  );
}
