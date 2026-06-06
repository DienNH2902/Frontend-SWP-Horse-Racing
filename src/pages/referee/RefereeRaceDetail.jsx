import { Card, Descriptions, Button, Space } from "antd";
import { useParams, Link } from "react-router-dom";
const race = {
    id: 1,
    name: "Golden Cup",
    track: "Track A",
    status: "Scheduled",
};

export default function RefereeRaceDetail() {
    const { id } = useParams();

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Card title={`Race Detail #${id}`}>
                <Descriptions column={1}>
                    <Descriptions.Item label="Race Name">
                        Demo Race
                    </Descriptions.Item>

                    <Descriptions.Item label="Track">
                        Golden Hoof Track
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                        Scheduled
                    </Descriptions.Item>

                    <Descriptions.Item label="Entrants">
                        8 Horses
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card>
                <Link to="/referee/races">
                    <Button>Back to Race List</Button>
                </Link>
            </Card>
        </Space>
    );
}