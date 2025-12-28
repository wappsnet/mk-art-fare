import { FC } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import { Box, Button, List, ListItem, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';

import { withKeys } from '@/utils/arrayHelpers.ts';

interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  fileList: File[];
  onChange: (files: File[]) => void;
  maxSize?: number;
}

const FileUpload: FC<FileUploadProps> = ({ multiple, accept, fileList, onChange, maxSize }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    onDrop: (acceptedFiles) => {
      onChange(multiple ? [...fileList, ...acceptedFiles] : acceptedFiles);
    },
  });

  const handleRemove = (index: number) => {
    onChange(fileList.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Button variant="outlined" startIcon={<UploadIcon />}>
          {isDragActive ? 'Drop files here' : 'Click or drag files to upload'}
        </Button>
      </Box>
      {fileList.length > 0 && (
        <List sx={{ mt: 2 }}>
          {withKeys(fileList).map((file, idx) => (
            <ListItem
              key={file._key}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemove(idx)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              {file.value.name} ({(file.value.size / 1024).toFixed(2)} KB)
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUpload;
