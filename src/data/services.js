const sharedTeam = {
  label: 'Our Team',
  heading: 'Good work starts with the right people',
  description: 'A connected team brings different perspectives to the same goal: moving your business forward.',
  cards: [
    { title: 'Strategic Thinkers', description: 'We start by understanding your business, your customers, and where you want to go.' },
    { title: 'Practical Specialists', description: 'The right expertise comes together around the work your business actually needs.' },
    { title: 'Collaborative Partners', description: 'We work alongside your team with open communication at every stage.' },
  ],
};

const sharedResults = {
  label: 'Results',
  heading: 'Built for meaningful progress',
  description: 'The best solutions do more than solve today’s problem. They create room for what comes next.',
  cards: [
    { title: 'Clearer Direction', description: 'A shared understanding of your goals and the steps to reach them.' },
    { title: 'Connected Execution', description: 'Ideas, people, and technology working together instead of in silos.' },
    { title: 'Lasting Momentum', description: 'Practical foundations that help your business keep moving forward.' },
  ],
};

const methodology = {
  label: 'Methodology',
  heading: 'A thoughtful approach, from start to finish',
  description: 'We listen first, build a plan together, and stay focused on the outcomes that matter.',
  cards: [
    { title: '01. Discover', description: 'We get to know your business, your challenges, and the opportunities ahead.' },
    { title: '02. Strategize', description: 'We bring the right disciplines together into a clear, practical plan.' },
    { title: '03. Deliver', description: 'We put the plan into action, learn from the results, and refine along the way.' },
  ],
};

