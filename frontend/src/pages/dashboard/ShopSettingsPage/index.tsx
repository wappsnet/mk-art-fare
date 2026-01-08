import { FC, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import StorefrontIcon from '@mui/icons-material/Storefront';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Typography,
  Button,
  Stack,
  TextField,
  Grid,
  Divider,
  Chip,
  Box,
  Card,
  CardContent,
  CardActions,
  Avatar,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';

import AppDrawer from '@/components/AppDrawer';
import {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useUpdateOrganizationThemeMutation,
  useUploadOrganizationLogoMutation,
  useUploadOrganizationBannerMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

import ThemeColorsCard from './Addons/components/ThemeColorsCard';

interface ShopUpdateValues {
  name?: string;
  description?: string;
}

interface BrandingUpdateValues {
  primaryColor: string;
  secondaryColor: string;
}

const ShopSettingsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isShopDrawerOpen, setIsShopDrawerOpen] = useState(false);
  const [isBrandingDrawerOpen, setIsBrandingDrawerOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const {
    control: shopControl,
    handleSubmit: handleShopSubmit,
    reset: resetShop,
  } = useForm<ShopUpdateValues>();

  const {
    control: brandingControl,
    handleSubmit: handleBrandingSubmit,
    reset: resetBranding,
  } = useForm<BrandingUpdateValues>();

  const { data: orgData } = useGetOrganizationByIdQuery(orgId, { skip: !orgId });
  const [updateOrganization, { isLoading: isUpdatingOrg }] = useUpdateOrganizationMutation();
  const [updateTheme, { isLoading: isUpdatingTheme }] = useUpdateOrganizationThemeMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadOrganizationLogoMutation();
  const [uploadBanner, { isLoading: isUploadingBanner }] = useUploadOrganizationBannerMutation();

  const organization = orgData?.data;

  const onShopUpdate = async (values: ShopUpdateValues) => {
    try {
      await updateOrganization({ id: orgId, data: values }).unwrap();
      message.success('Shop updated successfully!');
      setIsShopDrawerOpen(false);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update shop');
    }
  };

  const onBrandingUpdate = async (values: BrandingUpdateValues) => {
    try {
      const uploads = [
        updateTheme({
          id: orgId,
          theme: {
            primaryColor: values.primaryColor,
            secondaryColor: values.secondaryColor,
          },
        }).unwrap(),
      ];

      if (logoFile) {
        uploads.push(uploadLogo({ id: orgId, file: logoFile }).unwrap());
      }

      if (bannerFile) {
        uploads.push(uploadBanner({ id: orgId, file: bannerFile }).unwrap());
      }

      await Promise.all(uploads);

      message.success('Branding updated successfully!');
      setIsBrandingDrawerOpen(false);
      setLogoFile(null);
      setBannerFile(null);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update branding');
    }
  };

  if (!organization) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <StorefrontIcon /> Shop Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your shop information, branding, and appearance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          {/* Basic Information Card */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <StorefrontIcon /> Basic Information
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Shop Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {organization.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <LinkIcon fontSize="small" /> Shop URL
                  </Typography>
                  <Chip label={`artfare.com/${organization.slug}`} color="primary" size="small" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {organization.description || (
                      <Typography color="text.secondary" component="span">
                        No description
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  resetShop({
                    name: organization.name,
                    description: organization.description || '',
                  });
                  setIsShopDrawerOpen(true);
                }}
              >
                Edit
              </Button>
            </CardActions>
          </Card>

          {/* Theme Colors Card */}
          <ThemeColorsCard
            primaryColor={organization.primary_color}
            secondaryColor={organization.secondary_color}
            onEdit={() => {
              resetBranding({
                primaryColor: organization.primary_color || '#1890ff',
                secondaryColor: organization.secondary_color || '#52c41a',
              });
              setIsBrandingDrawerOpen(true);
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          {/* Branding Images Card */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ImageIcon /> Branding Images
              </Typography>

              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Logo
                  </Typography>
                  {organization.logo_url ? (
                    <Avatar
                      src={organization.logo_url}
                      alt="Shop Logo"
                      sx={{
                        width: 100,
                        height: 100,
                      }}
                    />
                  ) : (
                    <Box>
                      <ImageIcon />
                      <Typography variant="caption" color="text.secondary">
                        No logo uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Banner
                  </Typography>
                  {organization.banner_url ? (
                    <Box
                      component="img"
                      src={organization.banner_url}
                      alt="Shop banner"
                      sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1 }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 150,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        No banner uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  resetBranding({
                    primaryColor: organization.primary_color || '#1890ff',
                    secondaryColor: organization.secondary_color || '#52c41a',
                  });
                  setIsBrandingDrawerOpen(true);
                }}
              >
                Edit
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Shop Details Drawer */}
      <AppDrawer
        open={isShopDrawerOpen}
        onClose={() => setIsShopDrawerOpen(false)}
        title="Edit Shop Details"
        width={500}
        footer={
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setIsShopDrawerOpen(false)}>Cancel</Button>
            <Button
              onClick={handleShopSubmit(onShopUpdate)}
              variant="contained"
              disabled={isUpdatingOrg}
            >
              Update
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          <Controller
            name="name"
            control={shopControl}
            rules={{ required: 'Shop name is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Shop Name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="description"
            control={shopControl}
            render={({ field }) => (
              <TextField {...field} label="Description" multiline rows={4} fullWidth />
            )}
          />
        </Stack>
      </AppDrawer>

      {/* Branding Drawer */}
      <AppDrawer
        open={isBrandingDrawerOpen}
        onClose={() => setIsBrandingDrawerOpen(false)}
        title="Update Branding"
        width={600}
        footer={
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setIsBrandingDrawerOpen(false)}>Cancel</Button>
            <Button
              onClick={handleBrandingSubmit(onBrandingUpdate)}
              variant="contained"
              disabled={isUpdatingTheme || isUploadingLogo || isUploadingBanner}
            >
              Update
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2" gutterBottom>
              Logo
            </Typography>
            <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
              {'Select Logo'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </Button>
            {(logoFile || organization.logo_url) && (
              <Box
                component="img"
                src={logoFile ? URL.createObjectURL(logoFile) : organization.logo_url}
                alt="Logo preview"
                sx={{ width: '100%', height: 120, objectFit: 'contain', borderRadius: 1, mt: 2 }}
              />
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2" gutterBottom>
              Banner
            </Typography>
            <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
              {'Select Banner'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              />
            </Button>
            {(bannerFile || organization.banner_url) && (
              <Box
                component="img"
                src={bannerFile ? URL.createObjectURL(bannerFile) : organization.banner_url}
                alt="Banner preview"
                sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1, mt: 2 }}
              />
            )}
          </Box>

          <Controller
            name="primaryColor"
            control={brandingControl}
            render={({ field }) => (
              <TextField
                {...field}
                type="color"
                label="Primary Color (Hex)"
                placeholder="#1890ff"
                fullWidth
              />
            )}
          />

          <Controller
            name="secondaryColor"
            control={brandingControl}
            render={({ field }) => (
              <TextField
                {...field}
                type="color"
                label="Secondary Color (Hex)"
                placeholder="#52c41a"
                fullWidth
              />
            )}
          />
        </Stack>
      </AppDrawer>
    </Stack>
  );
};

export default ShopSettingsPage;
