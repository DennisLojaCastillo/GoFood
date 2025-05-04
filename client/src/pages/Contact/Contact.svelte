<script>
  import { onMount } from 'svelte';
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

  // Contact methods
  const contactMethods = [
    {
      title: 'Customer Support',
      description: 'Having trouble with the platform? Our team is ready to help.',
      icon: 'headset',
      contact: 'support@gofood.com'
    },
    {
      title: 'Business Inquiries',
      description: 'For partnerships, advertising, and other business opportunities.',
      icon: 'briefcase',
      contact: 'business@gofood.com'
    },
    {
      title: 'Recipe Submissions',
      description: 'Would you like your recipe to be featured? Let us know!',
      icon: 'utensils',
      contact: 'recipes@gofood.com'
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: 'How long does it take to get a response?',
      answer: 'We aim to respond to all inquiries within 24-48 hours during business days. Complex issues may take a bit longer to resolve.'
    },
    {
      question: 'Can I suggest a new feature?',
      answer: 'Absolutely! We love hearing from our community. Please use the feature request form or email your ideas to support@gofood.com.'
    },
    {
      question: 'Do you provide technical support?',
      answer: 'Yes, our technical team is available to help with any issues related to the GoFood platform. Please provide as much detail as possible about the problem you\'re experiencing.'
    }
  ];

  // Form handling
  let name = '';
  let email = '';
  let subject = '';
  let message = '';
  let formSubmitted = false;
  let formError = false;

  function handleSubmit() {
    // Basic validation
    if (!name || !email || !message) {
      formError = true;
      return;
    }
    
    // In a real application, you would send the form data to a server here
    formSubmitted = true;
    formError = false;
    
    // Reset the form
    name = '';
    email = '';
    subject = '';
    message = '';
    
    // After 3 seconds, reset the submission status
    setTimeout(() => {
      formSubmitted = false;
    }, 3000);
  }
</script>

<!-- Hero Section -->
<section class="contact-hero-section">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6 hero-content">
        <h1 class="hero-title">Get in <span class="text-gradient">Touch</span></h1>
        <p class="hero-subtitle">We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, our team is here to help.</p>
        <div class="hero-contact-info mt-4">
          <div class="contact-info-item">
            <i class="fas fa-envelope text-primary me-2"></i>
            <span>hello@gofood.com</span>
          </div>
          <div class="contact-info-item mt-2">
            <i class="fas fa-phone-alt text-primary me-2"></i>
            <span>+1 (555) 123-4567</span>
          </div>
          <div class="contact-info-item mt-2">
            <i class="fas fa-map-marker-alt text-primary me-2"></i>
            <span>123 Culinary Street, Foodville, CA 94103</span>
          </div>
        </div>
      </div>
      <div class="col-lg-6 text-center">
        <div class="contact-image-container">
          <img src={heroFood} alt="Contact GoFood" class="img-fluid rounded-lg shadow-lg">
          <div class="shape-accent shape-1"></div>
          <div class="shape-accent shape-2"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Contact Form Section -->
