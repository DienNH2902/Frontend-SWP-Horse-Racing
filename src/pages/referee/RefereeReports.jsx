import {
    Button,
    Card,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Table,
    message,
} from "antd";
import { useState } from "react";

const initialReports = [
    {
        id: 1,
        race: "Golden Cup",
        type: "Rule Violation",
        reason: "Horse changed lane unexpectedly",
        createdAt: "2026-06-10",
    },
    {
        id: 2,
        race: "Summer Derby",
        type: "Suspicious Result",
        reason: "Unexpected ranking change",
        createdAt: "2026-06-08",
    },
];

export default function RefereeReports() {
    const [reports, setReports] = useState(initialReports);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    function handleCreate(values) {
        const newReport = {
            id: Date.now(),
            race: values.race,
            type: values.type,
            reason: values.reason,
            createdAt: new Date().toLocaleDateString(),
        };

        setReports((prev) => [newReport, ...prev]);

        message.success("Report created");

        setOpen(false);
        form.resetFields();
    }

    const columns = [
        {
            title: "Race",
            dataIndex: "race",
        },
        {
            title: "Type",
            dataIndex: "type",
        },
        {
            title: "Reason",
            dataIndex: "reason",
        },
        {
            title: "Created",
            dataIndex: "createdAt",
        },
    ];

    return (
        <Space
            direction="vertical"
            style={{ width: "100%" }}
        >
            <Card
                title="Referee Reports"
                extra={
                    <Button
                        type="primary"
                        onClick={() => setOpen(true)}
                    >
                        Create Report
                    </Button>
                }
            >
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={reports}
                />
            </Card>

            <Modal
                title="Create Report"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                >
                    <Form.Item
                        label="Race"
                        name="race"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Report Type"
                        name="type"
                        rules={[{ required: true }]}
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
                                    value: "Jockey Misconduct",
                                    label: "Jockey Misconduct",
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Reason"
                        name="reason"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
}