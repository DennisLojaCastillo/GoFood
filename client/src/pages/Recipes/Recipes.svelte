<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import Recipe from '../../components/Recipe/Recipe.svelte';
  import { user } from '../../stores/auth.js';
  import { fade } from 'svelte/transition';

  // State
  let recipes = [];
  let isLoading = true;
  let error = null;
  let searchQuery = '';
  let activeCategory = 'all';
  let visible = false;

  // Fetch all recipes
  async function fetchRecipes() {
    if (!$user) {
      isLoading = false;
      return;
    }
    
    isLoading = true;
    error = null;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Could not fetch recipes');
      }
      
      recipes = await response.json();
      isLoading = false;
    } catch (err) {
      error = err.message || 'An error occurred while fetching recipes';
      isLoading = false;
    } finally {
      // Trigger fade-in animations
      setTimeout(() => {
        visible = true;
      }, 100);
    }
  }

  // Navigation function
  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }

  // Filter recipes based on search
  $: filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Re-fetch recipes when user login state changes
  $: if ($user) {
    fetchRecipes();
  }

  // Fetch recipes when component is mounted
  onMount(fetchRecipes);
</script>

<div class="recipes-section">
  <div class="container py-5">
    {#if visible}
      <div class="row mb-5" in:fade={{ duration: 500, delay: 100 }}>
        <div class="col-12 text-center">
          <h1 class="gradient-text mb-3">Delicious Recipes</h1>
          <p class="lead-text">Discover and share your favorite culinary creations</p>
          {#if $user}
            <div class="mt-4">
              <button class="create-btn" on:click={() => navigate('/create')}>
                <i class="fas fa-plus-circle me-2"></i> Create New Recipe
              </button>
            </div>
          {/if}
        </div>
      </div>

      {#if !$user}
        <!-- Login prompt if not logged in -->
        <div class="login-card" in:fade={{ duration: 500, delay: 300 }}>
          <div class="card-body text-center">
            <div class="lock-icon">
              <i class="fas fa-lock"></i>
            </div>
            <h2 class="mt-4 mb-3">Please Login to View Recipes</h2>
            <p class="card-text mb-4">
              Our delicious recipes are available to registered users. 
              Please login or sign up to explore and share recipes.
            </p>
            <div class="d-flex justify-content-center gap-3">
              <button class="auth-btn login-btn" on:click={() => navigate('/login')}>
                <i class="fas fa-sign-in-alt me-2"></i> Login
              </button>
              <button class="auth-btn signup-btn" on:click={() => navigate('/signup')}>
                <i class="fas fa-user-plus me-2"></i> Sign Up
              </button>
            </div>
          </div>
        </div>
      {:else}
        <!-- Search and filter (only for logged in users) -->
        <div class="row mb-4 justify-content-center" in:fade={{ duration: 500, delay: 300 }}>
          <div class="col-lg-6 col-md-8">
            <div class="search-container">
              <div class="search-icon">
                <i class="fas fa-search"></i>
              </div>
              <input 
                type="text" 
                class="search-input" 
                placeholder="Search for recipes..." 
                bind:value={searchQuery}
              >
            </div>
          </div>
        </div>

        <!-- Recipe list (only for logged in users) -->
        {#if isLoading}
          <div class="text-center py-5">
            <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading recipes...</p>
          </div>
        {:else if error}
          <div class="alert-card" role="alert" in:fade={{ duration: 300 }}>
            <i class="fas fa-exclamation-circle me-2"></i> {error}
          </div>
        {:else if filteredRecipes.length === 0}
          <div class="empty-state" in:fade={{ duration: 500, delay: 300 }}>
            <div class="empty-icon">
              <i class="fas fa-search"></i>
            </div>
            <h3>No recipes found</h3>
            <p>Try changing your search terms or create a new recipe</p>
            
            <button class="create-btn mt-4" on:click={() => navigate('/create')}>
              <i class="fas fa-plus-circle me-2"></i> Create New Recipe
            </button>
          </div>
        {:else}
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {#each filteredRecipes as recipe, i (recipe._id)}
              <div class="col" in:fade={{ duration: 300, delay: 300 + (i * 50) }}>
                <Recipe {recipe} compact={true} />
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    {:else}
      <!-- Loading Placeholder -->
      <div class="text-center py-5">
        <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading recipes...</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .recipes-section {
    background: #ffffff;
    padding: 0;
    position: relative;
    min-height: 85vh;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #80c244 0%, #2c3e50 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .lead-text {
    color: #6c757d;
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .create-btn {
    background-color: #80c244;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 0.75rem 1.75rem;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.2);
  }
  
  .create-btn:hover {
    background-color: #6ca036;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(128, 194, 68, 0.3);
  }
  
  .login-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    padding: 3rem 2rem;
    position: relative;
    transition: all 0.3s ease;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .login-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 50px rgba(0,0,0,0.1);
  }
  
  .lock-icon {
    width: 90px;
    height: 90px;
    background: linear-gradient(to bottom right, #f2f9ed, #e6f4da);
    color: #80c244;
    font-size: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    position: relative;
    box-shadow: 0 8px 20px rgba(128, 194, 68, 0.15);
  }
  
  .lock-icon::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid rgba(128, 194, 68, 0.2);
  }
  
  .card-text {
    color: #6c757d;
    max-width: 500px;
    margin: 0 auto;
    font-size: 1.1rem;
    line-height: 1.6;
  }
  
  .auth-btn {
    padding: 0.75rem 1.75rem;
    border-radius: 30px;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    min-width: 140px;
    justify-content: center;
  }
  
  .login-btn {
    background-color: #80c244;
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.2);
  }
  
  .login-btn:hover {
    background-color: #6ca036;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(128, 194, 68, 0.3);
  }
  
  .signup-btn {
    background-color: white;
    color: #2c3e50;
    border: 2px solid #e9ecef;
  }
  
  .signup-btn:hover {
    background-color: #f8f9fa;
    border-color: #dee2e6;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  }
  
  .search-container {
    position: relative;
    margin-bottom: 2rem;
  }
  
  .search-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #80c244;
    font-size: 1rem;
  }
  
  .search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 50px;
    border-radius: 30px;
    border: 2px solid #f1f3f5;
    background-color: #fff;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
  
  .search-input:focus {
    outline: none;
    border-color: #80c244;
    box-shadow: 0 5px 20px rgba(128, 194, 68, 0.15);
  }
  
  .alert-card {
    background-color: #ff5b5b;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    font-weight: 500;
    box-shadow: 0 5px 15px rgba(255, 91, 91, 0.2);
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 1rem;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .empty-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
    color: #adb5bd;
    font-size: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }
  
  .empty-state h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .empty-state p {
    color: #6c757d;
    margin-bottom: 1.5rem;
  }
</style>