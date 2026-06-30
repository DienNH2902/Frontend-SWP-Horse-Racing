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
    Modal,
    Tabs,
} from "antd";
import {
    CheckCircleOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

import RefereeHorseDetailModal from "./RefereeHorseDetailModal";
import RefereeJockeyDetailModal from "./RefereeJockeyDetailModal";
import RefereeOwnerDetailModal from "./RefereeOwnerDetailModal";

import {
    getRaceById,
    confirmRaceReady,
    runSimulation,
    startRaceBroadcast,
    replayRaceBroadcast,
    getBroadcastStatus,
} from "../../api/services/race.service";

import {
    createRaceCondition,
    getRaceCondition,
    updateRaceCondition,
} from "../../api/services/raceCondition.service";


import {
    createEndReport,
} from "../../api/services/refereeReport.service";

import { getRaceCourseById } from "../../api/services/race-course.service";
import {
    getUserById,
} from "../../api/services/user.service";

import {
    getRawResults,
    getFinalResults,
    confirmRawResults,
} from "../../api/services/rawResult.service";

import {
    getTournamentParticipants,
} from "../../api/services/tournament.service";

function getHorseName(record) {
    return (
        participantMap[record.horseId]?.horse?.name ||
        horseMap[record.horseId] ||
        record.horseId
    );
}

function getJockeyName(record) {
    return (
        participantMap[record.horseId]?.jockey?.fullName ||
        jockeyMap[record.jockeyId] ||
        record.jockeyId
    );
}

function renderResultStatus(status) {
    return (
        <Tag
            color={
                status === "Confirmed"
                    ? "green"
                    : "red"
            }
        >
            {status}
        </Tag>
    );
}

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

    const [horseOpen, setHorseOpen] = useState(false);
    const [jockeyOpen, setJockeyOpen] = useState(false);
    const [ownerOpen, setOwnerOpen] = useState(false);

    const [selectedJockeyId, setSelectedJockeyId] = useState(null);
    const [selectedHorseId, setSelectedHorseId] = useState(null);

    const [condition, setCondition] = useState(null);

    const [reviewOpen, setReviewOpen] = useState(false);

    const [race, setRace] = useState(null);

    const [participants, setParticipants] = useState([]);

    const [referee, setReferee] = useState(null);

    const [raceCourse, setRaceCourse] = useState(null);

    const [rawResults, setRawResults] =
        useState([]);

    const [confirmLoading, setConfirmLoading] =
        useState(false);

    const [finalResults, setFinalResults] =
        useState([]);

    const [disqualifiedHorseIds, setDisqualifiedHorseIds] =
        useState([]);

    const [confirmingResult, setConfirmingResult] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [savingCondition, setSavingCondition] =
        useState(false);


    const [confirmingReady, setConfirmingReady] =
        useState(false);

    const [runningSimulation, setRunningSimulation] =
        useState(false);

    const [startingBroadcast, setStartingBroadcast] =
        useState(false);

    const [broadcastStatus, setBroadcastStatus] =
        useState(null);

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

    function validateReady() {
        if (!race.raceCourseId) {
            message.warning("Please assign a race course first.");
            return false;
        }

        if (participants.length < 2) {
            message.warning(
                "At least 2 horses must be registered."
            );
            return false;
        }

        if (
            !condition ||
            !condition.weather ||
            condition.windSpeed === undefined ||
            !condition.trackCondition
        ) {
            message.warning(
                "Please complete race conditions."
            );
            return false;
        }

        return true;
    }

    async function loadData() {
        try {
            setLoading(true);

            const raceData = await getRaceById(id);
            console.log(raceData);

            console.log("Race Data:", raceData);

            console.log(
                "Referee ID:",
                raceData.refereeId
            );

            console.log(
                "Race Course ID:",
                raceData.raceCourseId
            );

            setRace(raceData);

            const tournamentParticipants =
                await getTournamentParticipants(
                    raceData.tournamentId
                );

            const raceParticipants =
                tournamentParticipants.filter(
                    (item) => item.raceId === raceData._id
                );

            setParticipants(raceParticipants);

            console.log(raceParticipants.length);
            console.log(raceParticipants);

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
                getRawResults(id).catch(error => {
                    console.error("Raw Result", error);
                    return [];
                })
            );

            promises.push(
                getFinalResults(id).catch(
                    () => []
                )
            );

            promises.push(
                getBroadcastStatus(id).catch(
                    () => null
                )
            );

            const [
                refereeData,
                raceCourseData,
                conditionData,
                rawResultsData,
                finalResultsData,
                broadcastData,
            ] = await Promise.all(promises);

            console.log("Referee:", refereeData);
            console.log("Race Course:", raceCourseData);

            setReferee(refereeData);
            setRaceCourse(raceCourseData);
            setRawResults(rawResultsData || []);
            setFinalResults(finalResultsData || []);
            setBroadcastStatus(broadcastData);

            if (conditionData) {
                setCondition(conditionData);

                conditionForm.setFieldsValue({
                    weather: conditionData.weather,
                    trackCondition:
                        conditionData.trackCondition,
                    windSpeed:
                        conditionData.windSpeed,
                });
            }
        } catch (error) {
            console.error(error);

            message.error(
                "Failed to load race."
            );
        } finally {
            setLoading(false);
        }
    }

    const horseMap = useMemo(() => {
        return Object.fromEntries(
            participants.map((item) => [
                item.horse.horseId,
                item.horse.name,
            ])
        );
    }, [participants]);

    const jockeyMap = useMemo(() => {
        return Object.fromEntries(
            participants.map((item) => [
                item.jockey.jockeyId,
                item.jockey.fullName,
            ])
        );
    }, [participants]);


    const participantMap = useMemo(() => {
        return Object.fromEntries(
            participants.map((item) => [
                item.horse.horseId,
                item,
            ])
        );
    }, [participants]);

    const hasFinalResult = finalResults.length > 0;

    const renderHorse = (_, record) =>
        participantMap[record.horseId]?.horse?.name ||
        record.horseId;

    const renderJockey = (_, record) =>
        participantMap[record.horseId]?.jockey?.fullName ||
        record.jockeyId;

    const rawColumns = [
        {
            title: "Raw Rank",
            dataIndex: "rawRank",
        },
        {
            title: "Horse",
            render: renderHorse,
        },
        {
            title: "Jockey",
            render: renderJockey,
        },
        {
            title: "Finish Time",
            dataIndex: "finishedTime",
            render: (value) =>
                new Date(value).toLocaleString(),
        },
        {
            title: "Result",
            render: (_, record) => {

                const checked =
                    disqualifiedHorseIds.includes(
                        record.horseId
                    );

                return (
                    <Select
                        disabled={hasFinalResult}
                        value={checked ? "Disqualified" : "Qualified"}
                        style={{
                            width: 160,
                        }}
                        onChange={(value) => {

                            if (
                                value ===
                                "Disqualified"
                            ) {

                                setDisqualifiedHorseIds(
                                    (
                                        prev
                                    ) => [
                                            ...prev,
                                            record.horseId,
                                        ]
                                );

                            } else {

                                setDisqualifiedHorseIds(
                                    (
                                        prev
                                    ) =>
                                        prev.filter(
                                            (
                                                id
                                            ) =>
                                                id !==
                                                record.horseId
                                        )
                                );

                            }

                        }}
                        options={[
                            {
                                value:
                                    "Qualified",
                            },
                            {
                                value:
                                    "Disqualified",
                            },
                        ]}
                    />
                );

            },
        },
    ];

    const finalColumns = [
        {
            title: "Final Rank",
            dataIndex: "finalRank",
            sorter: (a, b) =>
                (a.finalRank || 999) -
                (b.finalRank || 999),
        },
        {
            title: "Horse",
            render: renderHorse,
        },
        {
            title: "Jockey",
            render: renderJockey,
        },
        {
            title: "Raw Rank",
            dataIndex: "rawRank",
        },
        {
            title: "Status",
            dataIndex: "status",
            render: renderResultStatus
        },
    ];


    const participantColumns = [
        {
            title: "Gate",
            dataIndex: "gateNumber",
        },
        {
            title: "Horse",
            render: (_, record) => (
                <Button
                    type="link"
                    style={{
                        padding: 0,
                        fontWeight: 600,
                    }}
                    onClick={() => {
                        setSelectedHorseId(record.horse.horseId);
                        setHorseOpen(true);
                    }}
                >
                    {record.horse.name}
                </Button>
            ),
        },
        {
            title: "Jockey",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedJockeyId(record.jockey.jockeyId);
                        setJockeyOpen(true);
                    }}
                >
                    {record.jockey.fullName}
                </Button>
            )
        },
        {
            title: "Owner",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedHorseId(record.horse.horseId);
                        setOwnerOpen(true);
                    }}
                >
                    View Owner
                </Button>
            )
        },
        {
            title: "Status",
            render: () => (
                <Tag color="success">
                    Assigned
                </Tag>
            ),
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

    const handleConfirmReady = async () => {
        if (!validateReady()) return;

        try {
            setConfirmingReady(true);

            await confirmRaceReady(id);

            message.success("Race confirmed ready.");

            loadData();
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                "Cannot confirm race."
            );
        } finally {
            setConfirmingReady(false);
        }
    };

    const handleRunSimulation = async () => {
        try {
            setRunningSimulation(true);

            await runSimulation(id);

            message.success(
                "Simulation completed successfully."
            );

            await loadData();
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                "Cannot run simulation."
            );
        } finally {
            setRunningSimulation(false);
        }
    };

    const handleStartBroadcast =
        async () => {
            try {
                setStartingBroadcast(true);

                await startRaceBroadcast(id);

                message.success(
                    "Broadcast started."
                );

                await loadData();
            } catch (error) {
                message.error(
                    error.response?.data?.message ||
                    "Cannot start broadcast."
                );
            } finally {
                setStartingBroadcast(false);
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

    const handleConfirmFinalResult = async () => {

        try {

            setConfirmLoading(true);

            console.log("Race:", id);

            console.log(disqualifiedHorseIds);

            const result =
                await confirmRawResults(
                    id,
                    disqualifiedHorseIds
                );

            console.log(result);

            message.success(result.message);

            setFinalResults(result.finalRankings);

            await loadData();

        } catch (error) {

            console.log(error.response?.data);

            message.error(
                error.response?.data?.message ??
                "Cannot confirm result."
            );

        } finally {

            setConfirmLoading(false);

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

    return (
        <Space
            orientation="vertical"
        >
            <Card
                style={{
                    borderRadius: 16,
                    marginBottom: 16,
                }}
            >
                <Space
                    direction="vertical"
                    size={8}
                >
                    <Typography.Title
                        level={2}
                        style={{ margin: 0 }}
                    >
                        {race.name}
                    </Typography.Title>

                    <Typography.Text type="secondary">
                        {race.tournamentTitle}
                    </Typography.Text>

                    <Space wrap>
                        <Tag color={statusColor(race.status)}>
                            {race.status}
                        </Tag>

                        <Tag color="blue">
                            Round {race.roundNumber}
                        </Tag>

                        <Tag color="purple">
                            Race #{race.raceOrder}
                        </Tag>
                    </Space>
                </Space>
            </Card>

            <Card
                style={{
                    borderRadius: 16,
                    marginBottom: 16,
                }}
            >
                <Space wrap>
                    <Button onClick={() => navigate(-1)}>
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
                        icon={<CheckCircleOutlined />}
                        loading={confirmingReady}
                        disabled={race.status !== "Scheduled"}
                        onClick={handleConfirmReady}
                    >
                        Confirm Ready
                    </Button>

                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        loading={runningSimulation}
                        disabled={race.status !== "Ready"}
                        onClick={handleRunSimulation}
                    >
                        Run Simulation
                    </Button>

                    <Button
                        type="primary"
                        loading={startingBroadcast}
                        disabled={
                            race.status !== "Simulated" ||
                            broadcastStatus?.isBroadcasting
                        }
                        onClick={handleStartBroadcast}
                    >
                        Start Broadcast
                    </Button>
                </Space>
            </Card>

            <Card title="Race Information">
                <Descriptions
                    bordered
                    column={2}
                    size="middle"
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
                            <Space direction="vertical" size={0}>
                                <Typography.Text strong>
                                    {raceCourse.name}
                                </Typography.Text>

                                <Typography.Text type="secondary">
                                    {raceCourse.location}
                                </Typography.Text>

                                <Tag color="cyan">
                                    {raceCourse.distance} m
                                </Tag>

                                <Tag color="processing">
                                    {raceCourse.trackType}
                                </Tag>
                            </Space>
                        ) : (
                            "-"
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Referee">
                        <Space direction="vertical" size={0}>
                            <Typography.Text strong>
                                {referee.fullName}
                            </Typography.Text>

                            <Tag color="green">
                                {referee.role}
                            </Tag>
                        </Space>
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

            <Card
                title="Broadcast Status"
                style={{ borderRadius: 16 }}
            >
                <Badge
                    status={
                        broadcastStatus?.isBroadcasting
                            ? "success"
                            : "default"
                    }
                    text={
                        broadcastStatus?.isBroadcasting
                            ? "Broadcasting"
                            : "Not Broadcasting"
                    }
                />
            </Card>

            <Row gutter={16}>
                <Col span={6}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            textAlign: "center",
                        }}
                    >
                        <Statistic
                            title="Horses"
                            value={participants.length}
                        />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            textAlign: "center",
                        }}
                    >
                        <Statistic
                            title="Filled Slots"
                            value={race.filledSlots ?? 0}
                        />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            textAlign: "center",
                        }}
                    >
                        <Statistic
                            title="Available Slots"
                            value={race.availableSlots ?? 0}
                        />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            textAlign: "center",
                        }}
                    >
                        <Statistic
                            title="Total Bettors"
                            value={race.totalBettors ?? 0}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Participants"
                style={{ borderRadius: 16 }}
            >
                {participants.length ===
                    0 ? (
                    <Empty
                        description="No horses assigned."
                    />
                ) : (
                    <Table
                        bordered
                        size="middle"
                        rowKey={(record) => record.registrationId}
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

            <Card
                title="Current Race Condition"
                style={{ borderRadius: 16 }}
            >
                <Descriptions
                    bordered
                    column={3}
                    size="middle"
                >
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

            <Card
                title="Update Race Condition"
                style={{ borderRadius: 16 }}
            >
                <Form
                    form={conditionForm}
                    layout="vertical"
                    disabled={race.status !== "Scheduled"}
                    onFinish={handleSaveCondition}
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
                        loading={savingCondition}
                        size="large"
                    >
                        Save Condition
                    </Button>
                </Form>
            </Card>

            <Card
                title="Race Timeline"
                style={{ borderRadius: 16 }}
            >
                <Timeline mode="left"
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

            <Card
                style={{
                    borderRadius: 16,
                    textAlign: "center",
                }}
            >
                <Typography.Title level={4}>
                    Race Result Review
                </Typography.Title>

                <Typography.Paragraph type="secondary">
                    Review raw rankings, submit referee reports,
                    and confirm the final race results.
                </Typography.Paragraph>

                <Button
                    type="primary"
                    size="large"
                    onClick={() => setReviewOpen(true)}
                >
                    Open Review Center
                </Button>
            </Card>
            <Modal
                title="Result Review"
                open={reviewOpen}
                onCancel={() => setReviewOpen(false)}
                footer={null}
                width={1400}
            >
                <Tabs
                    items={[
                        {
                            key: "raw",
                            label: "Raw Results",
                            children: (
                                <>
                                    <Table
                                        rowKey="_id"
                                        columns={rawColumns}
                                        dataSource={rawResults}
                                        pagination={false}
                                    />

                                    <div
                                        style={{
                                            marginTop: 16,
                                            textAlign: "right",
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            loading={confirmLoading}
                                            disabled={hasFinalResult}
                                            onClick={handleConfirmFinalResult}
                                        >
                                            Confirm Final Result
                                        </Button>
                                    </div>
                                </>
                            ),
                        },
                        {
                            key: "report",
                            label: "Referee Report",
                            children: (
                                <Form
                                    form={reportForm}
                                    layout="vertical"
                                    onFinish={handleSubmitReport}
                                >
                                    <Form.Item
                                        name="summary"
                                        label="Summary"
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input.TextArea rows={4} />
                                    </Form.Item>

                                    <Form.Item
                                        name="note"
                                        label="Note"
                                    >
                                        <Input.TextArea rows={4} />
                                    </Form.Item>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={reportLoading}
                                    >
                                        Submit Report
                                    </Button>
                                </Form>
                            ),
                        },
                        {
                            key: "final",
                            label: "Final Results",
                            children: (
                                <Table
                                    rowKey="_id"
                                    columns={finalColumns}
                                    dataSource={finalResults}
                                    pagination={false}
                                />
                            ),
                        },
                    ]}
                />
            </Modal>
            <RefereeHorseDetailModal
                open={horseOpen}
                horseId={selectedHorseId}
                onClose={() => {
                    setHorseOpen(false);
                    setSelectedHorseId(null);
                }}
            />

            <RefereeJockeyDetailModal
                open={jockeyOpen}
                jockeyId={selectedJockeyId}
                onClose={() => {
                    setJockeyOpen(false);
                    setSelectedJockeyId(null);
                }} />

            <RefereeOwnerDetailModal
                open={ownerOpen}
                horseId={selectedHorseId}
                onClose={() => {
                    setOwnerOpen(false);
                    setSelectedHorseId(null);
                }}
            />
        </Space>
    );
}

