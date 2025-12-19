import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';

interface FileFieldProps {
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  isImage?: boolean;
}

export const FileField = ({ onChange, disabled, isImage = false }: FileFieldProps) => {
  const handleChange = (info: UploadChangeParam) => {
    if (info.fileList.length > 0) {
      onChange?.(info.fileList[0]);
    } else {
      onChange?.(null);
    }
  };

  return (
    <Upload
      listType={isImage ? 'picture-card' : 'text'}
      onChange={handleChange}
      disabled={disabled}
      maxCount={1}
      beforeUpload={() => false}
    >
      <Button icon={<UploadOutlined />} disabled={disabled}>
        Upload {isImage ? 'Image' : 'File'}
      </Button>
    </Upload>
  );
};
