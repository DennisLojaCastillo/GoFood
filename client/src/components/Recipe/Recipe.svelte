<script>
  import { currentRoute } from '../../stores/router.js';
  import { user } from '../../stores/auth.js';

  // Props for the component
  export let recipe; // Recipe object from backend 
  export let compact = false; // If true, display compact version of recipe

  // Image handling
  function getImageUrl(recipe) {
    if (!recipe || !recipe.imageUrl) {
      return 'https://fakeimg.pl/600x400?text=No+Image&font=bebas&font_size=55';
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

  // Function to navigate to recipe detail
  function viewRecipe() {
    if (!recipe || !recipe._id) {
      return;
    }
    
    history.pushState({}, '', `/recipes/${recipe._id}`);
    currentRoute.set(`/recipes/${recipe._id}`);
  }

  // Check if user is the author
  function isAuthor() {
    return $user && recipe && recipe.createdBy === $user.id;
  }

  // Format the date
  function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  }
</script>

<div class="card h-100 shadow-sm border-0 {compact ? 'compact' : ''}" on:click={compact ? viewRecipe : null} role={compact ? 'button' : null}>
  <!-- Debug info -->
  {#if recipe && recipe._id}
    <!-- Recipe debug, invisible -->
    <div class="visually-hidden">Recipe ID: {recipe._id}</div>
  {/if}
  
  <!-- Image -->
  <div class="position-relative">
    <img 
      src={getImageUrl(recipe)} 
      class="card-img-top" 
      alt={recipe && recipe.title ? recipe.title : 'Recipe image'}
      style="height: {compact ? '180px' : '250px'}; object-fit: cover;"
      on:error={(e) => {        
        e.target.src = 'https://fakeimg.pl/600x400?text=Image+Error&font=bebas&font_size=55';
      }}
    >
    {#if !compact && recipe && recipe.createdAt}
      <div class="position-absolute bottom-0 end-0 bg-success text-white px-2 py-1 m-2 rounded">
        <small>Created {formatDate(recipe.createdAt)}</small>
      </div>
    {/if}
  </div>
  
  <!-- Content -->
  <div class="card-body">
    <h5 class="card-title text-truncate">{recipe && recipe.title ? recipe.title : 'Untitled'}</h5>
    
    {#if !compact}
      <!-- Ingredients (shown only in full view) -->
      <div class="mt-3">
        <h6 class="mb-2">Ingredients:</h6>
        {#if recipe && recipe.ingredients && recipe.ingredients.length > 0}
          <ul class="list-group list-group-flush small">
            {#each recipe.ingredients as ingredient}
              <li class="list-group-item px-0 py-1 border-0">{ingredient}</li>
            {/each}
          </ul>
        {:else}
          <p class="text-muted">No ingredients added</p>
        {/if}
      </div>
      
      <!-- Steps preview (shown only in full view) -->
      <div class="mt-3">
        <h6 class="mb-2">Preparation:</h6>
        {#if recipe && recipe.steps && recipe.steps.length > 0}
          <p class="card-text small">{recipe.steps[0]}{recipe.steps.length > 1 ? '...' : ''}</p>
          <button class="btn btn-sm btn-outline-success mt-2" on:click={viewRecipe}>
            View full recipe
          </button>
        {:else}
          <p class="text-muted">No steps provided</p>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- Buttons/Actions -->
  {#if compact}
    <div class="card-footer bg-transparent border-top-0">
      <button class="btn btn-sm btn-outline-success w-100" on:click|stopPropagation={viewRecipe}>
        View recipe
      </button>
    </div>
  {/if}
</div>

<style>
  .card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .card.compact {
    cursor: pointer;
  }
  
  .card.compact:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
  }
  
  .card-title {
    color: #28a745;
    font-weight: 600;
  }
  
  /* Style for ingredients */
  .list-group-item {
    background-color: transparent;
  }
</style> 