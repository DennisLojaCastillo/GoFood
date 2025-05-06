<script>
  import { onMount } from 'svelte';
  import { user } from '../../stores/auth.js'; 
  import { currentRoute } from '../../stores/router.js';
  import { fade } from 'svelte/transition';

  // Data states
  let overviewData = null;
  let users = [];
  let recipes = [];
  let loading = true;
  let error = null;
  let deleteError = null;
  let deleteSuccess = null;
  let visible = false;
  
  // Modal state
  let showDeleteModal = false;
  let userToDelete = null;
  let recipeToDelete = null;
  let deleteType = null; // 'user' or 'recipe'

  onMount(async () => {
    // Check if user is admin
    if (!$user || $user.role !== 'admin') {
      currentRoute.set('/login');
      return;
    }

    try {
      // Fetch overview data
      const overviewResponse = await fetch('http://localhost:3000/api/admin/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!overviewResponse.ok) {
        throw new Error('Could not fetch overview data');
      }

      overviewData = await overviewResponse.json();

      // Fetch users with recipes count
      const usersResponse = await fetch('http://localhost:3000/api/admin/users-with-recipes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!usersResponse.ok) {
        throw new Error('Could not fetch user data');
      }

      users = await usersResponse.json();
      
      // Fetch all recipes
      const recipesResponse = await fetch('http://localhost:3000/api/admin/recipes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!recipesResponse.ok) {
        throw new Error('Could not fetch recipe data');
      }

      recipes = await recipesResponse.json();
      
      loading = false;
      
      // Trigger fade-in animations
      setTimeout(() => {
        visible = true;
      }, 100);
      
    } catch (err) {
      error = err.message;
      loading = false;
    }
  });
  
  // Open delete confirmation modal
  function confirmDelete(id, type) {
    if (type === 'user') {
      userToDelete = id;
      recipeToDelete = null;
    } else if (type === 'recipe') {
      recipeToDelete = id;
      userToDelete = null;
    }
    deleteType = type;
    showDeleteModal = true;
  }
  
  // Close delete confirmation modal
  function cancelDelete() {
    showDeleteModal = false;
    userToDelete = null;
    recipeToDelete = null;
    deleteType = null;
  }

  async function deleteItem() {
    deleteError = null;
    deleteSuccess = null;  

    try {
      if (deleteType === 'user') {
        const response = await fetch(`http://localhost:3000/api/admin/users/${userToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Could not delete user');
        }

        // Remove user from list
        users = users.filter(user => {        
          return user._id !== userToDelete;
        });
        
        // Also remove all recipes by this user from the recipes list
        recipes = recipes.filter(recipe => {
          return recipe.createdBy !== userToDelete;
        });
        
        deleteSuccess = 'User and all associated recipes deleted';

        // Update overview counts
        if (overviewData) {
          const deletedUserRecipeCount = users.find(u => u._id === userToDelete)?.recipeCount || 0;
          overviewData.totalUsers -= 1;
          overviewData.totalRecipes -= deletedUserRecipeCount;
        }
      } else if (deleteType === 'recipe') {
        const response = await fetch(`http://localhost:3000/api/admin/recipes/${recipeToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Could not delete recipe');
        }

        // Remove recipe from list
        recipes = recipes.filter(recipe => {        
          return recipe._id !== recipeToDelete;
        });
        
        // Update user recipe count if the user still exists
        const deletedRecipe = recipes.find(r => r._id === recipeToDelete);
        if (deletedRecipe) {
          const userIndex = users.findIndex(u => u._id === deletedRecipe.createdBy);
          if (userIndex >= 0 && users[userIndex].recipeCount > 0) {
            users[userIndex].recipeCount -= 1;
            users = [...users]; // Trigger reactivity
          }
        }
        
        deleteSuccess = 'Recipe deleted';

        // Update overview counts
        if (overviewData) {
          overviewData.totalRecipes -= 1;
        }
      }
      
      // Close modal
      showDeleteModal = false;
      userToDelete = null;
      recipeToDelete = null;
      deleteType = null;
    } catch (err) {
      deleteError = err.message;
      
      // Close modal
      showDeleteModal = false;
      userToDelete = null;
      recipeToDelete = null;
      deleteType = null;
    }
  }
