import { FC, createContext, useContext, useState, ReactNode, useMemo } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  ButtonProps,
} from '@mui/material';

interface ConfirmOptions {
  title: string;
  content: string | ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonProps?: ButtonProps;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }
  return context;
};

export const ConfirmDialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    content: '',
  });

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
  };

  const handleConfirm = async () => {
    await options.onConfirm?.();
    setOpen(false);
  };

  const handleCancel = () => {
    options.onCancel?.();
    setOpen(false);
  };

  const context = useMemo(() => {
    return { confirm };
  }, [confirm]);

  return (
    <ConfirmDialogContext.Provider value={context}>
      {children}
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{options.title}</DialogTitle>
        <DialogContent>
          {typeof options.content === 'string' ? (
            <DialogContentText>{options.content}</DialogContentText>
          ) : (
            options.content
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>{options.cancelText || 'Cancel'}</Button>
          <Button onClick={handleConfirm} variant="contained" {...options.confirmButtonProps}>
            {options.confirmText || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};
