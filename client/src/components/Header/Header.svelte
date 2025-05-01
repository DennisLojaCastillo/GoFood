<script>
  import logo from '../../assets/logo.png';
  import { currentRoute } from '../../stores/router.js';
  import { onMount } from 'svelte';
  import 'bootstrap/dist/js/bootstrap.bundle.min.js';
  import { user, logout as logoutUser } from '../../stores/auth.js';

  function navigate(path, event) {
    if (event) event.preventDefault();
    history.pushState({}, '', path);
    currentRoute.set(path);
  }
  
  // Function to handle logo click, redirecting based on login status
  function handleLogoClick(event) {
    event.preventDefault();
    if (isLoggedIn()) {
      navigate('/user');
    } else {
      navigate('/');
    }
  }

  function logout() {
    logoutUser();
    navigate('/');
  }

  // Check if user is logged in and has a specific role
  function isLoggedIn() {
    return $user !== null;
  }

  function isAdmin() {
    return $user && $user.role === 'admin';
  }
</script>

<nav class="navbar navbar-expand-lg shadow-sm" style="background-color: #F5EEDD;">
  <div class="container">
    <!-- Logo -->
    <a class="navbar-brand d-flex align-items-center" href={isLoggedIn() ? '/user' : '/'} on:click={handleLogoClick}>
      <img src={logo} alt="GoFood Logo" height="40" class="me-2">
    </a>

    <!-- Hamburger menu button for mobile -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Navigation items -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        {#if !isLoggedIn()}
          <!-- Menu items for non-logged-in users -->
          <li class="nav-item">
            <a class="nav-link" href="/about" on:click={(e) => navigate('/about', e)}>About GoFood</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/recipes" on:click={(e) => navigate('/recipes', e)}>Recipes</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/contact" on:click={(e) => navigate('/contact', e)}>Contact</a>
          </li>
        {:else}
          <!-- Menu items for logged-in users -->
          <li class="nav-item">
            <a class="nav-link" href="/user" on:click={(e) => navigate('/user', e)}>Dashboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/recipes" on:click={(e) => navigate('/recipes', e)}>Recipes</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/create" on:click={(e) => navigate('/create', e)}>Create Recipe</a>
          </li>
        {/if}
      </ul>

      <!-- Auth buttons or user menu -->
      <div class="d-flex gap-2 align-items-center">
        {#if isLoggedIn()}
          <div class="dropdown">
            <button class="btn primary-btn dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              {$user ? ($user.name || $user.email) : 'User'}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="/profile" on:click|preventDefault={(e) => navigate('/profile', e)}>My Profile</a></li>
              
              {#if isAdmin()}
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="/admin-dashboard" on:click|preventDefault={(e) => navigate('/admin-dashboard', e)}>Admin Dashboard</a></li>
              {/if}
              
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item text-danger" on:click={logout}>Log out</button></li>
            </ul>
          </div>
        {:else}
          <button class="btn secondary-btn" on:click={(e) => navigate('/login', e)}>Login</button>
          <button class="btn primary-btn" on:click={(e) => navigate('/signup', e)}>Signup</button>
        {/if}
      </div>
    </div>
  </div>
</nav>
