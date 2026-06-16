import { Card, Descriptions } from "antd";
import { useParams } from "react-router-dom";

export default function RefereeOwnerDetail() {
    const { id } = useParams();

    return (
        <Card title={`Owner #${id}`}>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">
                    Owner A
                </Descriptions.Item>

                <Descriptions.Item label="Stable">
                    Golden Stable
                </Descriptions.Item>

                <Descriptions.Item label="Phone">
                    0901234567
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                    owner@example.com
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
}