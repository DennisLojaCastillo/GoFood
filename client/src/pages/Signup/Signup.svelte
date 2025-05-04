<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { login } from '../../stores/auth.js';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let errorMessage = '';
  let isLoading = false;

  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }

  // Form validation
  $: passwordsMatch = password === confirmPassword;
  $: canSubmit = name && email && password && confirmPassword && passwordsMatch && !isLoading;

  async function handleSignup(event) {
    event.preventDefault();
    
    if (!canSubmit) return;
    
    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Use the auth store to login the user
      login(data.user, data.token);

      // Navigate to dashboard
      navigate('/user');
    } catch (error) {
      errorMessage = error.message || 'An error occurred during signup';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="signup-section">
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Create Account</h2>
            
            {#if errorMessage}
              <div class="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            {/if}

            <form on:submit={handleSignup}>
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  bind:value={name}
                  required
                  autocomplete="name"
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  bind:value={email}
                  required
                  autocomplete="email"
                />
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  bind:value={password}
                  required
                  minlength="6"
                  autocomplete="new-password"
                />
                <div class="form-text">Password must be at least 6 characters long.</div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input
                  type="password"
                  class="form-control {!passwordsMatch && confirmPassword ? 'is-invalid' : ''}"
                  id="confirmPassword"
                  bind:value={confirmPassword}
                  required
                  autocomplete="new-password"
                />
                {#if !passwordsMatch && confirmPassword}
                  <div class="invalid-feedback">
                    Passwords do not match.
                  </div>
                {/if}
              </div>

              <div class="d-grid gap-2 mt-4">
                <button
                  type="submit"
                  class="btn primary-btn btn-lg"
                  disabled={!canSubmit}
                >
                  {#if isLoading}
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating account...
                  {:else}
                    Create Account
                  {/if}
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <p>
                Already have an account? 
                <a href="/login" on:click|preventDefault={() => navigate('/login')}>Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .signup-section {
    background: #ffffff;
    padding: 0px 0;
    position: relative;
    overflow: hidden;
  }
  .card {
    border-radius: 10px;
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .primary-btn {
    background-color: #80c244!important;
    color: #fff !important;
    border: none;
  }
  .primary-btn:hover {
    transform: translateY(-3px);
  }
</style>