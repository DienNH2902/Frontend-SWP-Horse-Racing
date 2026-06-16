import {
    Button,
    Card,
    Descriptions,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Table,
    Typography,
    Spin,
    message,
} from "antd";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getRaceById } from "../../api/services/race.service";

export default function RefereeRaceDetail() {
    const { id } = useParams();

    const [race, setRace] = useState(null);
    const [loading, setLoading] = useState(true);

    const [violationForm] = Form.useForm();

    const participants = [
        {
            id: 1,
            horseId: 1,
            jockeyId: 1,
            ownerId: 1,
            horse: "Thunder",
            jockey: "John Smith",
            owner: "Owner A",
        },
        {
            id: 2,
            horseId: 2,
            jockeyId: 2,
            ownerId: 2,
            horse: "Storm",
            jockey: "David Lee",
            owner: "Owner B",
        },
        {
            id: 3,
            horseId: 3,
            jockeyId: 3,
            ownerId: 3,
            horse: "Lightning",
            jockey: "Tom Wilson",
            owner: "Owner C",
        },
    ];

    useEffect(() => {
        async function loadRace() {
            try {
                setLoading(true);

                const data = await getRaceById(id);

                console.log("Race Detail:", data);

                setRace(data);
            } catch (error) {
                console.error(error);

                message.error("Failed to load race detail");
            } finally {
                setLoading(false);
            }
        }

        loadRace();
    }, [id]);

    const participantColumns = [
        {
            title: "Horse",
            render: (_, record) => (
                <Link to={`/referee/horses/${record.horseId}`}>
                    {record.horse}
                </Link>
            ),
        },
        {
            title: "Jockey",
            render: (_, record) => (
                <Link to={`/referee/jockeys/${record.jockeyId}`}>
                    {record.jockey}
                </Link>
            ),
        },
        {
            title: "Owner",
            render: (_, record) => (
                <Link to={`/referee/owners/${record.ownerId}`}>
                    {record.owner}
                </Link>
            ),
        },
    ];

    const resultColumns = [
        {
            title: "Horse",
            dataIndex: "horse",
        },
        {
            title: "Finish Time",
            render: () => (
                <Input placeholder="00:01:35" />
            ),
        },
        {
            title: "Rank",
            render: () => (
                <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                />
            ),
        },
    ];

    const handleSaveViolation = (values) => {
        console.log("Violation:", values);

        message.success("Violation recorded");
    };

    const handleConfirmResult = () => {
        message.success("Results confirmed");
    };

    if (loading) {
        return (
            <Card>
                <Spin />
            </Card>
        );
    }

    if (!race) {
        return (
            <Card>
                <Typography.Text>
                    Race not found
                </Typography.Text>
            </Card>
        );
    }

    return (
        <Space
            direction="vertical"
            size={16}
            style={{ width: "100%" }}
        >
            <Card title={`Race Detail #${id}`}>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Race ID">
                        {race?._id || race?.id}
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                        {race?.status}
                    </Descriptions.Item>

                    <Descriptions.Item label="Tournament">
                        {race?.tournamentId}
                    </Descriptions.Item>

                    <Descriptions.Item label="Race Course">
                        {race?.raceCourseId}
                    </Descriptions.Item>

                    <Descriptions.Item label="Round">
                        {race?.round}
                    </Descriptions.Item>

                    <Descriptions.Item label="Referee">
                        {race?.refereeId}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Participants">
                <Table
                    rowKey="id"
                    pagination={false}
                    columns={participantColumns}
                    dataSource={participants}
                />
            </Card>

            <Card title="Race Violations">
                <Form
                    form={violationForm}
                    layout="vertical"
                    onFinish={handleSaveViolation}
                >
                    <Form.Item
                        label="Horse"
                        name="horseId"
                        rules={[
                            {
                                required: true,
                                message: "Please select a horse",
                            },
                        ]}
                    >
                        <Select
                            options={participants.map((item) => ({
                                label: item.horse,
                                value: item.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Violation Type"
                        name="type"
                        rules={[
                            {
                                required: true,
                                message: "Please enter violation type",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                    >
                        Save Violation
                    </Button>
                </Form>
            </Card>

            <Card title="Result Confirmation">
                <Table
                    rowKey="id"
                    pagination={false}
                    columns={resultColumns}
                    dataSource={participants}
                />

                <Button
                    type="primary"
                    style={{ marginTop: 16 }}
                    onClick={handleConfirmResult}
                >
                    Confirm Results
                </Button>
            </Card>

            <Card>
                <Typography.Text type="secondary">
                    Referee is responsible for reviewing race
                    participants, recording violations and
                    confirming official race results.
                </Typography.Text>
            </Card>
        </Space>
    );
}