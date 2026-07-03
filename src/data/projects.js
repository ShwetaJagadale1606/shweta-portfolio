// Single source of truth for all project content.
const projects = [
  {
    slug: 'enterprise-portal',
    index: '001',
    title: 'Enterprise Portal',
    category: 'Full-stack',
    year: '2024',
    outcome: 'Enterprise resource portal architected on Spring Boot microservices',
    tags: ['spring boot', 'react', 'aws'],
    glow: '#ef8ab2',
    role: 'Full-stack Engineer',
    timeline: '2024',
    stack: ['Java', 'Spring Boot', 'React', 'MySQL', 'Docker', 'AWS'],
    repo: 'https://github.com/ShwetaJagadale1606',
    intro:
      'An enterprise resource portal, re-architected from a legacy monolith into independently deployable Spring Boot microservices behind a unified React frontend.',
    body: [
      'The existing system carried years of tightly coupled logic, and every release needed careful coordination. I worked on splitting it into services with clear boundaries, an API gateway in front, and well-defined contracts between teams.',
      'On the frontend, a React application talks to the gateway through a typed client. CI/CD pipelines on AWS build, test and deploy each service independently, which made releases far less stressful.',
    ],
    highlights: [
      {
        title: 'Clear service boundaries',
        text: 'Each domain owns its data and its API, so teams can build and deploy independently.',
      },
      {
        title: 'Contract-first API design',
        text: 'OpenAPI specs are agreed before code is written, letting frontend and backend progress in parallel.',
      },
      {
        title: 'Automated delivery pipeline',
        text: 'Build, test and deployment are automated on AWS, making releases routine instead of risky.',
      },
    ],
  },
  {
    slug: 'inventory-manager',
    index: '002',
    title: 'Inventory Manager',
    category: 'Backend',
    year: '2024',
    outcome: 'Real-time inventory platform engineered for transactional integrity',
    tags: ['java', 'mysql', 'rest'],
    glow: '#8ba3ff',
    role: 'Backend Engineer',
    timeline: '2024',
    stack: ['Java', 'Spring', 'MySQL', 'REST'],
    repo: 'https://github.com/ShwetaJagadale1606',
    intro:
      'An inventory management system designed for concurrent, high-frequency stock operations — where transactional integrity is non-negotiable.',
    body: [
      'Concurrent updates are the hard part of inventory. The write path uses optimistic locking and careful transaction boundaries, so parallel updates never silently overwrite each other.',
      'On the read path I spent time on indexes, query plans and caching for the hot lookups — the unglamorous work that keeps an API responsive as usage grows.',
    ],
    highlights: [
      {
        title: 'Concurrency-safe writes',
        text: 'Optimistic locking and idempotent endpoints keep stock counts consistent when updates collide.',
      },
      {
        title: 'Deliberate query optimisation',
        text: 'Indexes and a small caching layer brought response times down in a measurable, boring way.',
      },
      {
        title: 'Consistent error contracts',
        text: 'A consistent error contract across endpoints, so clients always know what went wrong.',
      },
    ],
  },
  {
    slug: 'analytics-dashboard',
    index: '003',
    title: 'Analytics Dashboard',
    category: 'Frontend',
    year: '2023',
    outcome: 'Interactive analytics dashboard visualising live operational data',
    tags: ['react', 'javascript', 'apis'],
    glow: '#b78af0',
    role: 'Frontend Engineer',
    timeline: '2023',
    stack: ['React', 'JavaScript', 'REST APIs', 'CSS'],
    repo: 'https://github.com/ShwetaJagadale1606',
    intro:
      'An analytics dashboard that renders live operational data into clear, responsive visualisations — built to stay legible and performant as data streams in.',
    body: [
      'Live dashboards usually fail by being slow or noisy. This one reconciles incoming data into charts without re-rendering everything, so interactions stay smooth while the data refreshes underneath.',
      'Loading states, transitions and responsive layouts were treated as part of the job rather than an afterthought — the same dashboard reads well on a large display and a phone.',
    ],
    highlights: [
      {
        title: 'Incremental data reconciliation',
        text: 'Incoming data is merged incrementally, so charts update without flicker or layout jumps.',
      },
      {
        title: 'Purposeful motion design',
        text: 'Transitions communicate what changed instead of decorating the page.',
      },
      {
        title: 'Responsive across form factors',
        text: 'One layout system that adapts from wall display to phone without special cases.',
      },
    ],
  },
  {
    slug: 'microservices-platform',
    index: '004',
    title: 'Microservices Platform',
    category: 'Architecture',
    year: '2023',
    outcome: 'Service discovery, API gateway & centralised logging',
    tags: ['architecture', 'docker', 'java'],
    glow: '#8ad2e8',
    role: 'Backend Engineer',
    timeline: '2023',
    stack: ['Java', 'Spring Cloud', 'Docker', 'ELK'],
    repo: 'https://github.com/ShwetaJagadale1606',
    intro:
      'The shared platform layer that unifies a distributed service landscape — routing, discovery and observability treated as first-class concerns.',
    body: [
      'When several teams ship their own services, someone has to keep the whole thing coherent. I worked on the gateway that owns routing and auth, service discovery so instances find each other, and health checks that surface problems early.',
      'Centralised, structured logging with correlation IDs ties it together — one search traces a request across every service it touched, which turned debugging from guesswork into a lookup.',
    ],
    highlights: [
      {
        title: 'Unified API gateway',
        text: 'The API gateway centralises routing, rate limiting and auth, so services stay small and focused.',
      },
      {
        title: 'Self-healing topology',
        text: 'Health checks and service discovery route traffic around failing instances.',
      },
      {
        title: 'End-to-end request tracing',
        text: 'Structured logs with correlation IDs let one query tell a request’s whole story.',
      },
    ],
  },
];

export default projects;

export const getProject = (slug) => projects.find((p) => p.slug === slug);

export const getNextProject = (slug) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
