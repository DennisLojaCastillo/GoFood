<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user, logout as logoutUser } from '../../stores/auth.js';
  import { notifications } from '../../stores/notifications.js'; 
  import Recipe from '../../components/Recipe/Recipe.svelte';
  import { fade } from 'svelte/transition';

  // Local state
  let isLoading = true;
  let error = null;
  let userRecipes = [];
  let favoriteRecipes = [];
  let recentActivity = [];
  let visible = false;

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

  // Fetch recipes created by the user
  async function fetchUserCreatedRecipes() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return;
      }

      userRecipes = await response.json();      
    } catch (error) {
      // Silent fail
    }
  }
  
  // Fetch user's favorite recipes
  async function fetchFavoriteRecipes() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return;
      }

      favoriteRecipes = await response.json();      
    } catch (error) {
      // Silent fail
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
        fetchUserCreatedRecipes(),
        fetchFavoriteRecipes()
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
      error = err.message;
    } finally {
      isLoading = false;
      // Trigger fade-in animations
      setTimeout(() => {
        visible = true;
      }, 100);
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
      return dateObj.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
</script>

<div class="dashboard-section">
  <div class="container py-5">
    {#if isLoading}
      <div class="text-center py-5">
        <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your dashboard...</p>
      </div>
    {:else if error}
      <div class="alert alert-danger shadow-sm" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i> {error}
      </div>
    {:else}
      {#if visible}
        <div in:fade={{ duration: 500, delay: 100 }}>
          <div class="dashboard-header mb-4" in:fade={{ duration: 500, delay: 200 }}>
            <h1 class="gradient-text">Welcome back, {$user.name || 'User'}!</h1>
            <p class="text-muted">Manage your recipes and account from your personal dashboard.</p>
          </div>
        
          <div class="row g-4">
            <!-- User information -->
            <div class="col-lg-3">
              <div class="card dashboard-card user-card mb-4" in:fade={{ duration: 500, delay: 300 }}>
                <div class="card-body text-center">
                  <div class="avatar-container mb-3">
                    <div class="user-avatar">
                      <span>{$user.name ? $user.name[0].toUpperCase() : ($user.email ? $user.email[0].toUpperCase() : 'U')}</span>
                    </div>
                  </div>
                  <h3 class="user-name">{$user.name || 'User'}</h3>
                  <p class="user-email">{$user.email}</p>
                  <hr class="divider">
                  <div class="action-buttons">
                    <button class="btn action-btn profile-btn" on:click={() => navigate('/profile')}>
                      <i class="fas fa-user-edit me-2"></i> Edit Profile
                    </button>
                    <button class="btn action-btn logout-btn" on:click={logout}>
                      <i class="fas fa-sign-out-alt me-2"></i> Log out
                    </button>
                  </div>
                </div>
              </div>

              <div class="card dashboard-card stat-card" in:fade={{ duration: 500, delay: 400 }}>
                <div class="card-header">
                  <h5><i class="fas fa-chart-pie me-2"></i> Your Statistics</h5>
                </div>
                <div class="card-body">
                  <div class="stat-item">
                    <span class="stat-label">Recipes created</span>
                    <span class="stat-value">{userRecipes.length}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Favorite recipes</span>
                    <span class="stat-value">{favoriteRecipes.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main content -->
            <div class="col-lg-9">
              <!-- Created Recipes Section -->
              <div class="card dashboard-card recipe-card mb-4" in:fade={{ duration: 500, delay: 500 }}>
                <div class="card-header">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5><i class="fas fa-utensils me-2"></i> Your Recipes</h5>
                    <button class="btn create-btn" on:click={() => navigate('/create')}>
                      <i class="fas fa-plus me-2"></i> Create Recipe
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  {#if userRecipes.length === 0}
                    <div class="empty-state">
                      <div class="empty-icon">
                        <i class="fas fa-book-open"></i>
                      </div>
                      <h4>No recipes yet</h4>
                      <p>You haven't created any recipes yet. Start sharing your culinary creations with the world!</p>
                      <button class="btn create-first-btn" on:click={() => navigate('/create')}>
                        Create Your First Recipe
                      </button>
                    </div>
                  {:else}
                    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                      {#each userRecipes.slice(0, 6) as recipe, i}
                        <div class="col" in:fade={{ duration: 300, delay: 500 + (i * 100) }}>
                          <Recipe {recipe} compact={true} smaller={true} />
                        </div>
                      {/each}
                    </div>
                    {#if userRecipes.length > 6}
                      <div class="text-center mt-4">
                        <button class="btn view-all-btn" on:click={() => navigate('/myrecipes')}>
                          View All My Recipes ({userRecipes.length}) <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    {/if}
                  {/if}
                </div>
              </div>
              
              <!-- Favorite Recipes Section -->
              <div class="card dashboard-card recipe-card" in:fade={{ duration: 500, delay: 600 }}>
                <div class="card-header">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5><i class="fas fa-heart me-2"></i> Your Favorite Recipes</h5>
                    <button class="btn browse-btn" on:click={() => navigate('/recipes')}>
                      <i class="fas fa-search me-2"></i> Browse Recipes
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  {#if favoriteRecipes.length === 0}
                    <div class="empty-state">
                      <div class="empty-icon">
                        <i class="fas fa-heart"></i>
                      </div>
                      <h4>No favorite recipes yet</h4>
                      <p>You haven't saved any recipes as favorites. Explore recipes and save the ones you love!</p>
                      <button class="btn browse-all-btn" on:click={() => navigate('/recipes')}>
                        Browse All Recipes
                      </button>
                    </div>
                  {:else}
                    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                      {#each favoriteRecipes.slice(0, 6) as recipe, i}
                        <div class="col" in:fade={{ duration: 300, delay: 600 + (i * 100) }}>
                          <Recipe {recipe} compact={true} smaller={true} />
                        </div>
                      {/each}
                    </div>
                    {#if favoriteRecipes.length > 6}
                      <div class="text-center mt-4">
                        <button class="btn view-all-btn" on:click={() => navigate('/favorites')}>
                          View All Favorites ({favoriteRecipes.length}) <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    {/if}
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .dashboard-section {
    background: #ffffff;
    padding: 0;
    position: relative;
    min-height: 85vh;
  }
  
  .dashboard-header {
    margin-bottom: 2rem;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #80c244 0%, #2c3e50 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .dashboard-card {
    border: none;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
  }
  
  .dashboard-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  }
  
  .card-header {
    background: linear-gradient(to right, #ffffff, #f9fcf5);
    border-bottom: 1px solid rgba(0,0,0,0.05);
    padding: 1.25rem 1.5rem;
  }
  
  .card-header h5 {
    color: #2c3e50;
    font-weight: 600;
    margin: 0;
  }
  
  .user-card .card-body {
    padding: 1.75rem 1.25rem;
  }
  
  .avatar-container {
    position: relative;
    margin-bottom: 1.25rem;
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #80c244, #5a9431);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 600;
    margin: 0 auto;
    box-shadow: 0 5px 15px rgba(128, 194, 68, 0.3);
  }
  
  .user-name {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    font-size: 1.5rem;
  }
  
  .user-email {
    color: #6c757d;
    margin-bottom: 1.25rem;
    font-size: 0.95rem;
  }
  
  .divider {
    margin: 1.25rem 0;
    opacity: 0.1;
  }
  
  .action-buttons {
    display: grid;
    gap: 0.75rem;
  }
  
  .action-btn {
    padding: 0.6rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: 0.95rem;
  }
  
  .profile-btn {
    background-color: #f2f9ed;
    color: #80c244;
    border: 1px solid rgba(128, 194, 68, 0.2);
  }
  
  .profile-btn:hover {
    background-color: #e6f4da;
    color: #6ca036;
  }
  
  .logout-btn {
    background-color: #fff0f0;
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
  }
  
  .logout-btn:hover {
    background-color: #ffe0e0;
    color: #bd2130;
  }
  
  .stat-card .card-body {
    padding: 1.25rem;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  
  .stat-item:last-child {
    border-bottom: none;
  }
  
  .stat-label {
    color: #6c757d;
    font-weight: 500;
    font-size: 0.95rem;
  }
  
  .stat-value {
    font-weight: 700;
    color: #2c3e50;
    font-size: 1.15rem;
  }
  
  .recipe-card .card-body {
    padding: 1.25rem;
  }
  
  .create-btn, .browse-btn {
    background-color: #80c244;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-weight: 500;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .create-btn:hover, .browse-btn:hover {
    background-color: #6ca036;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(128, 194, 68, 0.2);
  }
  
  .browse-btn {
    background-color: #e9f4df;
    color: #80c244;
    border: 1px solid rgba(128, 194, 68, 0.2);
  }
  
  .browse-btn:hover {
    background-color: #d8eccc;
    color: #6ca036;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    font-size: 2.5rem;
    color: #dee2e6;
    margin-bottom: 1.25rem;
  }
  
  .empty-state h4 {
    color: #2c3e50;
    margin-bottom: 0.6rem;
    font-size: 1.25rem;
  }
  
  .empty-state p {
    color: #6c757d;
    margin-bottom: 1.25rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    font-size: 0.95rem;
  }
  
  .create-first-btn, .browse-all-btn {
    background-color: #80c244;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.25rem;
    font-weight: 500;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .create-first-btn:hover, .browse-all-btn:hover {
    background-color: #6ca036;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(128, 194, 68, 0.2);
  }
  
  .browse-all-btn {
    background-color: #e9f4df;
    color: #80c244;
    border: 1px solid rgba(128, 194, 68, 0.2);
  }
  
  .browse-all-btn:hover {
    background-color: #80c244;
    color: white;
  }
  
  .view-all-btn {
    background-color: #f8f9fa;
    color: #2c3e50;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.6rem 1.25rem;
    font-weight: 500;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .view-all-btn:hover {
    background-color: #e9ecef;
    color: #212529;
  }
</style>