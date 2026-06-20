import { Card, Descriptions } from "antd";
import { useParams } from "react-router-dom";

export default function RefereeJockeyDetail() {
    const { id } = useParams();

    return (
        <Card title={`Jockey #${id}`}>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">
                    John Smith
                </Descriptions.Item>

                <Descriptions.Item label="Age">
                    28
                </Descriptions.Item>

                <Descriptions.Item label="Nationality">
                    Vietnam
                </Descriptions.Item>

                <Descriptions.Item label="Experience">
                    6 Years
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
}