import { FC } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Box,
} from '@mui/material';

import AppLayout from '@/components/AppLayout';
import { withKeys } from '@/utils/arrayHelpers';

import ContactCards from './ContactCards';
import ContactForm from './ContactForm';
import { faqData } from './faqData';

const HelpCenterPage: FC = () => {
  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={6}>
          {/* Header */}
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box color="primary.main">
              <HelpIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h3">Help Center</Typography>
            <Typography variant="body1" color="text.secondary">
              Find answers to common questions or get in touch with our support team
            </Typography>
          </Stack>

          {/* FAQ Sections */}
          {faqData.map((section) => (
            <Stack spacing={2} key={section.category}>
              <Typography variant="h4">{section.category}</Typography>
              {withKeys(section.questions).map((item) => (
                <Accordion key={item._key}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{item.value.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" color="text.secondary">
                      {item.value.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          ))}

          {/* Contact Section */}
          <Stack spacing={4}>
            <Stack spacing={1} textAlign="center">
              <Typography variant="h4">Still Need Help?</Typography>
              <Typography variant="body1" color="text.secondary">
                Our support team is here to assist you
              </Typography>
            </Stack>

            <ContactCards />
            <ContactForm />
          </Stack>
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default HelpCenterPage;
