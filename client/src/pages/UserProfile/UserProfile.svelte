<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user, updateUser } from '../../stores/auth.js';

  // State
  let isLoading = true;
  let isSaving = false;
  let error = null;
  let successMessage = null;
  
  // Form data
  let name = '';
  let email = '';
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  
  // Navigation function
  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }
  
  // Initialize form data from user store
  function initializeForm() {
    if ($user) {
      name = $user.name || '';
      email = $user.email || '';
    }
  }
  
  // Form validation
  function validateForm() {
    // Reset error and success messages
    error = null;
    successMessage = null;
    
    // Basic validation
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Email is invalid';
    
    // Password validation only if trying to change password
    if (newPassword) {
      if (!currentPassword) return 'Current password is required to set a new password';
      if (newPassword.length < 6) return 'New password must be at least 6 characters';
      if (newPassword !== confirmPassword) return 'New passwords do not match';
    }
    
    return null; // No validation errors
  }
  
  // Submit form handler
  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError) {
      error = validationError;
      return;
    }
    
    isSaving = true;
    error = null;
    successMessage = null;
    
    try {
      const token = localStorage.getItem('token');
      const userData = {
        name,
        email
      };
      
      // Only include password fields if trying to change password
      if (newPassword) {
        userData.currentPassword = currentPassword;
        userData.newPassword = newPassword;
      }
      
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update user in store with new data (but not password)
      updateUser({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      });
      
      // Reset password fields
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
      
      successMessage = 'Profile updated successfully';
    } catch (err) {
      console.error('Profile update error:', err);
      error = err.message;
    } finally {
      isSaving = false;
    }
  }
  
  onMount(() => {
    // Redirect to login if not logged in
    if (!$user) {
      navigate('/login');
      return;
    }
    
    initializeForm();
    isLoading = false;
  });
</script>

<div class="user-profile-section">
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-success text-white py-3">
            <h2 class="h4 mb-0">Your Profile</h2>
          </div>
          
          <div class="card-body p-4">
            {#if isLoading}
              <div class="text-center py-4">
                <div class="spinner-border text-success" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            {:else}
              {#if error}
                <div class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i> {error}
                </div>
              {/if}
              
              {#if successMessage}
                <div class="alert alert-success" role="alert">
                  <i class="bi bi-check-circle-fill me-2"></i> {successMessage}
                </div>
              {/if}
              
              <form on:submit|preventDefault={handleSubmit}>
                <div class="mb-3">
                  <label for="name" class="form-label">Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    bind:value={name}
                    placeholder="Your name"
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    bind:value={email}
                    placeholder="your.email@example.com"
                    required
                  >
                </div>
                
                <hr class="my-4">
                <h5 class="mb-3">Change Password (optional)</h5>
                
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Current Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="currentPassword" 
                    bind:value={currentPassword}
                    placeholder="Enter current password to change"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="newPassword" 
                    bind:value={newPassword}
                    placeholder="Enter new password"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword" 
                    bind:value={confirmPassword}
                    placeholder="Confirm new password"
                  >
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    on:click={() => navigate('/user')}
                  >
                    <i class="bi bi-arrow-left me-2"></i> Back to Dashboard
                  </button>
                  
                  <button 
                    type="submit" 
                    class="btn btn-success" 
                    disabled={isSaving}
                  >
                    {#if isSaving}
                      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    {:else}
                      <i class="bi bi-check-circle me-2"></i> Save Changes
                    {/if}
                  </button>
                </div>
              </form>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .user-profile-section {
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
  .form-control:focus {
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

</style>