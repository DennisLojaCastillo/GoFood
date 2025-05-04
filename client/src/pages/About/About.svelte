<script>
  import { onMount } from 'svelte';
  import user1 from '../../assets/images/user1.jpg';
  import user2 from '../../assets/images/user2.jpg';
  import user3 from '../../assets/images/user3.jpg';
  import heroFood from '../../assets/images/Hero_food.png';
  
  // Animation on scroll
  onMount(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in-section').forEach(section => {
      observer.observe(section);
    });
  });

  // Milestones data
  const milestones = [
    {
      year: '2020',
      title: 'GoFood Begins',
      description: 'From a simple idea of sharing recipes to a community of food enthusiasts.'
    },
    {
      year: '2021',
      title: 'Community Growth',
      description: 'Our platform reached 5,000 users and 10,000 recipes.'
    },
    {
      year: '2022',
      title: 'New Platform',
      description: 'We relaunched the platform with new technology and improved user experience.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'GoFood available in multiple languages, with recipes from around the world.'
    }
  ];

  // Team data
  const teamMembers = [
    {
      name: 'Sophie Larson',
      role: 'Founder & CEO',
      bio: 'Sophie is a passionate food lover with a background in tech. He founded GoFood to make cooking accessible to everyone.',
      image: user1
    },
    {
      name: 'Michael Jensen',
      role: 'Head Chef & Content Director',
      bio: 'With a Michelin star on her resume, Sophie ensures our recipes are both delicious and easy to follow.',
      image: user2
    },
    {
      name: 'Lars Nielsen',
      role: 'Technical Director',
      bio: 'Lars has built GoFood\'s platform from the ground up, focusing on usability and performance.',
      image: user3
    }
  ];

  // Values
  const values = [
    {
      title: 'Community',
      description: 'We believe in the power of sharing experiences and inspiring each other through good food.',
      icon: 'users'
    },
    {
      title: 'Accessibility',
      description: 'Cooking should be for everyone - regardless of experience or background.',
      icon: 'universal-access'
    },
    {
      title: 'Quality',
      description: 'We prioritize thoroughly tested recipes and high quality in everything we do.',
      icon: 'award'
    },
    {
      title: 'Sustainability',
      description: 'We promote sustainable food choices and minimizing food waste.',
      icon: 'leaf'
    }
  ];
</script>

<!-- Hero Section -->
<section class="about-hero-section">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6 hero-content">
        <h1 class="hero-title">Our <span class="text-gradient">Mission</span></h1>
        <p class="hero-subtitle">We connect people through their love of food and make it easy to discover, share, and prepare delicious meals.</p>
        <div class="hero-stats row mt-5">
          <div class="col-4">
            <div class="stat-item">
              <div class="stat-number counter">50K+</div>
              <div class="stat-label">Users</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item">
              <div class="stat-number counter">100K+</div>
              <div class="stat-label">Recipes</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item">
              <div class="stat-number counter">180+</div>
              <div class="stat-label">Countries</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6 text-center">
        <div class="about-image-container">
          <img src={heroFood} alt="GoFood Team" class="img-fluid rounded-lg shadow-lg">
          <div class="shape-accent shape-1"></div>
          <div class="shape-accent shape-2"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Our Story Section -->
