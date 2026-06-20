import {
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Form,
    Input,
    InputNumber,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Timeline,
    Typography,
    message,
    Select,
    Popconfirm,
} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    RocketOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
    getRaceById,
    confirmRaceReady,
} from "../../api/services/race.service";

import {
    createRaceCondition,
    getRaceCondition,
    updateRaceCondition,
} from "../../api/services/raceCondition.service";

import {
    runSimulation,
    getSimulationResult,
} from "../../api/services/simulation.service";

import {
    createEndReport,
} from "../../api/services/refereeReport.service";

import { getUserById } from "../../api/services/user.service";
import { getRaceCourseById } from "../../api/services/race-course.service";

function statusColor(status) {
    switch (status) {
        case "Scheduled":
            return "blue";

        case "Ready":
            return "gold";

        case "InProgress":
            return "processing";

        case "Finished":
            return "green";

        case "Cancelled":
            return "red";

        default:
            return "default";
    }
}

function trackConditionColor(condition) {
    switch (condition) {
        case "Good":
            return "green";

        case "Firm":
            return "blue";

        case "Soft":
            return "orange";

        case "Heavy":
            return "red";

        default:
            return "default";
    }
}

export default function RefereeRaceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [condition, setCondition] = useState(null);

    const [race, setRace] = useState(null);

    const [referee, setReferee] = useState(null);
    const [raceCourse, setRaceCourse] = useState(null);

    const [simulation, setSimulation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [savingCondition, setSavingCondition] =
        useState(false);

    const [runningSimulation, setRunningSimulation] =
        useState(false);

    const [confirmingReady, setConfirmingReady] =
        useState(false);

    const [reportLoading, setReportLoading] =
        useState(false);


    const [conditionForm] =
        Form.useForm();

    const [reportForm] =
        Form.useForm();

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    async function loadData() {
        try {
            setLoading(true);

            const raceData = await getRaceById(id);

            setRace(raceData);

            const promises = [];

            if (raceData.refereeId) {
                promises.push(
                    getUserById(raceData.refereeId)
                );
            } else {
                promises.push(
                    Promise.resolve(null)
                );
            }

            if (raceData.raceCourseId) {
                promises.push(
                    getRaceCourseById(
                        raceData.raceCourseId
                    )
                );
            } else {
                promises.push(
                    Promise.resolve(null)
                );
            }

            promises.push(
                getRaceCondition(id).catch(
                    () => null
                )
            );

            promises.push(
                getSimulationResult(id).catch(
                    () => null
                )
            );

            const [
                refereeData,
                raceCourseData,
                conditionData,
                simulationData,
            ] = await Promise.all(promises);

            setReferee(refereeData);
            setRaceCourse(raceCourseData);

            if (conditionData) {
                setCondition(conditionData);

                conditionForm.setFieldsValue({
                    weather:
                        conditionData.weather,
                    trackCondition:
                        conditionData.trackCondition,
                    windSpeed:
                        conditionData.windSpeed,
                });
            }

            setSimulation(simulationData);
        } catch (error) {
            console.error(error);

            message.error(
                "Failed to load race."
            );
        } finally {
            setLoading(false);
        }
    }

    const participants =
        race?.horses || [];

    const participantColumns = [
        {
            title: "Horse",
            render: (_, record) => (
                <Link
                    to={`/referee/horses/${record._id || record.id
                        }`}
                >
                    {record.name ||
                        record.horseName ||
                        "-"}
                </Link>
            ),
        },
        {
            title: "Breed",
            dataIndex: "breed",
        },
        {
            title: "Age",
            dataIndex: "age",
        },
        {
            title: "Gender",
            dataIndex: "gender",
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (status) => (
                <Tag>{status}</Tag>
            ),
        },
    ];

    const simulationColumns = [
        {
            title: "Rank",
            dataIndex: "rank",
        },
        {
            title: "Horse",
            dataIndex: "horseName",
        },
        {
            title: "Finish Time",
            dataIndex: "finishTime",
        },
    ];

    const handleSaveCondition =
        async (values) => {
            try {
                setSavingCondition(true);

                if (condition?._id) {
                    const updated =
                        await updateRaceCondition(
                            id,
                            values
                        );

                    setCondition(updated);
                } else {
                    const created =
                        await createRaceCondition({
                            raceId: id,
                            ...values,
                        });

                    setCondition(created);
                }

                message.success(
                    "Condition saved."
                );
            } catch (error) {
                message.error(
                    error.response?.data
                        ?.message ||
                    "Cannot save condition."
                );
            } finally {
                setSavingCondition(false);
            }
        };
    const handleConfirmReady =
        async () => {
            try {
                setConfirmingReady(true);

                if (!condition) {
                    return message.warning(
                        "Please create race condition first."
                    );
                }

                await confirmRaceReady(id);

                message.success(
                    "Race confirmed ready."
                );

                loadData();
            } catch (error) {
                message.error(
                    error.response?.data
                        ?.message ||
                    "Cannot confirm race."
                );
            } finally {
                setConfirmingReady(false);
            }
        };

    const handleRunSimulation =
        async () => {
            try {
                await runSimulation(id);

                await loadData();

                message.success(
                    "Simulation completed."
                );
            } catch (error) {
                message.error(
                    error.response?.data
                        ?.message ||
                    "Simulation failed."
                );
            } finally {
                setRunningSimulation(false);
            }
        };

    const handleSubmitReport =
        async (values) => {
            try {
                setReportLoading(true);

                await createEndReport(
                    id,
                    values
                );

                message.success(
                    "Report submitted."
                );
            } catch (error) {
                message.error(
                    error.response?.data
                        ?.message ||
                    "Cannot submit report."
                );
            } finally {
                setReportLoading(false);
            }
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
                    Race not found.
                </Typography.Text>
            </Card>
        );
    }

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
            <Card>
                <Space wrap>
                    <Button
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        Back
                    </Button>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadData}
                    >
                        Refresh
                    </Button>

                    <Button
                        type="primary"
                        icon={
                            <CheckCircleOutlined />
                        }
                        loading={
                            confirmingReady
                        }
                        disabled={
                            race.status !==
                            "Scheduled"
                        }
                        onClick={
                            handleConfirmReady
                        }
                    >
                        Confirm Ready
                    </Button>

                    <Popconfirm
                        title="Run simulation?"
                        description="This action cannot be undone."
                        onConfirm={
                            handleRunSimulation
                        }
                        okText="Run"
                        cancelText="Cancel"
                    >
                        <Button
                            type="primary"
                            icon={<RocketOutlined />}
                            loading={runningSimulation}
                            disabled={
                                race.status !== "Ready"
                            }
                        >
                            Run Simulation
                        </Button>
                    </Popconfirm>
                </Space>
            </Card>

            <Card title={race.name}>
                <Descriptions
                    bordered
                    column={2}
                >
                    <Descriptions.Item label="Status">
                        <Tag
                            color={statusColor(
                                race.status
                            )}
                        >
                            {race.status}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tournament">
                        {race.tournamentTitle}
                    </Descriptions.Item>

                    <Descriptions.Item label="Round">
                        {race.roundNumber}
                    </Descriptions.Item>

                    <Descriptions.Item label="Race Order">
                        {race.raceOrder}
                    </Descriptions.Item>

                    <Descriptions.Item label="Race Course">
                        {raceCourse ? (
                            <>
                                <div>
                                    {raceCourse.name}
                                </div>

                                <div>
                                    {raceCourse.location}
                                </div>

                                <div>
                                    {raceCourse.distance}m -{" "}
                                    {raceCourse.trackType}
                                </div>
                            </>
                        ) : (
                            "-"
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Referee">
                        {referee
                            ? `${referee.fullName}
                            (${referee.role})`
                            : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Date">
                        {new Date(
                            race.date
                        ).toLocaleDateString()}
                    </Descriptions.Item>

                    <Descriptions.Item label="Start Time">
                        {new Date(
                            race.startTime
                        ).toLocaleString()}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Horses"
                            value={participants.length}
                        />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Filled Slots"
                            value={race.filledSlots ?? 0}
                        />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Available Slots"
                            value={race.availableSlots ?? 0}
                        />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Bettors"
                            value={race.totalBettors ?? 0}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Participants">
                {participants.length ===
                    0 ? (
                    <Empty
                        description="No horses assigned."
                    />
                ) : (
                    <Table
                        rowKey={(record) =>
                            record._id ||
                            record.id
                        }
                        columns={
                            participantColumns
                        }
                        dataSource={
                            participants
                        }
                        pagination={false}
                    />
                )}
            </Card>

            <Card title="Current Condition">
                <Descriptions bordered column={3}>
                    <Descriptions.Item label="Weather">
                        {condition?.weather || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Wind Speed">
                        {condition?.windSpeed
                            ? `${condition.windSpeed} km/h`
                            : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Track">
                        {condition?.trackCondition ? (
                            <Tag
                                color={trackConditionColor(
                                    condition.trackCondition
                                )}
                            >
                                {condition.trackCondition}
                            </Tag>
                        ) : (
                            "-"
                        )}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Race Condition">
                <Form
                    form={conditionForm}
                    layout="vertical"
                    onFinish={
                        handleSaveCondition
                    }
                >
                    <Form.Item
                        label="Weather"
                        name="weather"
                    >
                        <Select
                            options={[
                                { value: "Sunny" },
                                { value: "Cloudy" },
                                { value: "Rainy" },
                                { value: "Snowy" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Wind Speed"
                        name="windSpeed"
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            addonAfter="km/h"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Track Condition"
                        name="trackCondition"
                    >
                        <Select
                            options={[
                                { value: "Good" },
                                { value: "Muddy" },
                                { value: "Soft" },
                                { value: "Heavy" },
                            ]}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={
                            savingCondition
                        }
                    >
                        Save Condition
                    </Button>
                </Form>
            </Card>

            <Card title="Timeline">
                <Timeline
                    items={[
                        {
                            color: "green",
                            children: `Created: ${race.createdAt
                                ? new Date(
                                    race.createdAt
                                ).toLocaleString()
                                : "-"
                                }`,
                        },
                        {
                            color:
                                race.refereeConfirmedAt
                                    ? "green"
                                    : "gray",
                            children: `Referee Confirmed: ${race.refereeConfirmedAt
                                ? new Date(
                                    race.refereeConfirmedAt
                                ).toLocaleString()
                                : "-"
                                }`,
                        },
                        {
                            color:
                                race.simulatedAt
                                    ? "green"
                                    : "gray",
                            children: `Simulated: ${race.simulatedAt
                                ? new Date(
                                    race.simulatedAt
                                ).toLocaleString()
                                : "-"
                                }`,
                        },
                    ]}
                />
            </Card>

            <Card title="Simulation Result">
                {!simulation ? (
                    <Empty
                        description="Simulation has not been run."
                    />
                ) : (
                    <Table
                        rowKey={(record) =>
                            record.rank ||
                            record.id
                        }
                        columns={
                            simulationColumns
                        }
                        dataSource={
                            simulation.results ||
                            simulation.rankings ||
                            simulation.rawResult ||
                            []
                        }
                        pagination={false}
                    />
                )}
            </Card>

            <Card title="End Report">
                <Form
                    form={reportForm}
                    layout="vertical"
                    onFinish={
                        handleSubmitReport
                    }
                >
                    <Form.Item
                        label="Incident"
                        name="incident"
                    >
                        <Input.TextArea
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Comment"
                        name="comment"
                    >
                        <Input.TextArea
                            rows={4}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={
                            reportLoading
                        }
                        disabled={
                            race.status !==
                            "Finished"
                        }
                    >
                        Submit Report
                    </Button>
                </Form>
            </Card>
        </Space>
    );
}

