import { FC } from 'react';

import GavelIcon from '@mui/icons-material/Gavel';
import { Container, Typography, Stack, Box, Divider } from '@mui/material';

import AppLayout from '@/components/AppLayout';

const TermsOfUsePage: FC = () => {
  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box color="primary.main">
              <GavelIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h3">Terms of Use</Typography>
            <Typography variant="body2" color="text.secondary">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Stack>

          <Divider />

          {/* Introduction */}
          <Stack spacing={2}>
            <Typography variant="h5">Agreement to Terms</Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to Art Fare. By accessing or using our platform, you agree to be bound by
              these Terms of Use and all applicable laws and regulations. If you do not agree with
              any of these terms, you are prohibited from using or accessing this site.
            </Typography>
          </Stack>

          {/* Use License */}
          <Stack spacing={2}>
            <Typography variant="h5">Use License</Typography>
            <Typography variant="body1" color="text.secondary">
              Permission is granted to temporarily access the materials on Art Fare's platform for
              personal, non-commercial transitory viewing only. This is the grant of a license, not
              a transfer of title, and under this license you may not:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">
                Modify or copy the materials
              </Typography>
              <Typography component="li" variant="body1">
                Use the materials for any commercial purpose or public display
              </Typography>
              <Typography component="li" variant="body1">
                Attempt to decompile or reverse engineer any software on the platform
              </Typography>
              <Typography component="li" variant="body1">
                Remove any copyright or proprietary notations from the materials
              </Typography>
              <Typography component="li" variant="body1">
                Transfer the materials to another person or mirror the materials on any other server
              </Typography>
            </Box>
          </Stack>

          {/* Account Registration */}
          <Stack spacing={2}>
            <Typography variant="h5">Account Registration</Typography>
            <Typography variant="h6">User Accounts</Typography>
            <Typography variant="body1" color="text.secondary">
              To access certain features of Art Fare, you must register for an account. When
              registering, you agree to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">
                Provide accurate, current, and complete information
              </Typography>
              <Typography component="li" variant="body1">
                Maintain and promptly update your account information
              </Typography>
              <Typography component="li" variant="body1">
                Maintain the security of your password and accept all risks of unauthorized access
              </Typography>
              <Typography component="li" variant="body1">
                Notify us immediately of any unauthorized use of your account
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Artist/Seller Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              If you register as an artist or seller, you additionally agree to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">
                Only sell original artwork or items you have the right to sell
              </Typography>
              <Typography component="li" variant="body1">
                Accurately describe your products and provide truthful information
              </Typography>
              <Typography component="li" variant="body1">
                Honor all sales and fulfill orders in a timely manner
              </Typography>
              <Typography component="li" variant="body1">
                Comply with all applicable laws and regulations
              </Typography>
              <Typography component="li" variant="body1">
                Pay all applicable fees and commissions as outlined in our pricing terms
              </Typography>
            </Box>
          </Stack>

          {/* Prohibited Activities */}
          <Stack spacing={2}>
            <Typography variant="h5">Prohibited Activities</Typography>
            <Typography variant="body1" color="text.secondary">
              You may not access or use the platform for any purpose other than that for which we
              make it available. Prohibited activities include, but are not limited to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">
                Violating any applicable laws or regulations
              </Typography>
              <Typography component="li" variant="body1">
                Infringing on intellectual property rights of others
              </Typography>
              <Typography component="li" variant="body1">
                Transmitting any harmful or malicious code
              </Typography>
              <Typography component="li" variant="body1">
                Engaging in fraudulent, deceptive, or misleading practices
              </Typography>
              <Typography component="li" variant="body1">
                Harassing, abusing, or harming other users
              </Typography>
              <Typography component="li" variant="body1">
                Attempting to bypass security measures or access restricted areas
              </Typography>
              <Typography component="li" variant="body1">
                Using automated systems to access the platform without permission
              </Typography>
              <Typography component="li" variant="body1">
                Selling counterfeit, stolen, or unauthorized items
              </Typography>
            </Box>
          </Stack>

          {/* Intellectual Property */}
          <Stack spacing={2}>
            <Typography variant="h5">Intellectual Property Rights</Typography>
            <Typography variant="body1" color="text.secondary">
              The platform and its original content, features, and functionality are owned by Art
              Fare and are protected by international copyright, trademark, patent, trade secret,
              and other intellectual property laws.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Artists retain all rights to their artwork uploaded to the platform. By uploading
              content, you grant Art Fare a non-exclusive, worldwide, royalty-free license to
              display, reproduce, and distribute your content solely for the purpose of operating
              and promoting the platform.
            </Typography>
          </Stack>

          {/* User Content */}
          <Stack spacing={2}>
            <Typography variant="h5">User-Generated Content</Typography>
            <Typography variant="body1" color="text.secondary">
              Our platform allows you to post, upload, and share content. You are solely responsible
              for the content you provide and must ensure you have all necessary rights. We reserve
              the right to remove any content that violates these terms or is otherwise
              objectionable.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              By posting content, you represent and warrant that:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <Typography component="li" variant="body1">
                You own or have necessary rights to the content
              </Typography>
              <Typography component="li" variant="body1">
                The content does not violate any third-party rights
              </Typography>
              <Typography component="li" variant="body1">
                The content does not contain illegal or harmful material
              </Typography>
            </Box>
          </Stack>

          {/* Purchases and Payments */}
          <Stack spacing={2}>
            <Typography variant="h5">Purchases and Payments</Typography>
            <Typography variant="body1" color="text.secondary">
              All purchases made through Art Fare are subject to product availability and
              acceptance by the seller. We reserve the right to refuse or cancel any order for any
              reason. Prices are set by individual sellers and are subject to change.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Payment processing is handled through secure third-party providers. By making a
              purchase, you agree to provide current, complete, and accurate payment information.
            </Typography>
          </Stack>

          {/* Returns and Refunds */}
          <Stack spacing={2}>
            <Typography variant="h5">Returns and Refunds</Typography>
            <Typography variant="body1" color="text.secondary">
              Return and refund policies are determined by individual sellers. Please review the
              seller's policy before making a purchase. Art Fare may facilitate dispute resolution
              but is not responsible for refunds or returns.
            </Typography>
          </Stack>

          {/* Disclaimer */}
          <Stack spacing={2}>
            <Typography variant="h5">Disclaimer</Typography>
            <Typography variant="body1" color="text.secondary">
              The materials on Art Fare's platform are provided on an 'as is' basis. Art Fare makes
              no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Art Fare does not warrant that the platform will be uninterrupted, secure, or
              error-free, or that defects will be corrected.
            </Typography>
          </Stack>

          {/* Limitations of Liability */}
          <Stack spacing={2}>
            <Typography variant="h5">Limitations of Liability</Typography>
            <Typography variant="body1" color="text.secondary">
              In no event shall Art Fare or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on the
              platform, even if Art Fare or an authorized representative has been notified of the
              possibility of such damage.
            </Typography>
          </Stack>

          {/* Indemnification */}
          <Stack spacing={2}>
            <Typography variant="h5">Indemnification</Typography>
            <Typography variant="body1" color="text.secondary">
              You agree to indemnify, defend, and hold harmless Art Fare and its officers,
              directors, employees, and agents from any claims, liabilities, damages, losses, and
              expenses arising from your violation of these Terms of Use or your use of the
              platform.
            </Typography>
          </Stack>

          {/* Termination */}
          <Stack spacing={2}>
            <Typography variant="h5">Termination</Typography>
            <Typography variant="body1" color="text.secondary">
              We may terminate or suspend your account and access to the platform immediately,
              without prior notice or liability, for any reason, including if you breach these Terms
              of Use. Upon termination, your right to use the platform will immediately cease.
            </Typography>
          </Stack>

          {/* Governing Law */}
          <Stack spacing={2}>
            <Typography variant="h5">Governing Law</Typography>
            <Typography variant="body1" color="text.secondary">
              These Terms of Use shall be governed by and construed in accordance with the laws of
              the State of California, United States, without regard to its conflict of law
              provisions. Any disputes arising from these terms shall be resolved in the courts of
              San Francisco County, California.
            </Typography>
          </Stack>

          {/* Changes to Terms */}
          <Stack spacing={2}>
            <Typography variant="h5">Changes to Terms</Typography>
            <Typography variant="body1" color="text.secondary">
              We reserve the right to modify or replace these Terms of Use at any time. If a
              revision is material, we will provide at least 30 days' notice before new terms take
              effect. What constitutes a material change will be determined at our sole discretion.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              By continuing to access or use our platform after revisions become effective, you
              agree to be bound by the revised terms.
            </Typography>
          </Stack>

          {/* Severability */}
          <Stack spacing={2}>
            <Typography variant="h5">Severability</Typography>
            <Typography variant="body1" color="text.secondary">
              If any provision of these Terms of Use is held to be unenforceable or invalid, such
              provision will be changed and interpreted to accomplish the objectives of such
              provision to the greatest extent possible under applicable law, and the remaining
              provisions will continue in full force and effect.
            </Typography>
          </Stack>

          {/* Contact Information */}
          <Stack spacing={2}>
            <Typography variant="h5">Contact Us</Typography>
            <Typography variant="body1" color="text.secondary">
              If you have any questions about these Terms of Use, please contact us:
            </Typography>
            <Box sx={{ pl: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Email: legal@artfare.com
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

export default TermsOfUsePage;
