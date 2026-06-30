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
                        value={
                            checked
                                ? "Disqualified"
                                : "Qualified"
                        }
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
                <Link
                    to={`/referee/horses/${record.horse.horseId}`}
                >
                    {record.horse.name}
                </Link>
            ),
        },
        {
            title: "Jockey",
            render: (_, record) =>
                record.jockey.fullName,
        },
        {
            title: "Status",
            render: () => (
                <Tag color="green">
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

            <Card title="Broadcast Status">
                <Tag
                    color={
                        broadcastStatus?.isBroadcasting
                            ? "green"
                            : "default"
                    }
                >
                    {broadcastStatus?.isBroadcasting
                        ? "Broadcasting"
                        : "Not Broadcasting"}
                </Tag>
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

            <Card title="Result Review">
                <Space orientation="vertical">
                    <Typography.Text>
                        Open the Result Review page to:
                        <br />
                        • Review Raw Results
                        <br />
                        • Write Referee Report
                        <br />
                        • Confirm race result
                    </Typography.Text>

                    <Button
                        type="primary"
                        onClick={() => setReviewOpen(true)}
                    >
                        Open Result Review
                    </Button>
                </Space>
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
                                            onClick={
                                                handleConfirmFinalResult
                                            }
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
        </Space>
    );
}

