<script>
  import { onMount } from 'svelte';
  import { user } from '../../stores/auth.js'; 
  import { currentRoute } from '../../stores/router.js';

  // Data states
  let overviewData = null;
  let users = [];
  let loading = true;
  let error = null;
  let deleteError = null;
  let deleteSuccess = null;
  
  // Modal state
  let showDeleteModal = false;
  let userToDelete = null;

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
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
    }
  });
  
  // Open delete confirmation modal
  function confirmDelete(userId) {
    userToDelete = userId;
    showDeleteModal = true;
  }
  
  // Close delete confirmation modal
  function cancelDelete() {
    showDeleteModal = false;
    userToDelete = null;
  }

  async function deleteUser() {
    deleteError = null;
    deleteSuccess = null;  

    try {
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
      deleteSuccess = 'User deleted successfully';

      // Update overview counts
      if (overviewData) {
        overviewData.totalUsers -= 1;
      }
      
      // Close modal
      showDeleteModal = false;
      userToDelete = null;
    } catch (err) {
      deleteError = err.message;
      console.error('Delete error:', err);
      
      // Close modal
      showDeleteModal = false;
      userToDelete = null;
    }
  }
</script>

<div class="admin-dashboard-section">
  <div class="container mt-4">
    <h1 class="mb-4">Admin Dashboard</h1>

    {#if loading}
      <div class="text-center my-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading admin data...</p>
      </div>
    {:else if error}
      <div class="alert alert-danger" role="alert">
        {error}
      </div>
    {:else}
      <!-- Overview Cards -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h5 class="card-title">Total Users</h5>
              <h2 class="display-4">{overviewData.totalUsers}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h5 class="card-title">Total Recipes</h5>
              <h2 class="display-4">{overviewData.totalRecipes}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h5 class="card-title">Latest User</h5>
              <h6 class="card-subtitle mb-2 text-muted">{overviewData.latestUser.name}</h6>
              <p class="card-text">{overviewData.latestUser.email}</p>
              <p class="card-text"><small class="text-muted">Created: {new Date(overviewData.latestUser.createdAt).toLocaleString('en-US')}</small></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete messages -->
      {#if deleteSuccess}
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          {deleteSuccess}
          <button type="button" class="btn-close" on:click={() => deleteSuccess = null} aria-label="Close"></button>
        </div>
      {/if}

      {#if deleteError}
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          {deleteError}
          <button type="button" class="btn-close" on:click={() => deleteError = null} aria-label="Close"></button>
        </div>
      {/if}

      <!-- Users Table -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Users and Recipes</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Recipe Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each users as user}
                  <tr>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span class="badge {user.role === 'admin' ? 'bg-danger' : 'bg-success'}">
                        {user.role === 'admin' ? 'Administrator' : 'User'}
                      </span>
                    </td>
                    <td>{user.recipeCount}</td>
                    <td>
                      {#if user.role !== 'admin'}
                        <button 
                          class="btn btn-sm btn-danger" 
                          on:click={() => confirmDelete(user._id)}>
                          <i class="bi bi-trash"></i> Delete
                        </button>
                      {:else}
                        <button class="btn btn-sm btn-secondary" disabled>
                          <i class="bi bi-lock"></i> Admin
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
    {/if}
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
<div class="modal-backdrop fade show"></div>
<div class="modal fade show d-block" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Confirm Delete</h5>
        <button type="button" class="btn-close" on:click={cancelDelete} aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this user?</p>
        <p>This action cannot be undone.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={cancelDelete}>Cancel</button>
        <button type="button" class="btn btn-danger" on:click={deleteUser}>Delete User</button>
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .admin-dashboard-section {
    background: #ffffff;
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .card {
    transition: transform 0.3s, box-shadow 0.3s;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  .btn-danger {
    background-color: #dc3545;
    color: #fff;
    border: none;
  }
  .btn-danger:hover {
    transform: translateY(-3px);
  }
  .btn-secondary {
    background-color: #6c757d;
    color: #fff;
    border: none;
  }
  .btn-secondary:hover {
    transform: translateY(-3px);
  }
</style>