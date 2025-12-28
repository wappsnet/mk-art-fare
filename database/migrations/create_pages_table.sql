-- Create pages table for managing static page content
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSON NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default pages
INSERT INTO pages (slug, title, content, meta_description, is_published) VALUES
(
  'help-center',
  'Help Center',
  JSON_OBJECT(
    'description', 'Find answers to common questions or get in touch with our support team',
    'faqSections', JSON_ARRAY(
      JSON_OBJECT(
        'category', 'Getting Started',
        'questions', JSON_ARRAY(
          JSON_OBJECT('question', 'How do I create an account?', 'answer', 'Click on the Register button in the top right corner and fill in your details.'),
          JSON_OBJECT('question', 'How do I start selling?', 'answer', 'After creating an account, go to your dashboard and create your shop profile.')
        )
      ),
      JSON_OBJECT(
        'category', 'Orders & Shipping',
        'questions', JSON_ARRAY(
          JSON_OBJECT('question', 'How long does shipping take?', 'answer', 'Shipping times vary by seller and location. Check the product page for details.'),
          JSON_OBJECT('question', 'Can I track my order?', 'answer', 'Yes, you will receive a tracking number once your order ships.')
        )
      )
    )
  ),
  'Get help with your Art Fare account, orders, and more',
  TRUE
),
(
  'terms',
  'Terms of Use',
  JSON_OBJECT(
    'lastUpdated', DATE_FORMAT(NOW(), '%Y-%m-%d'),
    'sections', JSON_ARRAY(
      JSON_OBJECT('title', 'Agreement to Terms', 'content', 'By accessing or using our platform, you agree to be bound by these Terms of Use.'),
      JSON_OBJECT('title', 'Use License', 'content', 'Permission is granted to temporarily access the materials on Art Fare for personal, non-commercial viewing only.'),
      JSON_OBJECT('title', 'Account Registration', 'content', 'To access certain features, you must register for an account and provide accurate information.'),
      JSON_OBJECT('title', 'Prohibited Activities', 'content', 'You may not violate laws, infringe on intellectual property, or engage in fraudulent practices.')
    )
  ),
  'Terms of Use for Art Fare platform',
  TRUE
),
(
  'about',
  'About Us',
  JSON_OBJECT(
    'mission', 'To create a thriving ecosystem where artists can build sustainable businesses and art lovers can discover authentic artwork.',
    'story', JSON_ARRAY(
      'Art Fare was founded with a simple belief: artists deserve a platform that empowers them to thrive.',
      'Our platform was built by artists, for artists. Every feature was designed with the creative community in mind.',
      'Today, Art Fare is home to thousands of artists and collectors from around the world.'
    ),
    'values', JSON_ARRAY(
      JSON_OBJECT('title', 'Artist First', 'description', 'We prioritize the needs and success of our artist community in every decision.'),
      JSON_OBJECT('title', 'Authenticity', 'description', 'We believe in genuine connections through authentic, original artwork.'),
      JSON_OBJECT('title', 'Transparency', 'description', 'Clear pricing, honest communication, and fair policies for everyone.'),
      JSON_OBJECT('title', 'Innovation', 'description', 'Continuously improving our platform with new features and tools.')
    )
  ),
  'Learn about Art Fare and our mission',
  TRUE
),
(
  'privacy',
  'Privacy Policy',
  JSON_OBJECT(
    'lastUpdated', DATE_FORMAT(NOW(), '%Y-%m-%d'),
    'sections', JSON_ARRAY(
      JSON_OBJECT('title', 'Introduction', 'content', 'We respect your privacy and are committed to protecting your personal data.'),
      JSON_OBJECT('title', 'Information We Collect', 'content', 'We collect personal information you provide, as well as usage data and device information.'),
      JSON_OBJECT('title', 'How We Use Your Information', 'content', 'We use your information to provide services, process transactions, and improve our platform.'),
      JSON_OBJECT('title', 'Information Sharing', 'content', 'We do not sell your personal information. We share data only with service providers and when required by law.'),
      JSON_OBJECT('title', 'Data Security', 'content', 'We implement industry-standard security measures including encryption and secure payment processing.'),
      JSON_OBJECT('title', 'Your Rights', 'content', 'You have the right to access, correct, delete, and export your data.')
    )
  ),
  'Privacy Policy for Art Fare platform',
  TRUE
);
