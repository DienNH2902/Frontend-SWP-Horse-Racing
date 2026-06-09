import {
    Alert,
    Button,
    Card,
    Descriptions,
    Form,
    Input,
    InputNumber,
    message,
    Select,
    Space,
    Table,
    Tag,
} from "antd";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const { TextArea } = Input;
function getRaceStatusColor(status) {
    switch (status) {
        case "Scheduled":
            return "blue";
        case "Live":
            return "red";
        case "Finished":
            return "green";
        default:
            return "default";
    }
}

export default function RefereeRaceDetail() {
    const { id } = useParams();

    const [messageApi, contextHolder] = message.useMessage();

    const race = {
        id,
        code: "RC-2026-001",
        name: "Golden Cup Championship",
        status: "Scheduled",
        startTime: "2026-06-10 09:00",
        distance: "2000m",
    };

    const track = {
        name: "Golden Hoof Track",
        location: "Ho Chi Minh City",
        type: "Turf",
        distance: "2000m",
        capacity: 5000,
    };

    const condition = {
        weather: "Sunny",
        trackCondition: "Dry",
        windSpeed: "10 km/h",
        temperature: "31°C",
    };

    const participants = [
        {
            id: 1,
            lane: 1,
            number: "001",
            horse: "Thunder",
            owner: "Nguyen Van A",
            jockey: "John Smith",
            registrationStatus: "Approved",
        },
        {
            id: 2,
            lane: 2,
            number: "002",
            horse: "Storm",
            owner: "Tran Van B",
            jockey: "David Lee",
            registrationStatus: "Approved",
        },
        {
            id: 3,
            lane: 3,
            number: "003",
            horse: "Black Shadow",
            owner: "Le Van C",
            jockey: "Michael Tan",
            registrationStatus: "Approved",
        },
    ];

    const leaderboard = [
        {
            position: 1,
            horse: "Thunder",
            finishTime: "120.35s",
        },
        {
            position: 2,
            horse: "Storm",
            finishTime: "121.82s",
        },
        {
            position: 3,
            horse: "Black Shadow",
            finishTime: "123.12s",
        },
    ];

    const [results, setResults] = useState({});
    function updateResult(id, field, value) {
        setResults((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    }

    const [reportForm] = Form.useForm();

    function submitResult() {
        const count = Object.keys(results).length;

        if (count === 0) {
            messageApi.warning(
                "Please enter race results first."
            );
            return;
        }

        console.log(results);

        messageApi.success(
            "Official race result submitted successfully"
        );
    }

    function submitReport(values) {
        console.log(values);

        messageApi.success(
            "Referee report submitted successfully"
        );

        reportForm.resetFields();
    }

    const participantColumns = [
        {
            title: "No.",
            dataIndex: "number",
        },
        {
            title: "Lane",
            dataIndex: "lane",
        },
        {
            title: "Horse",
            dataIndex: "horse",
        },
        {
            title: "Owner",
            dataIndex: "owner",
        },
        {
            title: "Jockey",
            dataIndex: "jockey",
        },
        {
            title: "Registration",
            dataIndex: "registrationStatus",
            render: (value) => (
                <Tag color="green">{value}</Tag>
            ),
        },
    ];

    const leaderboardColumns = [
        {
            title: "Position",
            dataIndex: "position",
        },
        {
            title: "Horse",
            dataIndex: "horse",
        },
        {
            title: "Finish Time",
            dataIndex: "finishTime",
        },
    ];

    const resultColumns = [
        {
            title: "Horse",
            dataIndex: "horse",
        },
        {
            title: "Finish Time",
            render: (_, record) => (
                <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: 120 }}
                    onChange={(value) =>
                        updateResult(
                            record.id,
                            "finishTime",
                            value
                        )
                    }
                />
            ),
        },
        {
            title: "Final Rank",
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={participants.length}
                    onChange={(value) =>
                        updateResult(
                            record.id,
                            "rank",
                            value
                        )
                    }
                />
            ),
        },
    ];

    return (
        <Space
            direction="vertical"
            size={16}
            style={{ width: "100%" }}
        >
            {contextHolder}

            <Alert
                type="info"
                showIcon
                message="Referee Workspace"
                description="Review race information, verify participants, submit official results and create reports."
            />

            <Card
                title={`Race Detail #${id}`}
                extra={
                    <Tag color={getRaceStatusColor(race.status)}>
                        {race.status}
                    </Tag>
                }
            >
                <Descriptions column={2}>
                    <Descriptions.Item label="Race Name">
                        {race.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Distance">
                        {race.distance}
                    </Descriptions.Item>

                    <Descriptions.Item label="Start Time">
                        {race.startTime}
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                        {race.status}
                    </Descriptions.Item>

                    <Descriptions.Item label="Race Code">
                        {race.code}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Track Information">
                <Descriptions column={2}>
                    <Descriptions.Item label="Track Name">
                        {track.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Location">
                        {track.location}
                    </Descriptions.Item>

                    <Descriptions.Item label="Track Type">
                        {track.type}
                    </Descriptions.Item>

                    <Descriptions.Item label="Distance">
                        {track.distance}
                    </Descriptions.Item>

                    <Descriptions.Item label="Capacity">
                        {track.capacity}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Race Conditions">
                <Descriptions column={2}>
                    <Descriptions.Item label="Weather">
                        {condition.weather}
                    </Descriptions.Item>

                    <Descriptions.Item label="Track Condition">
                        {condition.trackCondition}
                    </Descriptions.Item>

                    <Descriptions.Item label="Wind Speed">
                        {condition.windSpeed}
                    </Descriptions.Item>

                    <Descriptions.Item label="Temperature">
                        {condition.temperature}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Participants">
                <Table
                    rowKey="id"
                    columns={participantColumns}
                    dataSource={participants}
                    pagination={false}
                />
            </Card>

            <Card title="Current Leaderboard">
                <Table
                    rowKey="position"
                    columns={leaderboardColumns}
                    dataSource={leaderboard}
                    pagination={false}
                />
            </Card>

            <Card
                title="Submit Official Result"
                extra={
                    <Button
                        type="primary"
                        onClick={submitResult}
                    >
                        Submit Result
                    </Button>
                }
            >
                <Table
                    rowKey="id"
                    columns={resultColumns}
                    dataSource={participants}
                    pagination={false}
                />
            </Card>

            <Card title="Create Referee Report">
                <Form
                    layout="vertical"
                    form={reportForm}
                    onFinish={submitReport}
                >
                    <Form.Item
                        label="Report Type"
                        name="type"
                        rules={[
                            {
                                required: true,
                                message: "Select report type",
                            },
                        ]}
                    >
                        <Select
                            options={[
                                {
                                    value: "Rule Violation",
                                    label: "Rule Violation",
                                },
                                {
                                    value: "Suspicious Result",
                                    label: "Suspicious Result",
                                },
                                {
                                    value: "Horse Misconduct",
                                    label: "Horse Misconduct",
                                },
                                {
                                    value: "Jockey Misconduct",
                                    label: "Jockey Misconduct",
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Reason"
                        name="reason"
                        rules={[
                            {
                                required: true,
                                message: "Enter reason",
                            },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Describe the issue..."
                        />
                    </Form.Item>

                    <Form.Item
                        label="Severity"
                        name="severity"
                        rules={[
                            {
                                required: true,
                                message: "Select severity",
                            },
                        ]}
                    >

                        <Form.Item
                            label="Additional Notes"
                            name="notes"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Additional comments..."
                            />
                        </Form.Item>

                        <Select
                            options={[
                                {
                                    value: "Low",
                                    label: "Low",
                                },
                                {
                                    value: "Medium",
                                    label: "Medium",
                                },
                                {
                                    value: "High",
                                    label: "High",
                                },
                            ]}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        danger
                        htmlType="submit"
                    >
                        Submit Report
                    </Button>
                </Form>
            </Card>

            <Card>
                <Link to="/referee/races">
                    <Button>
                        Back to Race List
                    </Button>
                </Link>
            </Card>
        </Space>
    );
}