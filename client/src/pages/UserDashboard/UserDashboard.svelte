<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user, logout as logoutUser } from '../../stores/auth.js';
  import Recipe from '../../components/Recipe/Recipe.svelte';

  // Local state
  let isLoading = true;
  let error = null;
  let userRecipes = [];
  let recentActivity = [];

  // Function to navigate
  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }

  // Logout function
  function logout() {
    logoutUser();
    navigate('/login');
  }

  // Fetch recipes created by the user (optional)
  async function fetchUserCreatedRecipes() {
    try {
      const token = localStorage.getItem('token');
      // Assuming there's an endpoint for user's created recipes
      const response = await fetch('http://localhost:3000/api/user/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // This is optional, so we'll just log errors
        console.error('Failed to fetch user created recipes');
        return;
      }

      userRecipes = await response.json();      
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  }

  // Initialize data on component mount
  onMount(async () => {
    // Check if we're logged in
    if (!$user) {
      navigate('/login');
      return;
    }
    
    try {
      isLoading = true;
      // Load data in parallel
      await Promise.all([
        fetchUserCreatedRecipes()
      ]);
      
      // Create some basic activity items based on data we have
      recentActivity = [
        {
          type: 'login',
          title: 'Login',
          description: 'You logged in to your account.',
          date: new Date()
        }
      ];
      
      // Sort activity by date (newest first)
      recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
      
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  });

  // Format date for display
  function formatDate(date) {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
</script>

<div class="dashboard-section">
  <div class="container py-4">
    {#if isLoading}
      <div class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    {:else if error}
      <div class="alert alert-danger" role="alert">
        {error}
      </div>
    {:else}
      <div class="row">
        <!-- User information -->
        <div class="col-md-4">
          <div class="card shadow-sm mb-4">
            <div class="card-body text-center">
              <div class="mb-3">
                <div class="bg-success text-white rounded-circle d-inline-flex justify-content-center align-items-center" style="width: 80px; height: 80px;">
                  <span class="fs-1">{$user.name ? $user.name[0].toUpperCase() : ($user.email ? $user.email[0].toUpperCase() : 'U')}</span>
                </div>
              </div>
              <h4>{$user.name || 'User'}</h4>
              <p class="text-muted">{$user.email}</p>
              <hr>
              <div class="d-grid gap-2">
                <button class="btn btn-outline-success" on:click={() => navigate('/profile')}>
                  Edit Profile
                </button>
                <button class="btn btn-outline-danger" on:click={logout}>
                  Log out
                </button>
              </div>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">Statistics</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span>Created recipes:</span>
                <span class="fw-bold">{userRecipes.length}</span>
              </div>                        
            </div>
          </div>
        </div>

        <!-- Main content -->
        <div class="col-md-8">
          <h2 class="mb-4">Welcome back, {$user.name || 'User'}!</h2>
          
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Your Recipes</h5>
              <button class="btn btn-sm btn-success" on:click={() => navigate('/create')}>
                Create New Recipe
              </button>
            </div>
            <div class="card-body">
              {#if userRecipes.length === 0}
                <p class="text-center py-4">You haven't created any recipes yet.</p>
                <div class="text-center">
                  <button class="btn btn-outline-success" on:click={() => navigate('/create')}>
                    Create First Recipe
                  </button>
                </div>
              {:else}
                <div class="row row-cols-1 row-cols-md-3 g-3">
                  {#each userRecipes.slice(0, 3) as recipe}
                    <div class="col">
                      <Recipe {recipe} compact={true} />
                    </div>
                  {/each}
                </div>
                {#if userRecipes.length > 3}
                  <div class="text-center mt-3">
                    <button class="btn btn-sm btn-outline-success" on:click={() => navigate('/myrecipes')}>
                      View All My Recipes ({userRecipes.length})
                    </button>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard-section {
    background: #ffffff;
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .card {
    border: none;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .card-header {
    border-bottom: none;
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