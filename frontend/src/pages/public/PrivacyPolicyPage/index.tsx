import { FC } from 'react';

import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import { Container, Typography, Stack, Box, Divider } from '@mui/material';

import AppLayout from '@/components/AppLayout';

const PrivacyPolicyPage: FC = () => {
  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box color="primary.main">
              <PrivacyTipIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h3">Privacy Policy</Typography>
            <Typography variant="body2" color="text.secondary">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Stack>

          <Divider />

          {/* Introduction */}
          <Stack spacing={2}>
            <Typography variant="h5">Introduction</Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to Art Fare. We respect your privacy and are committed to protecting your
              personal data. This privacy policy explains how we collect, use, and safeguard your
              information when you use our platform.
            </Typography>
          </Stack>

          {/* Information We Collect */}
          <Stack spacing={2}>
            <Typography variant="h5">Information We Collect</Typography>
            <Typography variant="h6">Personal Information</Typography>
            <Typography variant="body1" color="text.secondary">
              When you register for an account, we collect:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">Name and email address</Typography>
              <Typography component="li" variant="body1">Shop name and description (for artists)</Typography>
              <Typography component="li" variant="body1">Payment information (processed securely through third-party providers)</Typography>
              <Typography component="li" variant="body1">Shipping addresses for order fulfillment</Typography>
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Automatically Collected Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We automatically collect certain information when you use our platform:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">Device information (browser type, operating system)</Typography>
              <Typography component="li" variant="body1">IP address and location data</Typography>
              <Typography component="li" variant="body1">Usage data (pages visited, time spent on site)</Typography>
              <Typography component="li" variant="body1">Cookies and similar tracking technologies</Typography>
            </Box>
          </Stack>

          {/* How We Use Your Information */}
          <Stack spacing={2}>
            <Typography variant="h5">How We Use Your Information</Typography>
            <Typography variant="body1" color="text.secondary">
              We use your information to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">Provide and maintain our services</Typography>
              <Typography component="li" variant="body1">Process transactions and send order confirmations</Typography>
              <Typography component="li" variant="body1">Send important updates about your account or orders</Typography>
              <Typography component="li" variant="body1">Improve our platform and user experience</Typography>
              <Typography component="li" variant="body1">Prevent fraud and ensure platform security</Typography>
              <Typography component="li" variant="body1">Comply with legal obligations</Typography>
              <Typography component="li" variant="body1">Send marketing communications (with your consent)</Typography>
            </Box>
          </Stack>

          {/* Information Sharing */}
          <Stack spacing={2}>
            <Typography variant="h5">Information Sharing</Typography>
            <Typography variant="body1" color="text.secondary">
              We do not sell your personal information. We may share your information with:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">
                <strong>Artists:</strong> When you make a purchase, we share necessary information
                (name, shipping address) with the artist to fulfill your order
              </Typography>
              <Typography component="li" variant="body1">
                <strong>Service Providers:</strong> Third-party companies that help us operate our
                platform (payment processors, hosting providers, email services)
              </Typography>
              <Typography component="li" variant="body1">
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
                and users
              </Typography>
            </Box>
          </Stack>

          {/* Data Security */}
          <Stack spacing={2}>
            <Typography variant="h5">Data Security</Typography>
            <Typography variant="body1" color="text.secondary">
              We implement industry-standard security measures to protect your personal information,
              including:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">Encryption of data in transit and at rest</Typography>
              <Typography component="li" variant="body1">Secure payment processing through PCI-compliant providers</Typography>
              <Typography component="li" variant="body1">Regular security audits and updates</Typography>
              <Typography component="li" variant="body1">Limited access to personal data by authorized personnel only</Typography>
            </Box>
          </Stack>

          {/* Your Rights */}
          <Stack spacing={2}>
            <Typography variant="h5">Your Rights</Typography>
            <Typography variant="body1" color="text.secondary">
              You have the right to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">Access and review your personal information</Typography>
              <Typography component="li" variant="body1">Correct or update your information</Typography>
              <Typography component="li" variant="body1">Request deletion of your account and data</Typography>
              <Typography component="li" variant="body1">Opt out of marketing communications</Typography>
              <Typography component="li" variant="body1">Export your data in a portable format</Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              To exercise these rights, please contact us at privacy@artfare.com
            </Typography>
          </Stack>

          {/* Cookies */}
          <Stack spacing={2}>
            <Typography variant="h5">Cookies and Tracking</Typography>
            <Typography variant="body1" color="text.secondary">
              We use cookies and similar technologies to enhance your experience, analyze usage, and
              provide personalized content. You can control cookies through your browser settings,
              though some features may not function properly if you disable cookies.
            </Typography>
          </Stack>

          {/* Children's Privacy */}
          <Stack spacing={2}>
            <Typography variant="h5">Children's Privacy</Typography>
            <Typography variant="body1" color="text.secondary">
              Art Fare is not intended for users under 13 years of age. We do not knowingly collect
              personal information from children. If you believe we have inadvertently collected
              information from a child, please contact us immediately.
            </Typography>
          </Stack>

          {/* Changes to This Policy */}
          <Stack spacing={2}>
            <Typography variant="h5">Changes to This Policy</Typography>
            <Typography variant="body1" color="text.secondary">
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page and updating the "Last
              Updated" date. Your continued use of Art Fare after changes are posted constitutes
              acceptance of the updated policy.
            </Typography>
          </Stack>

          {/* Contact Information */}
          <Stack spacing={2}>
            <Typography variant="h5">Contact Us</Typography>
            <Typography variant="body1" color="text.secondary">
              If you have questions about this privacy policy or our data practices, please contact
              us:
            </Typography>
            <Box sx={{ pl: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Email: privacy@artfare.com
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Address: Art Fare, Inc., 123 Creative Street, San Francisco, CA 94102
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default PrivacyPolicyPage;
