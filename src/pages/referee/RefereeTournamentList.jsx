import { useEffect, useMemo, useState } from "react";
import {
    Card,
    Input,
    Space,
    Table,
    Tag,
    Typography,
    message,
    Modal,
    Descriptions,
    List,
    Button,
    Spin,
    Avatar,
} from "antd";

import {
    getTournaments,
} from "../../api/services/tournament.service";

import {
    getRacesByTournament,
    getRaceById,
} from "../../api/services/race.service";
import { getRaceCourseById } from "../../api/services/race-course.service";
import { getHorseById } from "../../api/services/horse.service";
import { getUserById } from "../../api/services/user.service";

const { Text } = Typography;

export default function RefereeTournamentList() {
    const [loading, setLoading] =
        useState(false);

    const [tournaments, setTournaments] =
        useState([]);

    const [searchText, setSearchText] =
        useState("");

    const [raceCourseName, setRaceCourseName] =
        useState("");

    const [raceParticipants, setRaceParticipants] =
        useState([]);

    // Tournament modal
    const [
        selectedTournament,
        setSelectedTournament,
    ] = useState(null);

    const [
        tournamentModalOpen,
        setTournamentModalOpen,
    ] = useState(false);

    // Race modal
    const [selectedRace, setSelectedRace] =
        useState(null);

    const [raceModalOpen, setRaceModalOpen] =
        useState(false);

    const [raceLoading, setRaceLoading] =
        useState(false);

    useEffect(() => {
        loadTournaments();
    }, []);

    async function loadTournaments() {
        setLoading(true);

        try {
            const response =
                await getTournaments();

            const tournamentList =
                Array.isArray(response)
                    ? response
                    : response?.data || [];

            const enrichedData =
                await Promise.all(
                    tournamentList.map(
                        async (tournament) => {
                            try {
                                const races =
                                    await getRacesByTournament(
                                        tournament._id
                                    );

                                return {
                                    ...tournament,
                                    races,
                                };
                            } catch (error) {
                                console.error(
                                    error
                                );

                                return {
                                    ...tournament,
                                    races: [],
                                };
                            }
                        }
                    )
                );

            setTournaments(enrichedData);
        } catch (error) {
            console.error(error);

            message.error(
                "Failed to load tournaments"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleViewRace(raceId) {
        try {
            setRaceLoading(true);

            const race = await getRaceById(raceId);

            // Load Race Course
            let courseName = "-";

            if (race?.raceCourseId) {
                try {
                    const course =
                        await getRaceCourseById(
                            race.raceCourseId
                        );

                    courseName =
                        course?.name ||
                        course?.data?.name ||
                        "-";
                } catch (error) {
                    console.error(error);
                }
            }

            setRaceCourseName(courseName);

            // Load Participants
            const participants =
                race?.participants || [];

            const participantDetails =
                await Promise.all(
                    participants.map(
                        async (participant) => {
                            let horseName = "-";
                            let horseImage = "";
                            let jockeyName = "-";

                            try {
                                const horse =
                                    await getHorseById(
                                        participant.horseId
                                    );

                                horseName =
                                    horse?.name || "-";

                                horseImage =
                                    horse?.imageUrl ||
                                    "";
                            } catch (error) {
                                console.error(
                                    error
                                );
                            }

                            try {
                                const jockey =
                                    await getUserById(
                                        participant.jockeyId
                                    );

                                jockeyName =
                                    jockey?.fullName ||
                                    "-";
                            } catch (error) {
                                console.error(
                                    error
                                );
                            }

                            return {
                                gateNumber:
                                    participant.gateNumber,
                                horseName,
                                horseImage,
                                jockeyName,
                            };
                        }
                    )
                );

            setRaceParticipants(
                participantDetails
            );

            setSelectedRace(race);

            setRaceModalOpen(true);
        } catch (error) {
            console.error(error);

            message.error(
                "Failed to load race detail"
            );
        } finally {
            setRaceLoading(false);
        }
    }

    const filteredData = useMemo(() => {
        return tournaments.filter((item) =>
            (item?.title || "")
                .toLowerCase()
                .includes(
                    searchText.toLowerCase()
                )
        );
    }, [tournaments, searchText]);

    const columns = [
        {
            title: "Tournament",
            dataIndex: "title",
            key: "title",
            render: (value) => (
                <Text strong>
                    {value || "N/A"}
                </Text>
            ),
        },

        {
            title: "Race Names",
            key: "races",
            render: (_, record) => {
                if (
                    !record.races?.length
                ) {
                    return "-";
                }

                return (
                    <Space wrap>
                        {record.races.map(
                            (race) => (
                                <Tag
                                    key={
                                        race._id
                                    }
                                >
                                    {race.name}
                                </Tag>
                            )
                        )}
                    </Space>
                );
            },
        },

        {
            title: "Time",
            key: "time",
            render: (_, record) => (
                <div>
                    <div>
                        Start:
                        {" "}
                        {record.startDate
                            ? new Date(
                                record.startDate
                            ).toLocaleDateString()
                            : "-"}
                    </div>

                    <div>
                        End:
                        {" "}
                        {record.endDate
                            ? new Date(
                                record.endDate
                            ).toLocaleDateString()
                            : "-"}
                    </div>
                </div>
            ),
        },

        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color="blue">
                    {status ||
                        "Unknown"}
                </Tag>
            ),
        },

        {
            title: "Race Course",
            dataIndex: "location",
            key: "location",
            render: (value) =>
                value || "-",
        },

        {
            title: "Round",
            dataIndex: "totalRounds",
            key: "totalRounds",
            render: (value) =>
                value || "-",
        },

        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedTournament(
                            record
                        );

                        setTournamentModalOpen(
                            true
                        );
                    }}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <>
            <Space
                direction="vertical"
                style={{
                    width: "100%",
                }}
            >
                <Card title="Tournament List">
                    <Space
                        direction="vertical"
                        style={{
                            width: "100%",
                        }}
                    >
                        <Input.Search
                            placeholder="Search tournament"
                            allowClear
                            onChange={(e) =>
                                setSearchText(
                                    e.target
                                        .value
                                )
                            }
                        />

                        <Table
                            rowKey="_id"
                            loading={loading}
                            columns={columns}
                            dataSource={
                                filteredData
                            }
                            pagination={{
                                pageSize: 10,
                                showSizeChanger:
                                    true,
                            }}
                        />
                    </Space>
                </Card>
            </Space>

            {/* Tournament Modal */}

            <Modal
                open={
                    tournamentModalOpen
                }
                onCancel={() =>
                    setTournamentModalOpen(
                        false
                    )
                }
                footer={null}
                width={1000}
                title={
                    selectedTournament?.title
                }
            >
                {selectedTournament && (
                    <>
                        <Descriptions
                            bordered
                            column={2}
                        >
                            <Descriptions.Item label="Status">
                                {
                                    selectedTournament.status
                                }
                            </Descriptions.Item>

                            <Descriptions.Item label="Location">
                                {
                                    selectedTournament.location
                                }
                            </Descriptions.Item>

                            <Descriptions.Item label="Start Date">
                                {selectedTournament.startDate
                                    ? new Date(
                                        selectedTournament.startDate
                                    ).toLocaleString()
                                    : "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="End Date">
                                {selectedTournament.endDate
                                    ? new Date(
                                        selectedTournament.endDate
                                    ).toLocaleString()
                                    : "-"}
                            </Descriptions.Item>
                        </Descriptions>

                        <br />

                        <List
                            header={
                                <b>
                                    Race List
                                </b>
                            }
                            bordered
                            dataSource={
                                selectedTournament.races ||
                                []
                            }
                            renderItem={(
                                race
                            ) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="view"
                                            type="link"
                                            onClick={() =>
                                                handleViewRace(
                                                    race._id
                                                )
                                            }
                                        >
                                            View
                                            Race
                                            Detail
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            race.name
                                        }
                                        description={
                                            <>
                                                <div>
                                                    Status:
                                                    {" "}
                                                    {
                                                        race.status
                                                    }
                                                </div>

                                                <div>
                                                    Round:
                                                    {" "}
                                                    {
                                                        race.round
                                                    }
                                                </div>
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </>
                )}
            </Modal>

            {/* Race Detail Modal */}

            <Modal
                open={raceModalOpen}
                onCancel={() =>
                    setRaceModalOpen(
                        false
                    )
                }
                footer={null}
                width={1100}
                title={
                    selectedRace?.name ||
                    "Race Detail"
                }
            >
                {raceLoading ? (
                    <Spin />
                ) : (
                    selectedRace && (
                        <>
                            <Descriptions
                                bordered
                                column={2}
                            >
                                <Descriptions.Item label="Race Name">
                                    {selectedRace.name}
                                </Descriptions.Item>

                                <Descriptions.Item label="Status">
                                    {selectedRace.status}
                                </Descriptions.Item>

                                <Descriptions.Item label="Round">
                                    {selectedRace?.roundNumber ||
                                        "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Race Course">
                                    {raceCourseName ||
                                        "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Start Time">
                                    {selectedRace.startTime
                                        ? new Date(
                                            selectedRace.startTime
                                        ).toLocaleString()
                                        : "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Date">
                                    {selectedRace.date
                                        ? new Date(
                                            selectedRace.date
                                        ).toLocaleDateString()
                                        : "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Race Order">
                                    {selectedRace.raceOrder ||
                                        "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Total Slots">
                                    {selectedRace.totalSlots ||
                                        "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Filled Slots">
                                    {selectedRace.filledSlots ||
                                        "-"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Available Slots">
                                    {selectedRace.availableSlots ||
                                        "-"}
                                </Descriptions.Item>
                            </Descriptions>

                            <br />

                            <Typography.Title
                                level={5}
                            >
                                Participants
                            </Typography.Title>

                            <Table
                                rowKey={(record) =>
                                    record.gateNumber
                                }
                                pagination={false}
                                dataSource={
                                    raceParticipants
                                }
                                columns={[
                                    {
                                        title: "Gate",
                                        dataIndex:
                                            "gateNumber",
                                    },

                                    {
                                        title: "Horse",
                                        render: (
                                            _,
                                            record
                                        ) => (
                                            <Space>
                                                <Avatar
                                                    src={
                                                        record.horseImage
                                                    }
                                                    size={50}
                                                />

                                                <span>
                                                    {
                                                        record.horseName
                                                    }
                                                </span>
                                            </Space>
                                        ),
                                    },

                                    {
                                        title: "Jockey",
                                        dataIndex:
                                            "jockeyName",
                                    },
                                ]}
                            />
                        </>
                    )
                )}
            </Modal>
        </>
    );
}
