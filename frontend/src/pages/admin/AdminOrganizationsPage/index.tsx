import { FC, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router';

import AppDataTable, { Column } from '@/components/AppDataTable';
import AppLayout from '@/components/AppLayout';
import { useConfirm } from '@/components/ConfirmDialog';
import {
  useGetOrganizationsQuery,
  useModerateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '@/services/apiSlice';
import { Organization } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

const AdminOrganizationsPage: FC = () => {
  const navigate = useNavigate();
  const [moderationModal, setModerationModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const { confirm } = useConfirm();

  const { data: orgsData, isLoading, refetch } = useGetOrganizationsQuery();
  const [moderateOrganization, { isLoading: isModerating }] = useModerateOrganizationMutation();
  const [deleteOrganization] = useDeleteOrganizationMutation();

  const organizations = orgsData?.data || [];

  const handleModerate = async (orgId: number, status: 'approved' | 'declined') => {
    try {
      await moderateOrganization({
        id: orgId,
        status,
        note: moderationNote,
      }).unwrap();

      message.success(
        `Organization ${status === 'approved' ? 'approved' : 'declined'} successfully`
      );
      setModerationModal(false);
      setModerationNote('');
      setSelectedOrg(null);
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to moderate organization');
    }
  };

  const openModerationModal = (org: Organization) => {
    setSelectedOrg(org);
    setModerationModal(true);
  };

  const handleDelete = async (org: Organization) => {
    try {
      await deleteOrganization(org.id).unwrap();
      message.success('Organization deleted successfully');
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete organization');
    }
  };

  const confirmDelete = (org: Organization) => {
    confirm({
      title: 'Delete Organization',
      content: (
        <Stack spacing={2}>
          <Typography>
            Are you sure you want to delete <strong>{org.name}</strong>?
          </Typography>
          <Typography color="error">
            This action cannot be undone. All shop data including products, custom fields, and
            themes will be permanently deleted.
          </Typography>
        </Stack>
      ),
      onConfirm: () => handleDelete(org),
      confirmButtonProps: { color: 'error' },
      confirmText: 'Delete',
    });
  };

  const getModerationStatusColor = (
    status: string
  ): 'default' | 'warning' | 'success' | 'error' => {
    const colorMap: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
      pending: 'warning',
      approved: 'success',
      declined: 'error',
    };
    return colorMap[status] || 'default';
  };

  const columns: Column<Organization>[] = [
    {
      id: 'id',
      label: 'ID',
      render: (org) => <Typography variant="body2">{org.id}</Typography>,
    },
    {
      id: 'name',
      label: 'Shop Name',
      render: (org) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {org.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              /{org.slug}
            </Typography>
          </Box>
          {org.moderation_status === 'approved' && (
            <VerifiedUserIcon sx={{ color: 'success.main', fontSize: 16 }} />
          )}
        </Stack>
      ),
    },
    {
      id: 'owner',
      label: 'Owner',
      render: (org) => <Typography variant="body2">{org.owner_id}</Typography>,
    },
    {
      id: 'status',
      label: 'Status',
      render: (org) => (
        <Chip
          label={(org.moderation_status || 'pending').toUpperCase()}
          color={getModerationStatusColor(org.moderation_status || 'pending')}
          size="small"
        />
      ),
    },
    {
      id: 'created',
      label: 'Created',
      render: (org) => (
        <Typography variant="body2">{dayjs(org.created_at).format('MMM DD, YYYY')}</Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (org) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/shop/${org.slug}`)}
          >
            View
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => openModerationModal(org)}
            disabled={org.moderation_status === 'approved'}
          >
            Moderate
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => confirmDelete(org)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <AppLayout>
      <Box sx={{ py: 4, px: 3 }}>
        <Stack spacing={4}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <MuiLink
              component={Link}
              to="/admin"
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <HomeIcon fontSize="small" />
              Admin Dashboard
            </MuiLink>
            <Typography
              color="text.primary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <StorefrontIcon fontSize="small" />
              Organization Moderation
            </Typography>
          </Breadcrumbs>

          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <StorefrontIcon /> Organization Moderation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and moderate shop listings
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <AppDataTable
                columns={columns}
                data={organizations}
                isLoading={isLoading}
                getRowKey={(org) => org.id}
                emptyContent={
                  <Typography color="text.secondary">No organizations found</Typography>
                }
              />
            </CardContent>
          </Card>

          <Dialog
            open={moderationModal}
            onClose={() => {
              setModerationModal(false);
              setModerationNote('');
              setSelectedOrg(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Moderate Organization</DialogTitle>
            <DialogContent>
              {selectedOrg && (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedOrg.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedOrg.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Slug: /{selectedOrg.slug}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Moderation Note (Optional):
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      placeholder="Add a note about this moderation decision..."
                      fullWidth
                    />
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => selectedOrg && handleModerate(selectedOrg.id, 'declined')}
                disabled={isModerating}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => selectedOrg && handleModerate(selectedOrg.id, 'approved')}
                disabled={isModerating}
              >
                Approve
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default AdminOrganizationsPage;
