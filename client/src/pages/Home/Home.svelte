<script>
  import { onMount } from 'svelte';
  
  let featuredRecipes = [
    {
      id: 1,
      title: 'Italian Pasta Carbonara',
      image: '../src/assets/images/pasta.jpg',
      category: 'Italian',
      time: '30 min',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Thai Green Curry',
      image: '../src/assets/images/curry.jpg',
      category: 'Asian',
      time: '45 min',
      rating: 4.7
    },
    {
      id: 3,
      title: 'Classic Beef Burger',
      image: '../src/assets/images/burger.jpg',
      category: 'American',
      time: '25 min',
      rating: 4.9
    }
  ];
  
  let testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      image: '../src/assets/images/user1.jpg',
      text: 'GoFood transformed my cooking experience! The recipes are easy to follow and absolutely delicious.',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Robinson', 
      image: '../src/assets/images/user2.jpg',
      text: "I've tried so many new dishes thanks to GoFood. The step-by-step instructions make cooking fun!",
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Chen',
      image: '../src/assets/images/user3.jpg',
      text: 'As a busy professional, GoFood has been a game-changer. Quick, healthy recipes that never disappoint!',
      rating: 4
    }
  ];
  
  let categories = [
    { name: 'Italian', icon: 'pizza-slice', count: 120 },
    { name: 'Asian', icon: 'bowl-rice', count: 85 },
    { name: 'Mexican', icon: 'pepper-hot', count: 64 },
    { name: 'Desserts', icon: 'ice-cream', count: 78 },
    { name: 'Vegetarian', icon: 'seedling', count: 92 },
    { name: 'Seafood', icon: 'fish', count: 45 }
  ];
  
  let features = [
    { title: 'Create & Share', description: 'Create your own recipes and share them with the community', icon: 'pen-to-square' },
    { title: 'Save Favorites', description: 'Save your favorite recipes for quick access anytime', icon: 'heart' },
    { title: 'Meal Planning', description: 'Plan your weekly meals with our intuitive tools', icon: 'calendar-days' },
    { title: 'Shopping Lists', description: 'Generate shopping lists from your selected recipes', icon: 'list-check' }
  ];

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
</script>

<!-- Hero Section with Enhanced Animation -->
<section class="hero-section">
  <!-- Background Shapes -->
  <div class="hero-shape shape-1" style="background: linear-gradient(45deg, #80c244, #3ca55c);"></div>
  <div class="hero-shape shape-2" style="background: linear-gradient(45deg, #ffd452, #ff7b1d);"></div>
  <div class="hero-shape shape-3" style="background: linear-gradient(45deg, #5e72e4, #825ee4);"></div>

  <div class="container">
    <div class="row align-items-center">
      <!-- Hero Content -->
      <div class="col-lg-6 hero-content">
        <h1 class="hero-title">Elevate Your <span class="text-gradient">Culinary</span> Journey</h1>
        <p class="hero-subtitle">Find, create, and share delicious recipes with a community that celebrates the joy of cooking. Turn everyday meals into extraordinary experiences.</p>
        
        <!-- CTA Buttons -->
        <div class="hero-buttons">
          <a href="/recipes" class="btn primary-btn me-3 mb-2">Discover Recipes</a>
          <a href="/signup" class="btn secondary-btn mb-2">Join Our Community</a>
        </div>

        <!-- Stats -->
        <div class="hero-stats row mt-5">
          <div class="col-4">
            <div class="stat-item">
              <div class="stat-number counter">500+</div>
              <div class="stat-label">Recipes</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item">
              <div class="stat-number counter">10K+</div>
              <div class="stat-label">Users</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item">
              <div class="stat-number counter">25+</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Image -->
      <div class="col-lg-6 hero-image">
        <img src="../src/assets/images/Hero_food.png" alt="Delicious Food" class="img-fluid hero-image-main">
        
        <!-- Floating Cards with Enhanced Design -->
        <div class="floating-card card-1">
          <div class="d-flex align-items-center">
            <i class="fas fa-utensils text-primary me-2"></i>
            <span>Tasty recipes daily</span>
          </div>
        </div>
        
        <div class="floating-card card-2">
          <div class="d-flex align-items-center">
            <i class="fas fa-star text-warning me-2"></i>
            <span>Top-rated by chefs</span>
          </div>
        </div>
        
        <div class="floating-card card-3">
          <div class="d-flex align-items-center">
            <i class="fas fa-globe text-success me-2"></i>
            <span>Global cuisines</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Featured Recipes Section -->
