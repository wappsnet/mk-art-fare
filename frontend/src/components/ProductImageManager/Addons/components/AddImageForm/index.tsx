import { ChangeEvent, useState, FC, ReactNode } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Button,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  IconButton,
  Typography,
} from '@mui/material';
import axios from 'axios';

import { useAddProductImageMutation } from '@/services/apiSlice';
import { ProductImage } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { withKeys } from '@/utils/arrayHelpers';
import { message } from '@/utils/notification';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface AddImageFormProps {
  productId: number;
  onImageAdded: (image: ProductImage | ProductImage[]) => void;
  onUpdate: () => void;
}

export const AddImageForm: FC<AddImageFormProps> = ({ productId, onImageAdded, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isThumbnail, setIsThumbnail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);

  const [addImage, { isLoading: adding }] = useAddProductImageMutation();

  const resetImageForm = () => {
    setImageUrl('');
    setAltText('');
    setIsThumbnail(false);
  };

  const resetUploadForm = () => {
    setFileList([]);
    setAltText('');
    setIsThumbnail(false);
  };

  const handleAddImage = async () => {
    if (!imageUrl) {
      message.error('Please enter an image URL');
      return;
    }

    try {
      const resp = await addImage({
        productId,
        data: {
          url: imageUrl,
          alt_text: altText || undefined,
          is_thumbnail: isThumbnail,
        },
      }).unwrap();

      message.success('Image added successfully!');

      if (resp.data) {
        onImageAdded(resp.data);
      }

      resetImageForm();
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to add image');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFileList((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSelected = async () => {
    if (fileList.length === 0) {
      message.error('Please select image file(s)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('images', file);
      formData.append('alt_text', '');
    });
    formData.append('is_thumbnail', isThumbnail.toString());

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      const resp = await axios.post(`${apiUrl}/products/${productId}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      message.success('Image(s) uploaded successfully!');

      const created = resp.data?.data;
      if (created) {
        onImageAdded(created);
      }

      resetUploadForm();
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Tabs
        variant="scrollable"
        scrollButtons="auto"
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        <Tab icon={<ImageIcon />} label="Upload File" iconPosition="start" />
        <Tab icon={<LinkIcon />} label="Image URL" iconPosition="start" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Stack spacing={3}>
          <Box>
            <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
              {'Select Image File(s)'}
              <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
            </Button>
            {fileList.length > 0 && (
              <List sx={{ mt: 2 }}>
                {withKeys(fileList).map((item, idx) => (
                  <ListItem
                    key={item._key}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveFile(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2">
                      {item.value.name} ({(item.value.size / 1024).toFixed(2)} KB)
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch checked={isThumbnail} onChange={(e) => setIsThumbnail(e.target.checked)} />
            }
            label="Set as thumbnail"
          />

          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleUploadSelected}
            disabled={fileList.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : `Upload Image(s)`}
          </Button>
        </Stack>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Stack spacing={3}>
          <TextField
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
          />

          <TextField
            label="Alt Text (optional)"
            placeholder="Description of the image"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch checked={isThumbnail} onChange={(e) => setIsThumbnail(e.target.checked)} />
            }
            label="Set as thumbnail"
          />

          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={handleAddImage}
            disabled={adding}
          >
            {adding ? 'Adding...' : 'Add Image'}
          </Button>
        </Stack>
      </TabPanel>
    </Box>
  );
};