</script>

<div class="admin-dashboard-section">
  <div class="container py-5">
    {#if loading}
      <div class="text-center py-5">
        <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading admin data...</p>
      </div>
    {:else if error}
      <div class="alert-card error" role="alert" in:fade={{ duration: 300 }}>
        <i class="fas fa-exclamation-circle me-2"></i> {error}
      </div>
    {:else if visible}
      <div in:fade={{ duration: 500, delay: 100 }}>
        <!-- Page Title -->
        <div class="text-center mb-5" in:fade={{ duration: 500, delay: 200 }}>
          <h1 class="gradient-text">Admin Dashboard</h1>
          <p class="lead-text">Manage users and monitor site activity</p>
        </div>
        
        <!-- Overview Cards -->
        <div class="row g-4 mb-5" in:fade={{ duration: 500, delay: 300 }}>
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-card-body">
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                  <h5 class="stat-title">Total Users</h5>
                  <div class="stat-value">{overviewData.totalUsers}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-card-body">
                <div class="stat-icon">
                  <i class="fas fa-utensils"></i>
                </div>
                <div class="stat-content">
                  <h5 class="stat-title">Total Recipes</h5>
                  <div class="stat-value">{overviewData.totalRecipes}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-card-body">
                <div class="stat-icon">
                  <i class="fas fa-user-plus"></i>
                </div>
                <div class="stat-content">
                  <h5 class="stat-title">Latest User Created</h5>
                  <div class="stat-latest-user">
                    <span class="user-name">{overviewData.latestUser.name}</span>
                    <span class="user-email">{overviewData.latestUser.email}</span>
                    <span class="user-date">Joined: {new Date(overviewData.latestUser.createdAt).toLocaleString('en-GB')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {#if deleteSuccess}
          <div class="alert-card success" role="alert" in:fade={{ duration: 300 }}>
            <i class="fas fa-check-circle me-2"></i> {deleteSuccess}
            <button type="button" class="alert-close" on:click={() => deleteSuccess = null} aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        {/if}

        {#if deleteError}
          <div class="alert-card error" role="alert" in:fade={{ duration: 300 }}>
            <i class="fas fa-exclamation-circle me-2"></i> {deleteError}
            <button type="button" class="alert-close" on:click={() => deleteError = null} aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        {/if}

        <!-- Users Table -->
        <div class="users-card" in:fade={{ duration: 500, delay: 400 }}>
          <div class="users-card-header">
            <h2 class="section-title">
              <i class="fas fa-user-cog me-2"></i> Users 
            </h2>
          </div>
          <div class="users-card-body">
            <div class="table-responsive">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="text-left">Name</th>
                    <th class="text-center">Email</th>
                    <th class="text-center">Role</th>
                    <th class="text-center">Recipe Count</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each users as user, i}
                    <tr in:fade={{ duration: 300, delay: 500 + (i * 50) }}>
                      <td>{user.name}</td>
                      <td class="text-center">{user.email}</td>
                      <td class="text-center">
                        <span class="role-badge {user.role === 'admin' ? 'admin' : 'user'}">
                          {user.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                      </td>
                      <td class="text-center">{user.recipeCount}</td>
                      <td class="text-center">
                        {#if user.role !== 'admin'}
                          <button 
                            class="action-btn delete-btn" 
                            on:click={() => confirmDelete(user._id, 'user')}>
                            <i class="fas fa-trash-alt me-2"></i> Delete
                          </button>
                        {:else}
                          <button class="action-btn admin-btn" disabled>
                            <i class="fas fa-lock me-2"></i> Admin
                          </button>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recipes Table -->
        <div class="users-card" in:fade={{ duration: 500, delay: 600 }}>
          <div class="users-card-header">
            <h2 class="section-title">
              <i class="fas fa-utensils me-2"></i> All Recipes
            </h2>
          </div>
          <div class="users-card-body">
            <div class="table-responsive">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="text-left">Title</th>
                    <th class="text-center">Created By</th>
                    <th class="text-center">User Email</th>
                    <th class="text-center">Favorites</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each recipes as recipe, i}
                    <tr in:fade={{ duration: 300, delay: 700 + (i * 50) }}>
                      <td>
                        <div class="recipe-title-cell">
                          {#if recipe.imageUrl}
                            <div class="recipe-thumbnail">
                              <img src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `http://localhost:3000${recipe.imageUrl}`} alt={recipe.title} />
                            </div>
                          {/if}
                          <span>{recipe.title}</span>
                        </div>
                      </td>
                      <td class="text-center">{recipe.createdByName}</td>
                      <td class="text-center">{recipe.createdByEmail}</td>
                      <td class="text-center">
                        <span class="favorites-badge">
                          <i class="fas fa-heart me-1"></i> {recipe.favoritesCount}
                        </span>
                      </td>
                      <td class="text-center">
                        <button 
                          class="action-btn delete-btn" 
                          on:click={() => confirmDelete(recipe._id, 'recipe')}>
                          <i class="fas fa-trash-alt me-2"></i> Delete
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
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
      <button type="button" class="modal-close" on:click={cancelDelete} aria-label="Close modal">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      {#if deleteType === 'user'}
        <p>Are you sure you want to delete this user?</p>
        <p class="warning-text">This action cannot be undone. All user data including recipes will be permanently deleted.</p>
      {:else if deleteType === 'recipe'}
        <p>Are you sure you want to delete this recipe?</p>
        <p class="warning-text">This action cannot be undone. The recipe will be permanently deleted.</p>
      {/if}
    </div>
    <div class="modal-footer">
      <button type="button" class="modal-btn cancel-btn" on:click={cancelDelete}>
        <i class="fas fa-times me-2"></i> Cancel
      </button>
      <button type="button" class="modal-btn confirm-btn" on:click={deleteItem}>
        <i class="fas fa-trash-alt me-2"></i> 
        {#if deleteType === 'user'}
          Delete User
        {:else if deleteType === 'recipe'}
          Delete Recipe
        {:else}
          Delete
        {/if}
      </button>
    </div>
  </div>
</div>
{/if}

<style>
  .admin-dashboard-section {
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
    margin: 0 auto 1rem;
  }
  
  /* Alert Cards */
  .alert-card {
    position: relative;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    font-weight: 500;
    color: white;
  }
  
  .alert-card.error {
    background-color: #ff5b5b;
    box-shadow: 0 5px 15px rgba(255, 91, 91, 0.2);
  }
  
  .alert-card.success {
    background-color: #80c244;
    box-shadow: 0 5px 15px rgba(128, 194, 68, 0.2);
  }
  
  .alert-close {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: white;
    opacity: 0.7;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .alert-close:hover {
    opacity: 1;
  }
  
  /* Stat Cards */
  .stat-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    height: 100%;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  }
  
  .stat-card-body {
    padding: 2rem;
    display: flex;
    align-items: center;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #f2f9ed, #e6f4da);
    color: #80c244;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    margin-right: 1.5rem;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.15);
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-title {
    color: #6c757d;
    font-weight: 600;
    font-size: 1rem;
    margin: 0 0 0.5rem;
  }
  
  .stat-value {
    color: #2c3e50;
    font-weight: 700;
    font-size: 2.5rem;
    line-height: 1.2;
  }
  
  .stat-latest-user {
    display: flex;
    flex-direction: column;
  }
  
  .user-name {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
  
  .user-email {
    color: #495057;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
  
  .user-date {
    color: #6c757d;
    font-size: 0.85rem;
  }
  
  /* Users Table Card */
  .users-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    margin-bottom: 3rem;
  }
  
  .users-card-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #f1f3f5;
  }
  
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.5rem;
    margin: 0;
  }
  
  .users-card-body {
    padding: 1rem;
  }
  
  .users-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .users-table th {
    color: #6c757d;
    font-weight: 600;
    padding: 1rem;
    font-size: 0.95rem;
    text-align: left;
    border-bottom: 2px solid #f1f3f5;
  }
  
  .users-table td {
    padding: 1rem;
    vertical-align: middle;
    border-bottom: 1px solid #f1f3f5;
    color: #495057;
  }
  
  .text-left {
    text-align: left !important;
  }
  
  .text-center {
    text-align: center !important;
  }
  
  /* Users tabel alignment */
  .users-card:nth-of-type(1) .users-table th:nth-child(2),
  .users-card:nth-of-type(1) .users-table td:nth-child(2) {
    text-align: center; /* Email */
  }
  
  .users-card:nth-of-type(1) .users-table th:nth-child(3),
  .users-card:nth-of-type(1) .users-table td:nth-child(3) {
    text-align: center; /* Role */
  }
  
  .users-card:nth-of-type(1) .users-table th:nth-child(4),
  .users-card:nth-of-type(1) .users-table td:nth-child(4) {
    text-align: center; /* Recipe Count */
  }
  
  .users-card:nth-of-type(1) .users-table th:nth-child(5),
  .users-card:nth-of-type(1) .users-table td:nth-child(5) {
    text-align: center; /* Actions */
  }
  
  /* Recipes tabel alignment */
  .users-card:nth-of-type(2) .users-table th:nth-child(2),
  .users-card:nth-of-type(2) .users-table td:nth-child(2) {
    text-align: center; /* Created By */
  }
  
  .users-card:nth-of-type(2) .users-table th:nth-child(3),
  .users-card:nth-of-type(2) .users-table td:nth-child(3) {
    text-align: center; /* User Email */
  }
  
  .users-card:nth-of-type(2) .users-table th:nth-child(4),
  .users-card:nth-of-type(2) .users-table td:nth-child(4) {
    text-align: center; /* Favorites */
  }
  
  .users-card:nth-of-type(2) .users-table th:nth-child(5),
  .users-card:nth-of-type(2) .users-table td:nth-child(5) {
    text-align: center; /* Actions */
  }
  
  .users-table tr:last-child td {
    border-bottom: none;
  }
  
  .users-table tbody tr {
    transition: all 0.3s;
  }
  
  .users-table tbody tr:hover {
    background-color: #f8f9fa;
  }
  
  .role-badge {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .role-badge.admin {
    background-color: #ff5b5b;
    color: white;
    box-shadow: 0 2px 5px rgba(255, 91, 91, 0.2);
  }
  
  .role-badge.user {
    background-color: #80c244;
    color: white;
    box-shadow: 0 2px 5px rgba(128, 194, 68, 0.2);
  }
  
  .action-btn {
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    cursor: pointer;
    border: none;
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
  
  .admin-btn {
    background-color: #f8f9fa;
    color: #adb5bd;
    border: 1px solid #e9ecef;
    opacity: 0.75;
    cursor: not-allowed;
  }
  
  /* Delete Confirmation Modal */
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
  
  .warning-text {
    color: #ff5b5b;
    font-size: 0.95rem;
    font-weight: 500;
    margin-top: 1rem;
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
    border: none;
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
    box-shadow: 0 4px 12px rgba(255, 91, 91, 0.2);
  }
  
  .confirm-btn:hover {
    background-color: #ff3333;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 91, 91, 0.3);
  }
  
  /* Recipe table styles */
  .recipe-title-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .recipe-thumbnail {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .recipe-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .favorites-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    background-color: #fff0f0;
    color: #ff5b5b;
    box-shadow: 0 2px 5px rgba(255, 91, 91, 0.1);
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .gradient-text {
      font-size: 2.25rem;
    }
    
    .stat-card-body {
      padding: 1.5rem;
      flex-direction: column;
      text-align: center;
    }
    
    .stat-icon {
      margin-right: 0;
      margin-bottom: 1rem;
    }
    
    .users-card-header,
    .users-card-body {
      padding: 1rem;
    }
    
    .users-table th,
    .users-table td {
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
    }
    
    .action-btn {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }

    .recipe-title-cell {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .recipe-thumbnail {
      width: 40px;
      height: 40px;
    }
  }
</style>