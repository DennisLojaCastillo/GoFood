<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user, updateUser } from '../../stores/auth.js';
  import { fade } from 'svelte/transition';

  // State
  let isLoading = true;
  let isSaving = false;
  let error = null;
  let successMessage = null;
  let visible = false;
  
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
    
    // Trigger fade-in animations after component is mounted
    setTimeout(() => {
      visible = true;
    }, 100);
  });
</script>

<div class="user-profile-section">
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        {#if isLoading}
          <div class="text-center py-5">
            <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading your profile...</p>
          </div>
        {:else if visible}
          <div in:fade={{ duration: 500, delay: 100 }}>
            <!-- Page Title -->
            <div class="text-center mb-4" in:fade={{ duration: 500, delay: 200 }}>
              <h1 class="gradient-text">Your Profile</h1>
              <p class="lead-text">Update your information and password</p>
            </div>
            
            <div class="profile-card" in:fade={{ duration: 500, delay: 300 }}>
              {#if error}
                <div class="alert-card error" role="alert" in:fade={{ duration: 300 }}>
                  <i class="fas fa-exclamation-circle me-2"></i> {error}
                </div>
              {/if}
              
              {#if successMessage}
                <div class="alert-card success" role="alert" in:fade={{ duration: 300 }}>
                  <i class="fas fa-check-circle me-2"></i> {successMessage}
                </div>
              {/if}
              
              <form on:submit|preventDefault={handleSubmit}>
                <div class="form-section" in:fade={{ duration: 500, delay: 400 }}>
                  <label for="name" class="form-label">Name</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    id="name" 
                    bind:value={name}
                    placeholder="Your name"
                    required
                  >
                </div>
                
                <div class="form-section" in:fade={{ duration: 500, delay: 500 }}>
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-input" 
                    id="email" 
                    bind:value={email}
                    placeholder="your.email@example.com"
                    required
                  >
                </div>
                
                <div class="section-divider" in:fade={{ duration: 500, delay: 600 }}></div>
                
                <div class="password-section" in:fade={{ duration: 500, delay: 700 }}>
                  <h2 class="section-title">Change Password <span class="optional-text">(optional)</span></h2>
                  
                  <div class="form-section">
                    <label for="currentPassword" class="form-label">Current Password</label>
                    <input 
                      type="password" 
                      class="form-input" 
                      id="currentPassword" 
                      bind:value={currentPassword}
                      placeholder="Enter current password to change"
                    >
                  </div>
                  
                  <div class="form-section">
                    <label for="newPassword" class="form-label">New Password</label>
                    <input 
                      type="password" 
                      class="form-input" 
                      id="newPassword" 
                      bind:value={newPassword}
                      placeholder="Enter new password"
                    >
                  </div>
                  
                  <div class="form-section">
                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      class="form-input" 
                      id="confirmPassword" 
                      bind:value={confirmPassword}
                      placeholder="Confirm new password"
                    >
                  </div>
                </div>
                
                <div class="action-buttons" in:fade={{ duration: 500, delay: 800 }}>
                  <button 
                    type="button" 
                    class="cancel-btn" 
                    on:click={() => navigate('/user')}
                    disabled={isSaving}
                  >
                    <i class="fas fa-arrow-left me-2"></i> Back to Dashboard
                  </button>
                  
                  <button 
                    type="submit" 
                    class="submit-btn" 
                    disabled={isSaving}
                  >
                    {#if isSaving}
                      <div class="spinner"></div>
                      <span>Saving...</span>
                    {:else}
                      <i class="fas fa-check-circle me-2"></i> Save Changes
                    {/if}
                  </button>
                </div>
              </form>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .user-profile-section {
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
  
  .lead-text {
    color: #6c757d;
    font-size: 1.1rem;
    max-width: 500px;
    margin: 0 auto 1rem;
  }
  
  .profile-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    padding: 2.5rem;
    position: relative;
    transition: all 0.3s ease;
    margin-bottom: 3rem;
  }
  
  .profile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 50px rgba(0,0,0,0.12);
  }
  
  .alert-card {
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
  
  .form-section {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    display: block;
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .form-input {
    width: 100%;
    padding: 0.85rem 1rem;
    border-radius: 8px;
    border: 2px solid #e9ecef;
    background-color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
    color: #2c3e50;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #80c244;
    box-shadow: 0 0 0 4px rgba(128, 194, 68, 0.1);
  }
  
  .section-divider {
    height: 1px;
    background-color: #e9ecef;
    margin: 2rem 0;
  }
  
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .optional-text {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 400;
  }
  
  .password-section {
    margin-bottom: 2rem;
  }
  
  /* Action buttons */
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 2.5rem;
  }
  
  .submit-btn {
    background: linear-gradient(135deg, #80c244, #6ca036);
    color: white;
    border: none;
    padding: 0.85rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(128, 194, 68, 0.2);
    transition: all 0.3s ease;
    min-width: 160px;
  }
  
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(128, 194, 68, 0.3);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .cancel-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #e9ecef;
    padding: 0.85rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .cancel-btn:hover:not(:disabled) {
    background-color: #e9ecef;
    color: #495057;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
  
  .cancel-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  /* Spinner */
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s ease-in-out infinite;
    margin-right: 10px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .profile-card {
      padding: 1.5rem;
    }
    
    .gradient-text {
      font-size: 2rem;
    }
    
    .action-buttons {
      flex-direction: column-reverse;
      gap: 1rem;
    }
    
    .cancel-btn, .submit-btn {
      width: 100%;
    }
  }
</style>