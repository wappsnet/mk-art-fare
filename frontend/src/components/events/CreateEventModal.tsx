import { useState, useEffect, FC } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Upload,
  InputNumber,
  Space,
  Divider,
  message,
  Row,
  Col,
  Card,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { eventService } from '@/services/eventService';
import { Event, TicketDeliveryMethod } from '@/types/common';
import { getErrorMessage } from '@/types/errors';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CreateEventModalProps {
  visible: boolean;
  event?: Event | null;
  organizationId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface TicketFormData {
  type: string;
  price?: number;
  quantity: number;
  description?: string;
  deliveryMethod?: TicketDeliveryMethod;
  pickupLocation?: string;
  pickupInstructions?: string;
}

interface CreateEventFormDataProps {
  title: string;
  description: string;
  eventType: string;
  venueName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  featuredImageUrl: string;
  videoUrl: string;
  tickets: TicketFormData[];
}

export const CreateEventModal: FC<CreateEventModalProps> = ({
  visible,
  event,
  organizationId,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm<CreateEventFormDataProps>();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (visible && event) {
      // Populate form with event data for editing
      const ticketsData: TicketFormData[] = (event.tickets || []).map((ticket) => ({
        type: ticket.ticket_type,
        price: Number.parseFloat(ticket.price),
        quantity: ticket.quantity_available,
        description: ticket.description,
        deliveryMethod: ticket.delivery_method,
        pickupLocation: ticket.pickup_location,
        pickupInstructions: ticket.pickup_instructions,
      }));

      form.setFieldsValue({
        title: event.title,
        description: event.description,
        eventType: event.event_type,
        venueName: event.venue_name,
        addressLine1: event.address_line1,
        addressLine2: event.address_line2,
        city: event.city,
        state: event.state,
        country: event.country,
        postalCode: event.postal_code,
        dateRange: [dayjs(event.start_date), dayjs(event.end_date)],
        featuredImageUrl: event.featured_image_url,
        videoUrl: event.video_url,
        tickets: ticketsData,
      });
    } else if (visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, event, form]);

  const handleSubmit = async (values: CreateEventFormDataProps) => {
    setLoading(true);
    try {
      const formData = {
        organizationId: organizationId,
        title: values.title,
        description: values.description,
        eventType: values.eventType,
        venue: {
          name: values.venueName,
        },
        address: {
          line1: values.addressLine1,
          line2: values.addressLine2,
          city: values.city,
          state: values.state,
          country: values.country,
          postalCode: values.postalCode,
        },
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        featuredImageUrl: values.featuredImageUrl,
        videoUrl: values.videoUrl,
        tickets: values.tickets || [],
      };

      const files: File[] = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          files.push(file.originFileObj);
        }
      }

      if (event) {
        await eventService.updateEvent(event.id, formData, files);
        message.success('Event updated successfully! It will be reviewed by an admin.');
      } else {
        await eventService.createEvent(formData, files);
        message.success('Event created successfully! It will be reviewed by an admin.');
      }

      onSuccess();
    } catch (error) {
      message.error(getErrorMessage(error) || `Failed to ${event ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('You can only upload image or video files!');
      return Upload.LIST_IGNORE;
    }

    const maxSize = isVideo ? 100 : 10;
    const isLtMax = file.size / 1024 / 1024 < maxSize;

    if (!isLtMax) {
      message.error(`File must be smaller than ${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent automatic upload
  };

  return (
    <Modal
      title={event ? 'Edit Event' : 'Create Event'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Event Title"
          rules={[{ required: true, message: 'Please enter event title' }]}
        >
          <Input placeholder="e.g., Modern Art Exhibition" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Describe your event" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="eventType" label="Event Type">
              <Select placeholder="Select event type" size="large">
                <Option value="exhibition">Exhibition</Option>
                <Option value="workshop">Workshop</Option>
                <Option value="gallery">Gallery Opening</Option>
                <Option value="auction">Auction</Option>
                <Option value="talk">Artist Talk</Option>
                <Option value="fair">Art Fair</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateRange"
              label="Date & Time"
              rules={[{ required: true, message: 'Please select date range' }]}
            >
              <RangePicker showTime style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Venue Information</Divider>

        <Form.Item name="venueName" label="Venue Name">
          <Input placeholder="e.g., Metropolitan Museum" size="large" />
        </Form.Item>

        <Form.Item name="addressLine1" label="Address Line 1">
          <Input placeholder="Street address" size="large" />
        </Form.Item>

        <Form.Item name="addressLine2" label="Address Line 2">
          <Input placeholder="Apartment, suite, etc. (optional)" size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="city" label="City">
              <Input placeholder="City" size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="state" label="State/Province">
              <Input placeholder="State" size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="postalCode" label="Postal Code">
              <Input placeholder="ZIP Code" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="country" label="Country">
          <Input placeholder="Country" size="large" />
        </Form.Item>

        <Divider>Media</Divider>

        <Form.Item name="featuredImageUrl" label="Featured Image URL (optional)">
          <Input placeholder="https://..." size="large" />
        </Form.Item>

        <Form.Item name="videoUrl" label="Video URL (optional)">
          <Input placeholder="https://youtube.com/..." size="large" />
        </Form.Item>

        <Form.Item label="Upload Images/Videos (optional)">
          <Upload
            beforeUpload={beforeUpload}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            multiple
            maxCount={10}
            accept="image/*,video/*"
          >
            <Button icon={<UploadOutlined />}>Select Files (Max 10)</Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            Images: Max 10MB each | Videos: Max 100MB each
          </div>
        </Form.Item>

        <Divider>Tickets</Divider>

        <Form.List name="tickets">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        label="Ticket Type"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Input placeholder="e.g., General Admission" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item {...restField} name={[name, 'price']} label="Price">
                        <InputNumber
                          min={0}
                          precision={2}
                          placeholder="0.00"
                          prefix="$"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        label="Quantity"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <InputNumber min={1} placeholder="100" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item {...restField} name={[name, 'description']} label="Description">
                    <TextArea rows={2} placeholder="Ticket details" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'deliveryMethod']}
                        label="Delivery Method"
                      >
                        <Select placeholder="Select delivery method">
                          <Option value={TicketDeliveryMethod.VIRTUAL}>Virtual (Email)</Option>
                          <Option value={TicketDeliveryMethod.PICKUP}>Self Pickup</Option>
                          <Option value={TicketDeliveryMethod.PHYSICAL_DELIVERY}>
                            Physical Delivery
                          </Option>
                          <Option value={TicketDeliveryMethod.ALL}>All Methods</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'pickupLocation']}
                        label="Pickup Location (if applicable)"
                      >
                        <Input placeholder="Event venue" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Ticket Type
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