<section class="featured-recipes-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Culinary Inspiration</h2>
      <p class="section-subtitle">Discover our community's most beloved creations</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row">
      {#each featuredRecipes as recipe}
        <div class="col-md-4 mb-4">
          <div class="recipe-card">
            <div class="recipe-image">
              <img src={recipe.image} alt={recipe.title} class="img-fluid">
              <div class="recipe-category">{recipe.category}</div>
              <div class="recipe-time"><i class="far fa-clock me-1"></i> {recipe.time}</div>
            </div>
            <div class="recipe-content">
              <h3 class="recipe-title">{recipe.title}</h3>
              <div class="recipe-rating">
                {#each Array(5) as _, i}
                  <i class={`fas fa-star ${i < Math.floor(recipe.rating) ? 'text-warning' : 'text-muted'}`}></i>
                {/each}
                <span class="ms-1">{recipe.rating}</span>
              </div>
              <a href={`/recipes/${recipe.id}`} class="btn btn-outline-primary btn-sm mt-3">View Recipe</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <div class="text-center mt-4">
      <a href="/recipes" class="btn primary-btn">View All Recipes</a>
    </div>
  </div>
</section>

<!-- Categories Section -->
<section class="categories-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Explore Culinary Worlds</h2>
      <p class="section-subtitle">Journey through diverse cuisines and flavors</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row">
      {#each categories as category}
        <div class="col-6 col-md-4 col-lg-2 mb-4">
          <div class="category-card text-center">
            <div class="category-icon">
              <i class={`fas fa-${category.icon}`}></i>
            </div>
            <h4 class="category-name">{category.name}</h4>
            <p class="category-count">{category.count} recipes</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- How It Works Section -->
<section class="how-it-works-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Your GoFood Journey</h2>
      <p class="section-subtitle">Four simple steps to elevate your cooking experience</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row">
      <div class="col-md-3 text-center mb-4">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-icon"><i class="fas fa-search"></i></div>
          <h4 class="step-title">Discover</h4>
          <p class="step-description">Browse through our diverse collection of recipes</p>
        </div>
      </div>
      
      <div class="col-md-3 text-center mb-4">
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-icon"><i class="fas fa-bookmark"></i></div>
          <h4 class="step-title">Save</h4>
          <p class="step-description">Bookmark your favorites for easy access</p>
        </div>
      </div>
      
      <div class="col-md-3 text-center mb-4">
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-icon"><i class="fas fa-chef-hat"></i></div>
          <h4 class="step-title">Cook</h4>
          <p class="step-description">Follow step-by-step instructions to prepare</p>
        </div>
      </div>
      
      <div class="col-md-3 text-center mb-4">
        <div class="step-card">
          <div class="step-number">4</div>
          <div class="step-icon"><i class="fas fa-share-alt"></i></div>
          <h4 class="step-title">Share</h4>
          <p class="step-description">Share your culinary creations with the community</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ Section -->
<section class="faq-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Common Questions</h2>
      <p class="section-subtitle">Everything you need to know about GoFood</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="accordion" id="faqAccordion">
          <!-- FAQ Item 1 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                Is GoFood free to use?
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>Yes, GoFood is completely free to use! Create an account to access all features including saving favorites, creating your own recipes, and interacting with our community.</p>
              </div>
            </div>
          </div>
          
          <!-- FAQ Item 2 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Can I share my own recipes?
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>Absolutely! GoFood encourages you to share your culinary creations. Once logged in, you can easily upload recipes, add photos, and share them with our global community of food enthusiasts.</p>
              </div>
            </div>
          </div>
          
          <!-- FAQ Item 3 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                How do I save my favorite recipes?
              </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>When you find a recipe you love, simply click the heart icon to add it to your favorites. All your saved recipes will be available in your personal dashboard for quick access anytime.</p>
              </div>
            </div>
          </div>
          
          <!-- FAQ Item 4 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingFour">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                Are there meal planning features?
              </button>
            </h2>
            <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>Yes! GoFood offers comprehensive meal planning tools. You can create weekly meal plans, automatically generate shopping lists based on your selected recipes, and organize your cooking schedule efficiently.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Join Community CTA Section -->
<section class="cta-section py-5 text-center fade-in-section">
  <div class="container">
    <div class="cta-content p-5 rounded-lg">
      <h2 class="mb-3">Begin Your Flavor Adventure</h2>
      <p class="mb-4">Join our community of food lovers and discover a world of delicious possibilities</p>
      <div class="cta-buttons">
        <a href="/signup" class="btn primary-btn me-3 mb-2">Get Started Now</a>
        <a href="/recipes" class="btn secondary-btn mb-2">Browse Recipes</a>
      </div>
    </div>
  </div>
</section>

<style>
  /* Enhanced Hero Section */
  .hero-section {
    background-color: #ffffff;
    padding: 100px 0 80px;
    position: relative;
    overflow: hidden;
  }
  
  .hero-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.2;
    z-index: 0;
  }
  
  .shape-1 {
    width: 500px;
    height: 500px;
    top: -250px;
    right: -250px;
  }
  
  .shape-2 {
    width: 400px;
    height: 400px;
    bottom: -200px;
    left: -200px;
  }
  
  .shape-3 {
    width: 300px;
    height: 300px;
    top: 40%;
    left: 30%;
    z-index: -1;
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
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
  
  .hero-buttons .btn {
    padding: 0.8rem 2rem;
    font-weight: 600;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  }
  
  .hero-stats {
    margin-top: 3rem;
    padding-top: 2rem;
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
  
  .hero-image {
    position: relative;
    z-index: 2;
  }
  
  .hero-image-main {
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    transition: all 0.5s ease;
    transform: perspective(1000px) rotateY(5deg) rotateX(5deg);
  }
  
  .hero-image-main:hover {
    transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
  }
  
  .floating-card {
    position: absolute;
    background: white;
    padding: 1rem;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    animation: float 3s ease-in-out infinite;
    z-index: 3;
  }
  
  .card-1 {
    top: 10%;
    left: -5%;
    animation-delay: 0s;
  }
  
  .card-2 {
    bottom: 15%;
    right: -5%;
    animation-delay: 1.5s;
  }
  
  .card-3 {
    top: 50%;
    right: 10%;
    animation-delay: 0.8s;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
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
  
  /* Featured Recipes */
  .recipe-card {
    background: #fff;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    height: 100%;
  }
  
  .recipe-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  
  .recipe-image {
    position: relative;
    overflow: hidden;
  }
  
  .recipe-image img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: all 0.5s ease;
  }
  
  .recipe-card:hover .recipe-image img {
    transform: scale(1.1);
  }
  
  .recipe-category {
    position: absolute;
    top: 15px;
    left: 15px;
    background: #80c244;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .recipe-time {
    position: absolute;
    bottom: 15px;
    right: 15px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
  }
  
  .recipe-content {
    padding: 20px;
  }
  
  .recipe-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #2c3e50;
  }
  
  .recipe-rating {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  /* Categories */
  .category-card {
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    height: 100%;
  }
  
  .category-card:hover {
    transform: translateY(-7px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  
  .category-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
    color: #80c244;
  }
  
  .category-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 5px;
    color: #2c3e50;
  }
  
  .category-count {
    font-size: 0.9rem;
    color: #6c757d;
  }
  
  /* How It Works */
  .step-card {
    position: relative;
    padding: 30px 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    height: 100%;
    transition: all 0.3s ease;
  }
  
  .step-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  
  .step-number {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: #80c244;
    border-radius: 50%;
    color: white;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 8px rgba(128, 194, 68, 0.3);
  }
  
  .step-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #80c244;
  }
  
  .step-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #2c3e50;
  }
  
  .step-description {
    color: #6c757d;
  }
  
  /* Features */
  .bg-gradient {
    background: linear-gradient(45deg, #80c244, #3ca55c);
    box-shadow: 0 10px 30px rgba(60, 165, 92, 0.2);
  }
  
  .feature-card {
    background: white;
    padding: 30px 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    height: 100%;
    transition: all 0.3s ease;
  }
  
  .feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
  
  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #80c244;
  }
  
  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #2c3e50;
  }
  
  .feature-description {
    color: #6c757d;
  }
  
  /* Testimonials */
  .testimonial-card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    height: 100%;
    transition: all 0.3s ease;
  }
  
  .testimonial-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  
  .testimonial-rating {
    margin-bottom: 15px;
  }
  
  .testimonial-text {
    font-style: italic;
    color: #555;
    margin-bottom: 20px;
    font-size: 1rem;
    line-height: 1.6;
  }
  
  .testimonial-user {
    display: flex;
    align-items: center;
  }
  
  .testimonial-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 15px;
  }
  
  .testimonial-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .testimonial-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0;
    color: #2c3e50;
  }
  
  .testimonial-title {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0;
  }
  
  /* CTA Section */
  .cta-section {
    margin: 50px 0;
  }
  
  .cta-content {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
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
    
    .hero-image {
      margin-top: 3rem;
    }
    
    .section-title {
      font-size: 2rem;
    }
  }
  
  @media (max-width: 767.98px) {
    .hero-section {
      padding: 60px 0;
    }
    
    .hero-title {
      font-size: 2rem;
    }
    
    .floating-card {
      padding: 0.75rem;
      font-size: 0.8rem;
    }
  }

  /* Features Section with white text */
  .features-section .section-title {
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .features-section .section-subtitle {
    color: rgba(255, 255, 255, 0.9);
  }

  /* CTA Section with white text */
  .cta-section h2 {
    color: #ffffff;
    font-weight: 700;
    text-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .cta-section p {
    color: rgba(255, 255, 255, 0.9);
  }

  /* Cards and content */
  .recipe-title, .category-name, .step-title, .feature-title, .testimonial-name {
    color: #2c3e50;
  }

  /* Category icons color */
  .category-icon {
    color: #80c244;
  }

  /* Step numbers background */
  .step-number {
    background: #80c244;
    box-shadow: 0 4px 8px rgba(128, 194, 68, 0.3);
  }

  /* Update the gradient background for better contrast */
  .bg-gradient {
    background: linear-gradient(45deg, #80c244, #3ca55c);
    box-shadow: 0 10px 30px rgba(60, 165, 92, 0.2);
  }

  /* FAQ Section */
  .faq-section {
    background-color: #f8f9fa;
  }
  
  .accordion-item {
    border: none;
    margin-bottom: 1rem;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
  
  .accordion-button {
    padding: 1.25rem 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    background-color: #ffffff;
    box-shadow: none;
  }
  
  .accordion-button:not(.collapsed) {
    color: #80c244;
    background-color: #ffffff;
    box-shadow: none;
  }
  
  .accordion-button:focus {
    box-shadow: none;
    border-color: rgba(128, 194, 68, 0.2);
  }
  
  .accordion-button:not(.collapsed)::after {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%2380c244'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
  }
  
  .accordion-body {
    padding: 1.5rem;
    background-color: #ffffff;
  }
  
  .accordion-body p {
    color: #6c757d;
    margin-bottom: 0;
  }

  /* Generel stil for alle sektioner */
  .featured-recipes-section,
  .categories-section,
  .how-it-works-section,
  .faq-section,
  .cta-section {
    background-color: #ffffff;
  }
  
  /* Subtile skygger på sektionsgrænser */
  .featured-recipes-section,
  .how-it-works-section,
  .faq-section {
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  /* Alternativ separator */
  .categories-section::before,
  .how-it-works-section::before,
  .faq-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0), rgba(0,0,0,0.1), rgba(255,255,255,0));
  }
  
  /* Særligt for sektioner hvor der tidligere var mørk baggrund */
  .featured-recipes-section .section-title,
  .how-it-works-section .section-title {
    color: #2c3e50;
  }
  
  .featured-recipes-section .section-subtitle,
  .how-it-works-section .section-subtitle {
    color: #6c757d;
  }
  
  /* CTA Section */
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
  
  /* FAQ Section - let modificeret baggrund */
  .faq-section {
    background-color: #f9f9f9;
  }
</style>