<section class="contact-form-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Send Us a Message</h2>
      <p class="section-subtitle">We'll get back to you as soon as possible</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="contact-form-card">
          {#if formSubmitted}
            <div class="alert alert-success" role="alert">
              Thank you for your message! We'll get back to you soon.
            </div>
          {/if}
          
          {#if formError}
            <div class="alert alert-danger" role="alert">
              Please fill out all required fields.
            </div>
          {/if}
          
          <form on:submit|preventDefault={handleSubmit} class="contact-form">
            <div class="row">
              <div class="col-md-6 mb-4">
                <div class="form-group">
                  <label for="name" class="form-label">Your Name*</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    placeholder="Enter your name" 
                    bind:value={name}
                    required
                  >
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <div class="form-group">
                  <label for="email" class="form-label">Your Email*</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    placeholder="Enter your email" 
                    bind:value={email}
                    required
                  >
                </div>
              </div>
            </div>
            
            <div class="form-group mb-4">
              <label for="subject" class="form-label">Subject</label>
              <input 
                type="text" 
                class="form-control" 
                id="subject" 
                placeholder="What is this regarding?" 
                bind:value={subject}
              >
            </div>
            
            <div class="form-group mb-4">
              <label for="message" class="form-label">Your Message*</label>
              <textarea 
                class="form-control" 
                id="message" 
                rows="6" 
                placeholder="Please enter your message here..." 
                bind:value={message}
                required
              ></textarea>
            </div>
            
            <div class="text-center mt-4">
              <button type="submit" class="btn primary-btn">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Contact Methods Section -->
<section class="contact-methods-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">How Can We Help You?</h2>
      <p class="section-subtitle">Choose the best way to reach us based on your needs</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row">
      {#each contactMethods as method}
        <div class="col-md-4 mb-4">
          <div class="contact-method-card text-center">
            <div class="contact-method-icon">
              <i class={`fas fa-${method.icon}`}></i>
            </div>
            <h3 class="contact-method-title">{method.title}</h3>
            <p class="contact-method-description">{method.description}</p>
            <a href={`mailto:${method.contact}`} class="contact-method-email">
              {method.contact}
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- FAQ Section -->
<section class="faq-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Frequently Asked Questions</h2>
      <p class="section-subtitle">Quick answers to common inquiries</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="accordion" id="contactFaqAccordion">
          {#each faqItems as item, index}
            <div class="accordion-item">
              <h2 class="accordion-header" id={`heading${index}`}>
                <button 
                  class="accordion-button {index > 0 ? 'collapsed' : ''}" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target={`#collapse${index}`} 
                  aria-expanded={index === 0 ? 'true' : 'false'} 
                  aria-controls={`collapse${index}`}
                >
                  {item.question}
                </button>
              </h2>
              <div 
                id={`collapse${index}`} 
                class="accordion-collapse collapse {index === 0 ? 'show' : ''}" 
                aria-labelledby={`heading${index}`} 
                data-bs-parent="#contactFaqAccordion"
              >
                <div class="accordion-body">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Map Section -->
<section class="map-section py-5 fade-in-section">
  <div class="container">
    <div class="section-header text-center mb-5">
      <h2 class="section-title">Visit Our Office</h2>
      <p class="section-subtitle">Come say hello in person!</p>
      <div class="divider mx-auto"></div>
    </div>
    
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="map-card">
          <!-- Replace this with an actual map integration if needed -->
          <div class="map-placeholder">
            <div class="map-overlay d-flex flex-column justify-content-center align-items-center">
              <i class="fas fa-map-marker-alt mb-3" style="font-size: 3rem; color: #80c244;"></i>
              <h3>GoFood Headquarters</h3>
              <p>123 Culinary Street, Foodville, CA 94103</p>
              <a href="https://maps.google.com" target="_blank" class="btn secondary-btn mt-3">
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* Hero Section */
  .contact-hero-section {
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
  
  .hero-contact-info {
    font-size: 1.1rem;
    color: #6c757d;
  }
  
  .contact-info-item {
    display: flex;
    align-items: center;
  }
  
  .contact-image-container {
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
  
  /* Contact Form */
  .contact-form-card {
    background: white;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }
  
  .form-control {
    padding: 0.8rem 1.2rem;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
  }
  
  .form-control:focus {
    box-shadow: none;
    border-color: #80c244;
  }
  
  .form-label {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  /* Contact Methods */
  .contact-method-card {
    background: white;
    padding: 30px 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    height: 100%;
  }
  
  .contact-method-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  
  .contact-method-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #80c244;
  }
  
  .contact-method-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  .contact-method-description {
    color: #6c757d;
    margin-bottom: 15px;
  }
  
  .contact-method-email {
    color: #80c244;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .contact-method-email:hover {
    color: #3ca55c;
    text-decoration: underline;
  }
  
  /* FAQ Section */
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
  
  /* Map Section */
  .map-card {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }
  
  .map-placeholder {
    height: 400px;
    background-color: #f8f9fa;
    position: relative;
  }
  
  .map-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    text-align: center;
    padding: 2rem;
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
    
    .contact-form-card {
      padding: 30px;
    }
  }
  
  @media (max-width: 767.98px) {
    .contact-hero-section {
      padding: 60px 0;
    }
    
    .hero-title {
      font-size: 2rem;
    }
  }
</style>