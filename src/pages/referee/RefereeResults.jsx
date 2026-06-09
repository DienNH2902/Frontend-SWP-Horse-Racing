import {
    Button,
    Card,
    InputNumber,
    Space,
    Table,
    message,
} from "antd";
import { useState } from "react";

const initialData = [
    {
        id: 1,
        horse: "Thunder",
        jockey: "John Smith",
        finishTime: 0,
        rank: null,
    },
    {
        id: 2,
        horse: "Storm",
        jockey: "David Lee",
        finishTime: 0,
        rank: null,
    },
    {
        id: 3,
        horse: "Black Shadow",
        jockey: "Michael Tan",
        finishTime: 0,
        rank: null,
    },
];

export default function RefereeResults() {
    const [results, setResults] = useState(initialData);

    function updateValue(id, field, value) {
        setResults((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    }

    function handleSubmit() {
        console.log(results);

        message.success(
            "Official result submitted successfully"
        );
    }

    const columns = [
        {
            title: "Horse",
            dataIndex: "horse",
        },
        {
            title: "Jockey",
            dataIndex: "jockey",
        },
        {
            title: "Finish Time (sec)",
            render: (_, record) => (
                <InputNumber
                    min={0}
                    value={record.finishTime}
                    onChange={(value) =>
                        updateValue(
                            record.id,
                            "finishTime",
                            value
                        )
                    }
                />
            ),
        },
        {
            title: "Rank",
            render: (_, record) => (
                <InputNumber
                    min={1}
                    value={record.rank}
                    onChange={(value) =>
                        updateValue(
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
        <Card
            title="Submit Official Result"
            extra={
                <Button
                    type="primary"
                    onClick={handleSubmit}
                >
                    Submit Result
                </Button>
            }
        >
            <Table
                rowKey="id"
                columns={columns}
                dataSource={results}
                pagination={false}
            />
        </Card>
    );
}