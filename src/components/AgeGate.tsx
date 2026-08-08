import { Button, Modal, Typography } from "antd";
import { useAppStore } from "../store/AppStore";

const { Paragraph, Title } = Typography;

export function AgeGate() {
  const { state, dispatch } = useAppStore();

  return (
    <Modal
      open={!state.ageConfirmed}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      centered
      width={440}
    >
      <Title level={4}>Content warning</Title>
      <Paragraph>
        This site contains explicit descriptions of sexual and BDSM-related content intended
        for adults. By continuing, you confirm that you are at least 18 years old (or the age
        of majority in your jurisdiction) and wish to view this content.
      </Paragraph>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button
          onClick={() => {
            window.location.href = "https://www.google.com";
          }}
        >
          Leave
        </Button>
        <Button type="primary" onClick={() => dispatch({ type: "CONFIRM_AGE" })}>
          I am 18+ & Enter
        </Button>
      </div>
    </Modal>
  );
}
