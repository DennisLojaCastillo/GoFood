<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user } from '../../stores/auth.js';
  import { fade } from 'svelte/transition';

  // Props from router
  export let params = {};

  // State
  let recipe = null;
  let isLoading = true;
  let error = null;
  let recipeId = null;
  let showDeleteModal = false;
  let isFavorite = false;
  let visible = false;

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
      isFavorite = recipe.favoritedBy.includes($user.id);  // Update isFavorite status
      
      // Trigger fade-in animations
      setTimeout(() => {
        visible = true;
      }, 100);
      
    } catch (err) {
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
      error = err.message;
    } finally {
      showDeleteModal = false;
    }
  }

  async function toggleFavorite() {
    const action = isFavorite ? 'remove' : 'add';
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/user/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId: recipeId, action })
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      isFavorite = !isFavorite;
    } catch (err) {
      // Silent fail
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
      <div class="text-center py-5" in:fade={{ duration: 300 }}>
        <div class="login-card">
          <div class="card-body text-center">
            <div class="lock-icon">
              <i class="fas fa-lock"></i>
            </div>
            <h2 class="mt-4 mb-3">Please Login to View Recipe Details</h2>
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
      </div>
    {:else if isLoading}
      <div class="text-center py-5">
        <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading recipe details...</p>
      </div>
    {:else if error}
      <div class="text-center py-5" in:fade={{ duration: 300 }}>
        <div class="alert-card error" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i> {error}
        </div>
        <div class="mt-4">
          <button class="back-btn" on:click={() => navigate('/recipes')}>
            <i class="fas fa-arrow-left me-2"></i> Back to recipes
          </button>
        </div>
      </div>
    {:else if recipe && visible}
      <div in:fade={{ duration: 500, delay: 100 }}>
        <div class="back-section mb-4" in:fade={{ duration: 500, delay: 200 }}>
          <button class="back-btn" on:click={() => navigate('/recipes')}>
            <i class="fas fa-arrow-left me-2"></i> Back to recipes
          </button>
        </div>
        
        <div class="row g-4">
          <!-- Left side with image -->
          <div class="col-lg-6" in:fade={{ duration: 500, delay: 300 }}>
            <div class="recipe-image-card">
              <img 
                src={getImageUrl(recipe)} 
                class="recipe-img" 
                alt={recipe.title}
                on:error={(e) => {                
                  e.target.src = 'https://fakeimg.pl/800x600?text=Image+Error&font=bebas&font_size=55';
                }}
              >
              
              <div class="recipe-actions">
                {#if isAuthor()}
                  <div class="action-buttons">
                    <button class="action-btn edit-btn" on:click={() => navigate(`/recipes/edit/${recipeId}`)}>
                      <i class="fas fa-edit me-2"></i> Edit Recipe
                    </button>
                    <button class="action-btn delete-btn" on:click={() => showDeleteModal = true}>
                      <i class="fas fa-trash-alt me-2"></i> Delete Recipe
                    </button>
                  </div>
                {:else}
                  <button class="favorite-btn" on:click={toggleFavorite}>
                    <i class="fas {isFavorite ? 'fa-heart' : 'fa-heart-o'} me-2"></i> 
                    {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                  </button>
                {/if}
              </div>
            </div>
          </div>
          
          <!-- Right side with recipe details -->
          <div class="col-lg-6" in:fade={{ duration: 500, delay: 400 }}>
            <div class="recipe-details-card">
              <h1 class="gradient-text">{recipe.title}</h1>
              
              {#if recipe.createdAt}
                <div class="recipe-meta">
                  <i class="fas fa-calendar-alt me-2"></i> Created on {formatDate(recipe.createdAt)}
                </div>
              {/if}
              
              <div class="recipe-content">
                <div class="ingredients-section" in:fade={{ duration: 500, delay: 500 }}>
                  <h2 class="section-title">
                    <i class="fas fa-mortar-pestle me-2"></i> Ingredients
                  </h2>
                  <ul class="ingredients-list">
                    {#each recipe.ingredients as ingredient, i}
                      <li in:fade={{ duration: 300, delay: 500 + (i * 50) }}>{ingredient}</li>
                    {/each}
                  </ul>
                </div>
                
                <div class="steps-section" in:fade={{ duration: 500, delay: 600 }}>
                  <h2 class="section-title">
                    <i class="fas fa-list-ol me-2"></i> Preparation Steps
                  </h2>
                  <ol class="steps-list">
                    {#each recipe.steps as step, i}
                      <li in:fade={{ duration: 300, delay: 600 + (i * 50) }}>
                        <div class="step-content">
                          {step}
                        </div>
                      </li>
                    {/each}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div class="modal-backdrop" in:fade={{ duration: 200 }}>
    <div class="delete-modal" in:fade={{ duration: 300 }}>
      <div class="modal-header">
        <h4 class="modal-title">Confirm Deletion</h4>
        <button type="button" class="modal-close" on:click={() => showDeleteModal = false} aria-label="Close modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this recipe? This action cannot be undone.</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn cancel-btn" on:click={() => showDeleteModal = false}>
          <i class="fas fa-times me-2"></i> Cancel
        </button>
        <button class="modal-btn confirm-btn" on:click={deleteRecipe}>
          <i class="fas fa-trash-alt me-2"></i> Delete
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .recipe-detail-section {
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
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  /* Login Card */
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
  
  /* Alert */
  .alert-card {
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    font-weight: 500;
    color: white;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .alert-card.error {
    background-color: #ff5b5b;
    box-shadow: 0 5px 15px rgba(255, 91, 91, 0.2);
  }
  
  /* Back button */
  .back-btn {
    background-color: #f8f9fa;
    color: #2c3e50;
    border: 1px solid #e9ecef;
    border-radius: 30px;
    padding: 0.6rem 1.2rem;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0,0,0,0.03);
  }
  
  .back-btn:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.06);
  }
  
  /* Recipe image card */
  .recipe-image-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    position: relative;
    transition: all 0.3s ease;
    height: 100%;
  }
  
  .recipe-image-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  }
  
  .recipe-img {
    width: 100%;
    height: 350px;
    object-fit: cover;
    display: block;
  }
  
  .recipe-actions {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .action-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .edit-btn {
    background-color: #f2f9ed;
    color: #80c244;
    border: 1px solid rgba(128, 194, 68, 0.2);
  }
  
  .edit-btn:hover {
    background-color: #80c244;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(128, 194, 68, 0.2);
  }
  
  .delete-btn {
    background-color: #fff0f0;
    color: #ff5b5b;
    border: 1px solid rgba(255, 91, 91, 0.2);
  }
  
  .delete-btn:hover {
    background-color: #ff5b5b;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 91, 91, 0.2);
  }
  
  .favorite-btn {
    background: linear-gradient(135deg, #80c244, #6ca036);
    color: white;
    border: none;
    border-radius: 30px;
    padding: 0.75rem 1.75rem;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .favorite-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(128, 194, 68, 0.3);
  }
  
  /* Recipe details card */
  .recipe-details-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    padding: 2rem;
    height: 100%;
  }
  
  .recipe-meta {
    color: #6c757d;
    margin-bottom: 2rem;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
  }
  
  .recipe-content {
    margin-top: 1.5rem;
  }
  
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f1f3f5;
  }
  
  .ingredients-section, .steps-section {
    margin-bottom: 2.5rem;
  }
  
  .ingredients-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .ingredients-list li {
    position: relative;
    padding: 0.6rem 0 0.6rem 2rem;
    border-bottom: 1px solid #f1f3f5;
  }
  
  .ingredients-list li:last-child {
    border-bottom: none;
  }
  
  .ingredients-list li:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    background-color: #80c244;
    border-radius: 50%;
  }
  
  .steps-list {
    list-style: none;
    counter-reset: step-counter;
    padding: 0;
    margin: 0;
  }
  
  .steps-list li {
    position: relative;
    padding: 0 0 2rem 3rem;
    counter-increment: step-counter;
  }
  
  .steps-list li:last-child {
    padding-bottom: 0;
  }
  
  .steps-list li:before {
    content: counter(step-counter);
    position: absolute;
    left: 0;
    top: 0;
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #80c244, #6ca036);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    box-shadow: 0 4px 8px rgba(128, 194, 68, 0.2);
  }
  
  .step-content {
    line-height: 1.6;
    color: #495057;
  }
  
  /* Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .delete-modal {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    box-shadow: 0 15px 50px rgba(0,0,0,0.2);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }
  
  .modal-title {
    color: #2c3e50;
    font-weight: 700;
    margin: 0;
  }
  
  .modal-close {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .modal-close:hover {
    color: #ff5b5b;
  }
  
  .modal-body {
    padding: 1.5rem;
    color: #495057;
    font-size: 1.1rem;
  }
  
  .modal-footer {
    padding: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    border-top: 1px solid #e9ecef;
  }
  
  .modal-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .cancel-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #e9ecef;
  }
  
  .cancel-btn:hover {
    background-color: #e9ecef;
  }
  
  .confirm-btn {
    background-color: #ff5b5b;
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(255, 91, 91, 0.2);
  }
  
  .confirm-btn:hover {
    background-color: #ff3333;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 91, 91, 0.3);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .recipe-details-card, .recipe-image-card {
      padding: 1.5rem;
    }
    
    .recipe-img {
      height: 250px;
    }
    
    .gradient-text {
      font-size: 2rem;
    }
    
    .action-buttons {
      flex-direction: column;
      width: 100%;
    }
    
    .action-btn, .favorite-btn {
      width: 100%;
    }
  }
</style>