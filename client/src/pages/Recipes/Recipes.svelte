<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import Recipe from '../../components/Recipe/Recipe.svelte';
  import { user } from '../../stores/auth.js';

  // State
  let recipes = [];
  let isLoading = true;
  let error = null;
  let searchQuery = '';
  let activeCategory = 'all';

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
    } catch (err) {
      console.error('Error fetching recipes:', err);
      error = err.message;
    } finally {
      isLoading = false;
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
    <div class="row mb-4">
      <div class="col-12 text-center">
        <h1 class="display-5 fw-bold text-success">Recipes</h1>
        <p class="lead">Explore our collection of delicious recipes</p>
      </div>
      {#if $user}
        <div class="col-12 d-flex justify-content-center mt-3">
          <button class="btn btn-success" on:click={() => navigate('/create')}>
            <i class="bi bi-plus-circle me-1"></i> Create Recipe
          </button>
        </div>
      {/if}
    </div>

    {#if !$user}
      <!-- Login prompt if not logged in -->
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-lock-fill text-success" style="font-size: 4rem;"></i>
          <h2 class="mt-4">Please Login to View Recipes</h2>
          <p class="lead text-muted mb-4">
            Our delicious recipes are available to registered users. 
            Please login or sign up to explore and share recipes.
          </p>
          <div class="d-flex justify-content-center gap-3">
            <button class="btn btn-success btn-lg d-flex align-items-center justify-content-center" style="min-width: 120px;" on:click={() => navigate('/login')}>
              <i class="bi bi-box-arrow-in-right me-2"></i> Login
            </button>
            <button class="btn btn-outline-success btn-lg d-flex align-items-center justify-content-center" style="min-width: 120px;" on:click={() => navigate('/signup')}>
              <i class="bi bi-person-plus me-2"></i> Sign Up
            </button>
          </div>
        </div>
      </div>
    {:else}
      <!-- Search and filter (only for logged in users) -->
      <div class="row mb-4 justify-content-center">
        <div class="col-md-6 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control border-start-0" 
              placeholder="Search recipes..." 
              bind:value={searchQuery}
            >
          </div>
        </div>
      </div>

      <!-- Recipe list (only for logged in users) -->
      {#if isLoading}
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      {:else if error}
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      {:else if filteredRecipes.length === 0}
        <div class="text-center py-5">
          <i class="bi bi-search" style="font-size: 3rem; color: #ccc;"></i>
          <h3 class="mt-3">No recipes found</h3>
          <p class="text-muted">Try changing your search or create a new recipe</p>
          
          <button class="btn btn-success mt-3" on:click={() => navigate('/create')}>
            <i class="bi bi-plus-circle me-1"></i> Create Recipe
          </button>
        </div>
      {:else}
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {#each filteredRecipes as recipe (recipe._id)}
            <div class="col">
              <Recipe {recipe} compact={true} />
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .recipes-section {
    background: #ffffff;
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .card {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .lead {
    color: #6c757d;
  }
  .input-group-text {
    color: #6c757d;
  }
  input.form-control:focus {
    border-color: #28a745;
    box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
  }
  .btn-success {
    background-color: #80c244!important;
    color: #fff !important;
    border: none;
  }
  .btn-success:hover {
    transform: translateY(-3px);
  }
  .btn-outline-success {
    color: #80c244 !important;
    border-color: #80c244 !important;
  }
  .btn-outline-success:hover {  
    background-color: #80c244 !important;
    color: #fff !important;  
    border-color: #80c244 !important;
  }
</style>