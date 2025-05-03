<script>
  import logo from '../../assets/logo.png';
  import { currentRoute } from '../../stores/router.js';
  import { onMount } from 'svelte';
  import 'bootstrap/dist/js/bootstrap.bundle.min.js';
  import { user, logout as logoutUser } from '../../stores/auth.js';
  import { notifications } from '../../stores/notifications.js';

  // Reference til dropdown elementet
  let notificationDropdown;

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

  function markAllAsRead() {
    notifications.markAllAsRead();
  }

  // Håndterer at dropdown åbnes
  function handleDropdownShown() {
    if ($notifications && $notifications.unreadCount > 0) {
      notifications.markAllAsRead();
    }
  }

  onMount(() => {
    console.log('Header mounted. Notifications:', $notifications);
    
    // Tilføj event listeners når komponenten er monteret
    if (notificationDropdown) {
      notificationDropdown.addEventListener('shown.bs.dropdown', handleDropdownShown);
    }

    // Cleanup event listeners når komponenten destrueres
    return () => {
      if (notificationDropdown) {
        notificationDropdown.removeEventListener('shown.bs.dropdown', handleDropdownShown);
      }
    };
  });
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
          <div class="dropdown me-3" bind:this={notificationDropdown}>
            <button class="btn btn-secondary position-relative" type="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-bell"></i>
              {#if $notifications && $notifications.unreadCount > 0}
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {$notifications.unreadCount}
                  <span class="visually-hidden">unread messages</span>
                </span>
              {/if}
            </button>
            <ul class="dropdown-menu dropdown-menu-end notification-menu" aria-labelledby="notificationDropdown" style="min-width: 300px; max-height: 400px; overflow-y: auto;">
              {#if $notifications && $notifications.items && $notifications.items.length > 0}
                {#each $notifications.items as notification, index}
                  <li>
                    <div class="dropdown-item">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class={notification.read ? '' : 'fw-bold'}>
                          {@html notification.message}
                        </span>
                        {#if !notification.read}
                          <span class="badge bg-primary rounded-pill">New</span>
                        {/if}
                      </div>
                    </div>
                  </li>
                {/each}
              {:else}
                <li><div class="dropdown-item text-muted">No notifications</div></li>
              {/if}
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item" on:click={markAllAsRead}>Mark all as read</button></li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="btn primary-btn dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              {$user ? ($user.name || $user.email) : 'User'}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="/profile" on:click|preventDefault={(e) => navigate('/profile', e)}>My profile</a></li>
              
              {#if isAdmin()}
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="/admin-dashboard" on:click|preventDefault={(e) => navigate('/admin-dashboard', e)}>Admin dashboard</a></li>
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

<style>
  .notification-menu {
    padding: 0.5rem 0;
  }
</style>
