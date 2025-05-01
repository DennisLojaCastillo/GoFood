<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user } from '../../stores/auth.js';

  // Props from router
  export let params = {};

  // State
  let recipe = null;
  let isLoading = true;
  let error = null;
  let recipeId = null;
  let showDeleteModal = false;

  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }

  // Check if the user is the author
  function isAuthor() {
    
    // Check various possible ID keys
    const userId = $user?._id || $user?.id || $user?.userId;
    const recipeCreator = recipe?.createdBy;
    
    const isUserCreator = $user && recipe && userId === recipeCreator;    
    return isUserCreator;
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Handle recipe image URL
  function getImageUrl(recipe) {
    if (!recipe || !recipe.imageUrl) {
      return 'https://fakeimg.pl/800x600?text=No+Image&font=bebas&font_size=55';
    }
    
    // Check if it's a full URL
    if (recipe.imageUrl.startsWith('http') || recipe.imageUrl.startsWith('https')) {
      return recipe.imageUrl;
    }
    
    // Fix the local URL to make sure it points to the correct server location
    let path = recipe.imageUrl;
    // Remove leading slash to avoid double slashes
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    // Ensure we use the correct server URL (same as API)
    return `http://localhost:3000/${path}`;
  }

  // Fetch recipe data
  async function fetchRecipe(id) {
    isLoading = true;
    error = null;

    try {
      if (!id) {
        throw new Error('No recipe ID provided');
      }

      // Check if user is logged in
      if (!$user) {
        isLoading = false;
        return;
      }

      // Add authentication token to request
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Could not find the recipe');
      }

      recipe = await response.json();  
    } catch (err) {
      console.error('Error fetching recipe:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  // Delete recipe
  async function deleteRecipe() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete the recipe');
      }

      // Navigate back to recipes list after successful deletion
      navigate('/recipes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      error = err.message;
    } finally {
      showDeleteModal = false;
    }
  }

  onMount(() => {
    // Get recipe ID from params
    if (params && params.id) {
      recipeId = params.id;
      fetchRecipe(recipeId);
    } else {
      // Fallback to URL parsing if params are not available
      const path = window.location.pathname;
      const match = path.match(/\/recipes\/([^\/]+)/);
      
      if (match && match[1]) {
        recipeId = match[1];
        fetchRecipe(recipeId);
      } else {
        error = 'Invalid recipe ID';
        isLoading = false;
      }
    }
  });
</script>

<div class="recipe-detail-section">
  <div class="container py-5">
    {#if !$user}
      <div class="text-center py-5">
        <div class="alert alert-warning d-inline-block" role="alert">
          <i class="bi bi-lock-fill me-2"></i> You must be logged in to view recipe details.
        </div>
        <div class="mt-4">
          <button class="btn btn-success me-2" on:click={() => navigate('/login')}>
            <i class="bi bi-box-arrow-in-right me-2"></i> Log in
          </button>
          <button class="btn btn-outline-success" on:click={() => navigate('/signup')}>
            <i class="bi bi-person-plus me-2"></i> Sign up
          </button>
        </div>
      </div>
    {:else if isLoading}
      <div class="d-flex justify-content-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    {:else if error}
      <div class="text-center py-5">
        <div class="alert alert-danger d-inline-block" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
        <div class="mt-4">
          <button class="btn btn-outline-success" on:click={() => navigate('/recipes')}>
            <i class="bi bi-arrow-left me-2"></i> Back to recipes
          </button>
        </div>
      </div>
    {:else if recipe}
      <div class="mb-4">
        <button class="btn btn-outline-success btn-sm" on:click={() => navigate('/recipes')}>
          <i class="bi bi-arrow-left me-1"></i> Back to recipes
        </button>
      </div>
      
      <div class="row">
        <!-- Left side with image -->
        <div class="col-lg-6 mb-4 mb-lg-0">
          <div class="card shadow-sm border-0 h-100">
            <img 
              src={getImageUrl(recipe)} 
              class="card-img-top" 
              alt={recipe.title}
              style="max-height: 400px; object-fit: cover;"
              on:error={(e) => {                
                e.target.src = 'https://fakeimg.pl/800x600?text=Image+Error&font=bebas&font_size=55';
              }}
            >
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h1 class="h2 card-title text-success mb-0">{recipe.title}</h1>
              </div>
              
              {#if recipe.createdAt}
                <p class="text-muted">
                  <i class="bi bi-calendar3 me-1"></i> Created {formatDate(recipe.createdAt)}
                </p>
              {/if}
              
              {#if isAuthor()}
                <div class="mt-3">
                  <button class="btn btn-outline-primary btn-sm me-2" on:click={() => navigate(`/recipes/edit/${recipeId}`)}>
                    <i class="bi bi-pencil-square me-1"></i> Edit
                  </button>
                  <button class="btn btn-outline-danger btn-sm" on:click={() => showDeleteModal = true}>
                    <i class="bi bi-trash me-1"></i> Delete
                  </button>
                </div>
              {:else}
                <div class="mt-3">
                  <!-- Remove favorite button -->
                </div>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- Right side with ingredients and steps -->
        <div class="col-lg-6">
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-success text-white py-3">
              <h2 class="h4 mb-0">Ingredients</h2>
            </div>
            <div class="card-body p-4">
              {#if recipe.ingredients && recipe.ingredients.length > 0}
                <ul class="list-group list-group-flush">
                  {#each recipe.ingredients as ingredient}
                    <li class="list-group-item px-0 py-2 d-flex align-items-center border-bottom">
                      <i class="bi bi-check-circle-fill text-success me-3"></i>
                      {ingredient}
                    </li>
                  {/each}
                </ul>
              {:else}
                <p class="text-muted">No ingredients provided</p>
              {/if}
            </div>
          </div>
          
          <div class="card shadow-sm border-0">
            <div class="card-header bg-success text-white py-3">
              <h2 class="h4 mb-0">Preparation</h2>
            </div>
            <div class="card-body p-4">
              {#if recipe.steps && recipe.steps.length > 0}
                <div class="steps">
                  {#each recipe.steps as step, index}
                    <div class="step-item mb-4">
                      <div class="d-flex">
                        <div class="rounded-circle bg-success text-white d-flex justify-content-center align-items-center me-3 flex-shrink-0" style="width: 36px; height: 36px;">
                          {index + 1}
                        </div>
                        <div>
                          <p class="mb-0">{step}</p>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-muted">No steps provided</p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Delete Confirmation Modal -->
    {#if showDeleteModal}
      <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirm Deletion</h5>
              <button type="button" class="btn-close" on:click={() => showDeleteModal = false} aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete this recipe?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" on:click={() => showDeleteModal = false}>Cancel</button>
              <button type="button" class="btn btn-danger" on:click={deleteRecipe}>Delete</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    {/if}
  </div>
</div>

<style>
  .recipe-detail-section {
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
  .card-title {
    font-weight: 600;
  }
  .step-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 1rem;
  }
  .list-group-item i {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  .modal {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .modal-content {
    border-radius: 10px;
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