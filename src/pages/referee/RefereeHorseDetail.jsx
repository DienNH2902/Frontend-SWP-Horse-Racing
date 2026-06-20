import { Card, Descriptions } from "antd";
import { useParams } from "react-router-dom";

export default function RefereeHorseDetail() {
    const { id } = useParams();

    return (
        <Card title={`Horse #${id}`}>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">
                    Thunder
                </Descriptions.Item>

                <Descriptions.Item label="Age">
                    5
                </Descriptions.Item>

                <Descriptions.Item label="Breed">
                    Arabian
                </Descriptions.Item>

                <Descriptions.Item label="Gender">
                    Male
                </Descriptions.Item>

                <Descriptions.Item label="Owner">
                    Owner A
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
}