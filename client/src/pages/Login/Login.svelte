<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { login } from '../../stores/auth.js';

  let email = '';
  let password = '';
  let errorMessage = '';
  let isLoading = false;

  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }

  async function handleLogin(event) {
    event.preventDefault();
    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Use the auth store to login the user
      login(data.user, data.token);

      // Navigate to User Dashboard after successful login
      navigate('/user');
    } catch (error) {
      errorMessage = error.message || 'An error occurred during login';
      console.error('Login error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="login-section">
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Login</h2>
            
            {#if errorMessage}
              <div class="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            {/if}

            <form on:submit={handleLogin}>
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
                  autocomplete="current-password"
                />
              </div>

              <div class="d-grid gap-2 mt-4">
                <button
                  type="submit"
                  class="btn primary-btn btn-lg"
                  disabled={isLoading}
                >
                  {#if isLoading}
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  {:else}
                    Login
                  {/if}
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <p>
                Don't have an account? 
                <a href="/signup" on:click|preventDefault={() => navigate('/signup')}>Create Account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .login-section {
    background: #ffffff;
    padding: 60px 0;
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