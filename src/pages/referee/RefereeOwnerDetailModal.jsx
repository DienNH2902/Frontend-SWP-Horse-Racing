import {
    Avatar,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Modal,
    Row,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
} from "antd";
import {
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

import { getHorseById } from "../../api/services/horse.service";
import { getUserById } from "../../api/services/user.service";
import "./RefereeOwnerDetailModal.css";

const { Title, Text } = Typography;

function genderText(gender) {
    return gender === 1 ? "Male" : "Female";
}

function statusColor(status) {
    switch (status) {
        case "Active":
            return "green";
        case "Inactive":
            return "red";
        default:
            return "default";
    }
}

export default function RefereeOwnerDetailModal({
    open,
    horseId,
    onClose,
}) {
    const [loading, setLoading] = useState(false);
    const [horse, setHorse] = useState(null);
    const [owner, setOwner] = useState(null);

    useEffect(() => {
        if (open && horseId) {
            loadOwner();
        }
    }, [open, horseId]);

    function horseStatusColor(status) {
        switch (status) {
            case "READY":
            case "Ready":
                return "green";

            case "IDLE":
                return "blue";

            case "RACING":
                return "processing";

            case "INACTIVE":
                return "red";

            default:
                return "default";
        }
    }

    async function loadOwner() {
        try {
            setLoading(true);

            const horseData = await getHorseById(horseId);
            setHorse(horseData);

            const ownerData = await getUserById(horseData.userId);
            setOwner(ownerData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            className="owner-modal"
            title="👤 Owner Profile"
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            destroyOnClose
        >
            {loading ? (
                <div className="owner-loading">
                    <Spin size="large" />
                </div>
            ) : !owner ? (
                <div className="owner-empty">
                    <Empty description="Owner not found" />
                </div>
            ) : (
                <>
                    <Card
                        bordered={false}
                        className="owner-hero-card"
                    >
                        <Row
                            gutter={[32, 24]}
                            align="middle"
                        >
                            <Col
                                xs={24}
                                md={6}
                                style={{ textAlign: "center" }}
                            >
                                <Avatar
                                    className="owner-avatar"
                                    size={170}
                                    src={owner.avatar}
                                    icon={<UserOutlined />}
                                />
                            </Col>

                            <Col
                                xs={24}
                                md={18}
                                className="owner-content"
                            >
                                <Title
                                    level={2}
                                    className="owner-name"
                                >
                                    {owner.fullName}
                                </Title>

                                <Text className="owner-id">
                                    ID: {owner._id}
                                </Text>

                                <Text className="owner-subtitle">
                                    Horse Owner Account
                                </Text>

                                <Space wrap>
                                    <Tag className="role-tag">
                                        {owner.role}
                                    </Tag>

                                    <Tag
                                        className="status-tag"
                                        color={statusColor(owner.status)}
                                    >
                                        {owner.status}
                                    </Tag>
                                </Space>

                                <Divider className="owner-divider" />

                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={8}>
                                        <Statistic
                                            className="owner-statistic"
                                            title="Owned Horse"
                                            value={horse?.name}
                                        />
                                    </Col>

                                    <Col xs={24} sm={8}>
                                        <Statistic
                                            className="owner-statistic"
                                            title="Horse Weight"
                                            value={horse?.weight}
                                            suffix="kg"
                                        />
                                    </Col>

                                    <Col xs={24} sm={8}>
                                        <Statistic
                                            className="owner-statistic"
                                            title="Horse Height"
                                            value={horse?.height}
                                            suffix="cm"
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card
                                className="owner-info-card"
                                title="Owner Information"
                                bordered={false}
                            >
                                <Descriptions
                                    className="owner-description"
                                    column={1}
                                    bordered
                                    size="middle"
                                >
                                    <Descriptions.Item
                                        label={
                                            <>
                                                <MailOutlined /> Email
                                            </>
                                        }
                                    >
                                        {owner.email}
                                    </Descriptions.Item>

                                    <Descriptions.Item
                                        label={
                                            <>
                                                <PhoneOutlined /> Phone
                                            </>
                                        }
                                    >
                                        {owner.phoneNumber}
                                    </Descriptions.Item>

                                    <Descriptions.Item
                                        label={
                                            <>
                                                <HomeOutlined /> Address
                                            </>
                                        }
                                    >
                                        {owner.address}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Birthday">
                                        {owner.dateOfBirth}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Gender">
                                        {genderText(owner.gender)}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Status">
                                        <Tag
                                            color={statusColor(
                                                owner.status
                                            )}
                                        >
                                            {owner.status}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card
                                className="owner-info-card"
                                title="Owned Horse"
                                bordered={false}
                            >
                                <Descriptions
                                    className="owner-description"
                                    column={1}
                                    bordered
                                    size="middle"
                                >
                                    <Descriptions.Item label="Horse Name">
                                        {horse?.name}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Horse Status">
                                        <Tag
                                            className="horse-status-tag"
                                            color={horseStatusColor(horse?.horseStatus)}
                                        >
                                            {horse?.horseStatus}
                                        </Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Color">
                                        {horse?.color}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Weight">
                                        {horse?.weight} kg
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Height">
                                        {horse?.height} cm
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Owner Email">
                                        <Text copyable>
                                            {horse?.ownerEmail}
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Modal>
    );
}