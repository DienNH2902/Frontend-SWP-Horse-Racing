import {
    Card,
    Descriptions,
    Spin,
    Typography,
    Image,
} from "antd";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
} from "react-router-dom";

import {
    getHorseById,
} from "../../api/services/horse.service";


export default function RefereeHorseDetail() {
    const { id } = useParams();

    const [horse, setHorse] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadHorse();
    }, [id]);

    async function loadHorse() {
        try {
            setLoading(true);

            const data =
                await getHorseById(id);

            setHorse(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Card>
                <Spin />
            </Card>
        );
    }

    if (!horse) {
        return (
            <Card>
                <Typography.Text>
                    Horse not found
                </Typography.Text>
            </Card>
        );
    }

    return (
        <Card title={horse.name}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 24,
                }}
            >
                <Image
                    src="/goldenhoof-hero.png"
                    alt={horse.name}
                    width={350}
                    style={{
                        borderRadius: 12,
                    }}
                />
            </div>

            <Descriptions
                bordered
                column={1}
            >
                <Descriptions.Item label="ID">
                    {horse._id}
                </Descriptions.Item>

                <Descriptions.Item label="Name">
                    {horse.name}
                </Descriptions.Item>

                <Descriptions.Item label="Color">
                    {horse.color}
                </Descriptions.Item>

                <Descriptions.Item label="Height">
                    {horse.height} m
                </Descriptions.Item>

                <Descriptions.Item label="Weight">
                    {horse.weight} kg
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                    {horse.horseStatus}
                </Descriptions.Item>

                <Descriptions.Item label="Win Rate">
                    {horse.winRate}%
                </Descriptions.Item>

                <Descriptions.Item label="Total Win">
                    {horse.totalWin}
                </Descriptions.Item>

                <Descriptions.Item label="Owner">
                    {horse.ownerName}
                </Descriptions.Item>

                <Descriptions.Item label="Owner Email">
                    {horse.ownerEmail}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
}