export const servicePages = {
  marketing: {
    slug: 'marketing',
    label: 'Marketing Strategy',
    shortLabel: 'Marketing',
    image: '/images/marketing-strategy.jpg',
    imageWidth: 1272,
    imageHeight: 719,
    heroFirst: 'Amplify Your',
    heroPrefix: 'Brand',
    heroAccent: 'Impact',
    heroDescription: 'Digital campaigns, SEO, PPC, social media management, branding, and content marketing to enhance your digital presence and drive growth.',
    intro: 'Comprehensive marketing solutions that drive measurable results and sustainable growth for your business.',
    offerings: [
      { title: 'Digital Campaign Management', description: 'End-to-end campaign development, execution, and optimization across all digital channels.', tags: ['Multi-channel', 'A/B Testing', 'Analytics'], detail: 'Bring your channels together with campaigns shaped around your audience, objectives, and opportunities for growth.' },
      { title: 'SEO & PPC Optimization', description: 'Comprehensive search engine optimization and pay-per-click advertising management.', tags: ['Technical SEO', 'Google Ads', 'Keywords'], detail: 'Reach the people looking for your business with a considered mix of organic search and paid advertising.' },
      { title: 'Social Media Management', description: 'Strategic social media presence across all platforms with engaging content and community management.', tags: ['Content Creation', 'Community', 'Influencers'], detail: 'Build a consistent, meaningful presence with content and conversations that connect with your community.' },
      { title: 'Brand Development', description: 'Complete brand identity creation and management to establish a strong market presence.', tags: ['Brand Strategy', 'Logo Design', 'Guidelines'], detail: 'Clarify what makes your business different and express it consistently across every touchpoint.' },
      { title: 'Content Strategy', description: 'Strategic content planning, creation, and distribution across all marketing channels.', tags: ['Content Calendar', 'Blog Writing', 'Video'], detail: 'Turn your expertise into useful, purposeful content that supports your wider business goals.' },
      { title: 'Email Marketing', description: 'Targeted email campaigns with personalization, automation, and advanced segmentation strategies.', tags: ['Automation', 'Segmentation', 'Personalization'], detail: 'Nurture customer relationships with relevant messages at the moments that matter.' },
    ],
    tabs: [
      {
        label: 'Overview',
        heading: 'Why Choose Our Marketing Services',
        description: 'We deliver comprehensive marketing solutions that drive measurable results and sustainable growth for your business.',
        cards: [
          { title: 'Data-Driven Approach', description: 'Every campaign is backed by comprehensive analytics and market research to support stronger performance.' },
          { title: 'Integrated Solutions', description: 'Seamless coordination across marketing channels for consistent brand messaging and maximum impact.' },
          { title: 'Scalable Growth', description: 'Strategies designed to grow with your business, from startup to enterprise-level operations.' },
        ],
      },
      {
        label: 'Services',
        heading: 'A complete view of your marketing',
        description: 'From your first impression to your ongoing campaigns, we make every touchpoint work together.',
        cards: [
          { title: 'Find Your Audience', description: 'Search, paid media, and social campaigns help you reach the right people.' },
          { title: 'Tell Your Story', description: 'Brand and content strategy give your business a clear, consistent voice.' },
          { title: 'Build Relationships', description: 'Thoughtful email and community management keep the conversation going.' },
        ],
      },
      methodology,
      sharedTeam,
      sharedResults,
    ],
  },
  business: {
    slug: 'business',
    label: 'Business Consulting',
    shortLabel: 'Business',
    image: '/images/business-consulting.jpg',
    imageWidth: 1272,
    imageHeight: 719,
    heroFirst: 'Transform Your',
    heroAccent: 'Business',
    heroSuffix: 'Today',
    heroDescription: 'Strategic business transformation, operational excellence, and growth acceleration to drive sustainable competitive advantage.',
    intro: 'Strategic insights and actionable solutions that transform businesses and accelerate sustainable growth across all industries.',
    offerings: [
      { title: 'Strategic Planning', description: 'Comprehensive strategic planning, market analysis, and execution roadmaps to drive long-term business success.', tags: ['Market Analysis', 'Roadmaps', 'KPIs'], detail: 'Turn your vision into a clear set of priorities, milestones, and next steps for your business.' },
      { title: 'Operations Excellence', description: 'Process improvement, workflow optimization, and operational excellence initiatives to maximize efficiency.', tags: ['Lean Six Sigma', 'Process Mapping', 'Automation'], detail: 'Find opportunities to simplify how work gets done and make better use of your team’s time.' },
      { title: 'Financial Optimization', description: 'Financial planning, budgeting, cash flow optimization, and investment strategies to improve profitability.', tags: ['Financial Modeling', 'Budgeting', 'Cash Flow'], detail: 'Build a more informed view of your finances to support confident day-to-day and long-term decisions.' },
      { title: 'Digital Transformation', description: 'Technology integration, digital strategy, and organizational change to modernize business operations.', tags: ['Digital Strategy', 'Tech Integration', 'Change Mgmt'], detail: 'Connect your people, processes, and technology around a practical plan for change.' },
      { title: 'Organizational Development', description: 'Leadership development, team optimization, and cultural transformation to build high-performing organizations.', tags: ['Leadership', 'Team Building', 'Culture'], detail: 'Support the people and ways of working that help your organization thrive.' },
      { title: 'Growth Strategy', description: 'Market expansion, product development, and strategic partnerships to accelerate sustainable business growth.', tags: ['Market Expansion', 'Product Dev', 'Partnerships'], detail: 'Identify the right opportunities for expansion and make a thoughtful plan to pursue them.' },
    ],
    tabs: [
      {
        label: 'Overview',
        heading: 'Why Choose Our Business Services',
        description: 'We deliver strategic insights and actionable solutions that transform businesses and accelerate sustainable growth across all industries.',
        cards: [
          { title: 'Strategic Excellence', description: 'Deep industry expertise combined with innovative strategic frameworks to drive competitive advantage and market leadership.' },
          { title: 'Operational Transformation', description: 'Comprehensive process optimization and organizational restructuring to maximize efficiency and profitability.' },
          { title: 'Measurable Impact', description: 'Data-driven solutions with clear KPIs and performance metrics to support tangible business outcomes.' },
        ],
      },
      {
        label: 'Services',
        heading: 'Clarity for every stage of growth',
        description: 'We connect long-term direction with the practical changes that make progress possible.',
        cards: [
          { title: 'Plan With Purpose', description: 'Shape your strategy with market insight, financial planning, and clear priorities.' },
          { title: 'Work Better', description: 'Improve the processes, systems, and structures behind your day-to-day operations.' },
          { title: 'Grow Confidently', description: 'Prepare your people and business for new opportunities and sustainable growth.' },
        ],
      },
      methodology,
      sharedTeam,
      sharedResults,
    ],
  },
  software: {
    slug: 'software',
    label: 'Software Solutions',
    shortLabel: 'Software',
    image: '/images/software-solutions.jpg',
    imageWidth: 1281,
    imageHeight: 719,
    heroFirst: 'Build Tomorrow’s',
    heroAccent: 'Software',
    heroSuffix: 'Today',
    heroDescription: 'Transform your ideas into powerful digital solutions with cutting-edge technology and innovative development practices.',
    intro: 'From concept to deployment, we deliver comprehensive software solutions tailored to your business needs.',
    offerings: [
      { title: 'Web Applications', description: 'Modern, responsive web applications built with React and cutting-edge technologies for optimal performance.', tags: ['React', 'Node.js', 'TypeScript'], detail: 'Create an accessible, responsive digital experience designed around the people who use it.' },
      { title: 'Mobile Apps', description: 'Native and cross-platform mobile applications for iOS and Android with seamless user experiences.', tags: ['React Native', 'Flutter', 'Swift'], detail: 'Bring useful experiences to your customers and teams wherever they are.' },
      { title: 'Cloud Solutions', description: 'Scalable cloud infrastructure and microservices architecture for enterprise-grade applications.', tags: ['AWS', 'Docker', 'Kubernetes'], detail: 'Build a dependable foundation that can adapt as your business and its needs evolve.' },
      { title: 'API Development', description: 'Robust RESTful and GraphQL APIs with comprehensive documentation and security best practices.', tags: ['GraphQL', 'REST', 'OpenAPI'], detail: 'Connect the tools and systems your business relies on with well-considered integrations.' },
      { title: 'Enterprise Systems', description: 'Large-scale enterprise applications with complex business logic and integration capabilities.', tags: ['.NET', 'Java', 'Microservices'], detail: 'Simplify complex workflows with software designed to fit the way your organization works.' },
      { title: 'DevOps & CI/CD', description: 'Automated deployment pipelines, infrastructure as code, and continuous integration practices.', tags: ['Jenkins', 'Terraform', 'GitLab'], detail: 'Make delivery more repeatable and reliable with a thoughtful approach to automation.' },
    ],
    tabs: [
      {
        label: 'Overview',
        heading: 'Why Choose Our Software Services',
        description: 'We deliver cutting-edge software solutions that drive innovation, efficiency, and growth for businesses of all sizes.',
        cards: [
          { title: 'Agile Development', description: 'Rapid iteration cycles with continuous feedback and deployment to deliver value faster and adapt to changing requirements.' },
          { title: 'Scalable Architecture', description: 'Future-proof solutions built with modern architectures that scale seamlessly as your business grows.' },
          { title: 'Quality Assurance', description: 'Comprehensive testing strategies and quality control processes to support reliable, secure applications.' },
        ],
      },
      {
        label: 'Services',
        heading: 'Technology built around your business',
        description: 'From the first idea to ongoing improvements, we connect the pieces of your digital experience.',
        cards: [
          { title: 'Digital Experiences', description: 'Useful, intuitive web and mobile applications for your customers and teams.' },
          { title: 'Connected Systems', description: 'APIs and integrations that help information flow between the tools you use.' },
          { title: 'Reliable Foundations', description: 'Cloud infrastructure and delivery practices designed for the road ahead.' },
        ],
      },
      {
        label: 'Technologies',
        heading: 'The right tools for the right challenge',
        description: 'We choose technology to serve your goals, not the other way around.',
        cards: [
          { title: 'Modern Interfaces', description: 'Responsive web and mobile technologies for engaging, accessible experiences.' },
          { title: 'Connected Platforms', description: 'APIs and services that bring applications and business systems together.' },
          { title: 'Cloud & Delivery', description: 'Flexible infrastructure and automation to support dependable software.' },
        ],
      },
      sharedTeam,
      { ...sharedResults, label: 'Portfolio' },
    ],
  },
};

export const departments = [
  {
    ...servicePages.marketing,
    cardTitle: 'Marketing Strategy',
    cardDescription: 'Digital campaigns, SEO, PPC, social media management, branding, and content marketing to enhance your digital presence and drive growth.',
    bullets: ['Digital Campaign Management', 'SEO & PPC Optimization', 'Brand Development', 'Content Strategy'],
  },
  {
    ...servicePages.business,
    cardTitle: 'Business Consulting',
    cardDescription: 'Strategic planning, operations optimization, market entry strategies, and scaling support for entrepreneurs and growing companies.',
    bullets: ['Strategic Planning', 'Operations Optimization', 'Market Entry Support', 'Growth Strategies'],
  },
  {
    ...servicePages.software,
    cardTitle: 'Software Solutions',
    cardDescription: 'Custom applications, platforms, automation tools, API integrations, and ongoing tech support for digital transformation.',
    bullets: ['Custom App Development', 'Process Automation', 'API Integrations', 'Ongoing Tech Support'],
  },
];
