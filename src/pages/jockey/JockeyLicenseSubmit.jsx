import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  List,
  Modal,
  Spin,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createJockeyLicense,
  getMyJockeyLicenses,
  updateJockeyLicense,
  uploadJockeyLicenseFile,
} from "../../api/services/jockeyLicense.service";

const { Paragraph, Text, Title } = Typography;

function getUploadedUrl(data) {
  return data?.licenseUrl || data?.imageUrl || data?.url || data?.path || data;
}

function formatDate(value) {
  if (!value) return "N/A";

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : value;
}

function parseLicenseDate(value) {
  if (!value) return dayjs();

  const direct = dayjs(value);
  if (direct.isValid()) return direct;

  const [day, month, year] = String(value).split("/");
  const parsed = dayjs(`${year}-${month}-${day}`);

  return parsed.isValid() ? parsed : dayjs();
}

export default function JockeyLicenseSubmit() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(true);
  const [licensePreview, setLicensePreview] = useState("");
  const [editLicensePreview, setEditLicensePreview] = useState("");
  const [licenses, setLicenses] = useState([]);
  const [editingLicense, setEditingLicense] = useState(null);

  const loadLicenses = useCallback(async () => {
    setIsLoadingLicenses(true);

    try {
      const data = await getMyJockeyLicenses();
      setLicenses(Array.isArray(data) ? data : []);
    } catch (error) {
      messageApi.error(error.message || "Could not load your licenses");
    } finally {
      setIsLoadingLicenses(false);
    }
  }, [messageApi]);

  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  async function handleLicenseUpload({ file, onSuccess, onError }) {
    if (file.size > 10 * 1024 * 1024) {
      const error = new Error("License image must be smaller than 10MB");
      messageApi.error(error.message);
      onError(error);
      return;
    }

    setIsUploading(true);

    try {
      const data = await uploadJockeyLicenseFile(file);
      const url = getUploadedUrl(data);

      if (!url) {
        throw new Error("Invalid upload response");
      }

      form.setFieldsValue({ licenseUrl: url });
      setLicensePreview(url);
      messageApi.success("License image uploaded");
      onSuccess(data);
    } catch (error) {
      messageApi.error(error.message || "Could not upload license image");
      onError(error);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleEditLicenseUpload({ file, onSuccess, onError }) {
    if (file.size > 10 * 1024 * 1024) {
      const error = new Error("License image must be smaller than 10MB");
      messageApi.error(error.message);
      onError(error);
      return;
    }

    setIsEditUploading(true);

    try {
      const data = await uploadJockeyLicenseFile(file);
      const url = getUploadedUrl(data);

      if (!url) {
        throw new Error("Invalid upload response");
      }

      editForm.setFieldsValue({ licenseUrl: url });
      setEditLicensePreview(url);
      messageApi.success("License image uploaded");
      onSuccess(data);
    } catch (error) {
      messageApi.error(error.message || "Could not upload license image");
      onError(error);
    } finally {
      setIsEditUploading(false);
    }
  }

  function openEditModal(license) {
    setEditingLicense(license);
    setEditLicensePreview(license.licenseUrl || "");
    editForm.setFieldsValue({
      licenseCode: license.licenseCode || "",
      licenseUrl: license.licenseUrl || "",
      racingStartDate: parseLicenseDate(license.racingStartDate),
    });
  }

  async function handleEditSubmit(values) {
    const licenseId = editingLicense?.id || editingLicense?._id;

    if (!licenseId) {
      messageApi.error("Missing license id");
      return;
    }

    setIsUpdating(true);

    try {
      await updateJockeyLicense(licenseId, {
        licenseCode: values.licenseCode,
        licenseUrl: values.licenseUrl,
        racingStartDate: values.racingStartDate.format("DD/MM/YYYY"),
      });

      messageApi.success("License updated");
      setEditingLicense(null);
      setEditLicensePreview("");
      editForm.resetFields();
      await loadLicenses();
    } catch (error) {
      messageApi.error(error.message || "Could not update license");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleSubmit(values) {
    setIsSubmitting(true);

    try {
      await createJockeyLicense({
        licenseCode: values.licenseCode,
        licenseUrl: values.licenseUrl,
        racingStartDate: values.racingStartDate.format("DD/MM/YYYY"),
      });

      messageApi.success("License submitted");
      form.resetFields();
      setLicensePreview("");
      await loadLicenses();
    } catch (error) {
      messageApi.error(error.message || "Could not submit license");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {contextHolder}

      <Card>
        <Title level={3} style={{ marginTop: 0 }}>
          Submit jockey license
        </Title>
        <Paragraph type="secondary">
          Add your racing license details and upload a license image before
          submitting it for review.
        </Paragraph>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{
            licenseCode: "",
            licenseUrl: "",
            racingStartDate: dayjs(),
          }}
        >
          <Form.Item
            label="License code"
            name="licenseCode"
            rules={[{ required: true, message: "Enter license code" }]}
          >
            <Input placeholder="LIC-2026-9999" />
          </Form.Item>

          <Form.Item
            label="License image"
            name="licenseUrl"
            rules={[{ required: true, message: "Upload license image" }]}
          >
            <Input placeholder="License image URL" disabled />
          </Form.Item>

          <Upload
            name="file"
            accept="image/*"
            showUploadList={false}
            customRequest={handleLicenseUpload}
            disabled={isUploading}
          >
            <Button icon={<UploadOutlined />} loading={isUploading}>
              Upload license image
            </Button>
          </Upload>

          {licensePreview && (
            <div style={{ marginTop: 16 }}>
              <Image
                src={licensePreview}
                alt="License preview"
                width={220}
                style={{ borderRadius: 8, objectFit: "cover" }}
              />
            </div>
          )}

          <Form.Item
            label="Racing start date"
            name="racingStartDate"
            style={{ marginTop: 18 }}
            rules={[{ required: true, message: "Choose racing start date" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Submit license
          </Button>
        </Form>
      </Card>

      <Card>
        <Title level={3} style={{ marginTop: 0 }}>
          My licenses
        </Title>

        {isLoadingLicenses ? (
          <Spin />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={licenses}
            locale={{ emptyText: "No licenses submitted yet" }}
            renderItem={(license) => (
              <List.Item
                key={license.id || license._id || license.licenseCode}
                extra={
                  license.licenseUrl ? (
                    <Image
                      src={license.licenseUrl}
                      alt={`License ${license.licenseCode}`}
                      width={220}
                      height={140}
                      style={{
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #f0f0f0",
                      }}
                    />
                  ) : null
                }
                actions={
                  license.licenseUrl
                    ? [
                        <a
                          href={license.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          key="view-license"
                        >
                          View source file
                        </a>,
                        <Button
                          type="link"
                          key="edit-license"
                          onClick={() => openEditModal(license)}
                        >
                          Edit
                        </Button>,
                      ]
                    : [
                        <Button
                          type="link"
                          key="edit-license"
                          onClick={() => openEditModal(license)}
                        >
                          Edit
                        </Button>,
                      ]
                }
              >
                <List.Item.Meta
                  title={
                    <Text strong>
                      License Code: {license.licenseCode || "N/A"}
                    </Text>
                  }
                  description={`Racing Start Date: ${formatDate(
                    license.racingStartDate,
                  )}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={`Edit ${editingLicense?.licenseCode || "license"}`}
        open={Boolean(editingLicense)}
        onCancel={() => {
          setEditingLicense(null);
          setEditLicensePreview("");
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={isUpdating}
        okText="Save changes"
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          requiredMark={false}
          onFinish={handleEditSubmit}
        >
          <Form.Item
            label="License code"
            name="licenseCode"
            rules={[{ required: true, message: "Enter license code" }]}
          >
            <Input placeholder="LIC-2026-9999" />
          </Form.Item>

          <Form.Item
            label="License image"
            name="licenseUrl"
            rules={[{ required: true, message: "Upload license image" }]}
          >
            <Input placeholder="License image URL" disabled />
          </Form.Item>

          <Upload
            name="file"
            accept="image/*"
            showUploadList={false}
            customRequest={handleEditLicenseUpload}
            disabled={isEditUploading}
          >
            <Button icon={<UploadOutlined />} loading={isEditUploading}>
              Replace license image
            </Button>
          </Upload>

          {editLicensePreview && (
            <div style={{ marginTop: 16 }}>
              <Image
                src={editLicensePreview}
                alt="License preview"
                width={220}
                style={{ borderRadius: 8, objectFit: "cover" }}
              />
            </div>
          )}

          <Form.Item
            label="Racing start date"
            name="racingStartDate"
            style={{ marginTop: 18 }}
            rules={[{ required: true, message: "Choose racing start date" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
