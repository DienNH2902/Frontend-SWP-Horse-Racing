import {
    Card,
    Table,
    Tag,
} from "antd";

const leaderboard = [
    {
        position: 1,
        horse: "Thunder",
        jockey: "John Smith",
    },
    {
        position: 2,
        horse: "Storm",
        jockey: "David Lee",
    },
    {
        position: 3,
        horse: "Black Shadow",
        jockey: "Michael Tan",
    },
];

export default function RefereeLeaderboard() {
    const columns = [
        {
            title: "Position",
            dataIndex: "position",
            render: (value) => {
                if (value === 1)
                    return <Tag color="gold">1st</Tag>;

                if (value === 2)
                    return <Tag color="blue">2nd</Tag>;

                if (value === 3)
                    return <Tag color="green">3rd</Tag>;

                return value;
            },
        },
        {
            title: "Horse",
            dataIndex: "horse",
        },
        {
            title: "Jockey",
            dataIndex: "jockey",
        },
    ];

    return (
        <Card title="Race Leaderboard">
            <Table
                rowKey="position"
                columns={columns}
                dataSource={leaderboard}
                pagination={false}
            />
        </Card>
    );
}