<section class="our-story-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Our Story</h2>
      <p class="section-subtitle">From passion to platform - the history of GoFood</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="timeline">
          {#each milestones as milestone, index}
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-year">{milestone.year}</div>
                <h3 class="timeline-title">{milestone.title}</h3>
                <p class="timeline-description">{milestone.description}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Our Values Section -->
<section class="values-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Our Values</h2>
      <p class="section-subtitle">Principles that guide everything we do</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row">
      {#each values as value}
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="value-card text-center">
            <div class="value-icon">
              <i class={`fas fa-${value.icon}`}></i>
            </div>
            <h3 class="value-title">{value.title}</h3>
            <p class="value-description">{value.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Meet the Team Section -->
<section class="team-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Meet the Team</h2>
      <p class="section-subtitle">Passionate people behind GoFood</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row">
      {#each teamMembers as member}
        <div class="col-md-4 mb-4">
          <div class="team-card">
            <div class="team-image">
              <img src={member.image} alt={member.name} class="img-fluid">
            </div>
            <div class="team-content">
              <h3 class="team-name">{member.name}</h3>
              <p class="team-role">{member.role}</p>
              <p class="team-bio">{member.bio}</p>
              <div class="team-social">
                <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
                <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Join Us CTA Section -->
<section class="about-cta-section py-5 text-center fade-in-section">
  <div class="container">
    <div class="cta-content p-5 rounded-lg">
      <h2 class="mb-3">Join the GoFood Community</h2>
      <p class="mb-4">Share your food passion, find inspiration, and discover new dishes from around the world</p>
      <div class="cta-buttons">
        <a href="/signup" class="btn primary-btn me-3 mb-2">Sign Up</a>
        <a href="/contact" class="btn secondary-btn mb-2">Contact Us</a>
      </div>
    </div>
  </div>
</section>

<style>
  /* Hero Section */
  .about-hero-section {
    background-color: #ffffff;
    padding: 100px 0 80px;
    position: relative;
    overflow: hidden;
  }
  
  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    color: #2c3e50;
  }
  
  .text-gradient {
    background: linear-gradient(45deg, #80c244, #3ca55c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: #6c757d;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .hero-stats {
    margin-top: 3rem;
    padding-top: 1rem;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-number {
    font-size: 2.2rem;
    font-weight: 700;
    color: #80c244;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: #6c757d;
    font-weight: 500;
  }
  
  .about-image-container {
    position: relative;
    padding: 20px;
  }
  
  .shape-accent {
    position: absolute;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    z-index: -1;
  }
  
  .shape-1 {
    width: 200px;
    height: 200px;
    background-color: rgba(128, 194, 68, 0.1);
    top: -30px;
    right: 0;
  }
  
  .shape-2 {
    width: 250px;
    height: 250px;
    background-color: rgba(44, 62, 80, 0.05);
    bottom: -30px;
    left: 0;
  }
  
  /* Section Styles */
  .section-header {
    margin-bottom: 3rem;
  }
  
  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
  }
  
  .section-subtitle {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 1.5rem;
  }
  
  .divider {
    height: 4px;
    width: 60px;
    background: linear-gradient(to right, #80c244, #3ca55c);
    border-radius: 2px;
    margin-bottom: 2rem;
  }
  
  /* Timeline Styles */
  .timeline {
    position: relative;
    padding: 20px 0;
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 3px;
    background: linear-gradient(to bottom, #80c244, #3ca55c);
    transform: translateX(-50%);
  }
  
  .timeline-item {
    position: relative;
    padding: 30px 0;
  }
  
  .timeline-dot {
    position: absolute;
    width: 20px;
    height: 20px;
    left: 50%;
    background: #80c244;
    border-radius: 50%;
    transform: translateX(-50%);
    z-index: 1;
    box-shadow: 0 0 0 4px rgba(128, 194, 68, 0.2);
  }
  
  .timeline-content {
    position: relative;
    width: calc(50% - 40px);
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    margin-left: auto;
  }
  
  .timeline-item:nth-child(even) .timeline-content {
    margin-left: 0;
    margin-right: auto;
  }
  
  .timeline-year {
    display: inline-block;
    padding: 5px 15px;
    background: #80c244;
    color: white;
    border-radius: 20px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .timeline-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 10px;
  }
  
  .timeline-description {
    color: #6c757d;
    margin-bottom: 0;
  }
  
  /* Values Section */
  .value-card {
    background: white;
    padding: 30px 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    height: 100%;
  }
  
  .value-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  
  .value-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #80c244;
  }
  
  .value-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  .value-description {
    color: #6c757d;
  }
  
  /* Team Section */
  .team-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    height: 100%;
  }
  
  .team-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  
  .team-image {
    height: 250px;
    overflow: hidden;
  }
  
  .team-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
  }
  
  .team-card:hover .team-image img {
    transform: scale(1.1);
  }
  
  .team-content {
    padding: 25px;
  }
  
  .team-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 5px;
    color: #2c3e50;
  }
  
  .team-role {
    color: #80c244;
    font-weight: 500;
    margin-bottom: 15px;
  }
  
  .team-bio {
    color: #6c757d;
    margin-bottom: 20px;
  }
  
  .team-social {
    display: flex;
    gap: 10px;
  }
  
  .social-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #f1f1f1;
    color: #2c3e50;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .social-link:hover {
    background: #80c244;
    color: white;
  }
  
  /* CTA Section */
  .about-cta-section {
    margin: 50px 0;
  }
  
  .cta-content {
    background-color: #ffffff;
    border: 2px solid #80c244;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 30px rgba(0,0,0,0.05);
    position: relative;
  }
  
  .cta-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, #80c244, #3ca55c);
  }
  
  .cta-content h2 {
    color: #2c3e50;
    font-weight: 700;
  }
  
  .cta-content p {
    color: #6c757d;
  }
  
  .cta-buttons .btn {
    padding: 0.8rem 2rem;
    font-weight: 600;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  }
  
  /* Animation Styles */
  .fade-in-section {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s ease-out, transform 1s ease-out;
  }
  
  .fade-in-section.animate {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Media Queries */
  @media (max-width: 991.98px) {
    .hero-title {
      font-size: 2.5rem;
    }
    
    .section-title {
      font-size: 2rem;
    }
    
    .timeline::before {
      left: 30px;
    }
    
    .timeline-content {
      width: calc(100% - 80px);
      margin-left: 80px !important;
    }
    
    .timeline-dot {
      left: 30px;
    }
  }
  
  @media (max-width: 767.98px) {
    .about-hero-section {
      padding: 60px 0;
    }
    
    .hero-title {
      font-size: 2rem;
    }
  }
</style>
