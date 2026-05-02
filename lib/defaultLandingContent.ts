export interface LandingFeature {
  icon: string;
  title: string;
  description: string;
}

export interface LandingContent {
  hero: {
    badge: string;
    title: string;
    titleGradient: string;
    subtitle: string;
  };
  featuresSection: {
    title: string;
    subtitle: string;
  };
  features: LandingFeature[];
  about: {
    title: string;
    paragraphs: string[];
    stats: { value: string; label: string }[];
    useCases: string[];
  };
  contact: {
    title: string;
    description: string;
  };
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: {
    badge: 'Free REST API for testing & prototyping',
    title: 'Build faster with',
    titleGradient: 'mock JSON APIs',
    subtitle:
      'A self-hosted mock API service for developers. Pre-built endpoints, custom routes, and realistic data generation—all in one place.',
  },
  featuresSection: {
    title: 'Everything you need for API testing',
    subtitle:
      'From pre-built endpoints to fully customizable routes, JSON Mock API has you covered.',
  },
  features: [
    {
      icon: '⚡',
      title: 'Pre-built Endpoints',
      description:
        'Ready-to-use REST API endpoints for users, products, posts, todos, and more. Zero setup required.',
    },
    {
      icon: '🔧',
      title: 'Custom Endpoints',
      description:
        'Define your own API endpoints with custom JSON responses using our intuitive Admin Dashboard.',
    },
    {
      icon: '🗄️',
      title: 'Supabase Integration',
      description:
        'Persistent storage for custom endpoints with PostgreSQL reliability and scalability.',
    },
    {
      icon: '📊',
      title: 'Request Logging',
      description:
        'Track every API call with detailed request/response logging for debugging and analytics.',
    },
    {
      icon: '🧩',
      title: 'Template Variables',
      description:
        'Dynamic responses with {{now}}, {{body}}, {{query.param}}, and other template placeholders.',
    },
    {
      icon: '🚀',
      title: 'Fast Mock Data',
      description:
        'Generate realistic mock data for 100+ users, products, and posts with customizable filters.',
    },
  ],
  about: {
    title: 'Built for developers, by developers',
    paragraphs: [
      'JSON Mock API started as an internal tool for rapid prototyping and has evolved into a comprehensive mock API solution used by developers worldwide.',
      'Whether you\'re building a frontend app and need mock data, testing API integrations, or creating educational content, our platform provides the flexibility and reliability you need.',
    ],
    stats: [
      { value: '100+', label: 'Mock Users' },
      { value: '100+', label: 'Products' },
      { value: '∞', label: 'Custom Endpoints' },
    ],
    useCases: [
      'Frontend developers needing mock data',
      'API integration testing',
      'Prototyping new applications',
      'Educational projects and tutorials',
      'Load testing and performance benchmarks',
      'CI/CD pipeline testing',
    ],
  },
  contact: {
    title: 'Ready to get started?',
    description:
      'Spin up your own JSON Mock API instance in minutes. Open source and free to use.',
  },
};
