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

  // Handle dropdown open
  function handleDropdownShown() {
    if ($notifications && $notifications.unreadCount > 0) {
      notifications.markAllAsRead();
    }
  }

  // Get appropriate icon for notification type
  function getNotificationIcon(notification) {
    // Default icon
    let icon = 'info-circle';
    
    // Check message content to determine appropriate icon
    if (notification.message.includes('favorite') || notification.message.includes('like')) {
      icon = 'heart';
    } else if (notification.message.includes('comment') || notification.message.includes('message')) {
      icon = 'comment';
    } else if (notification.message.includes('recipe')) {
      icon = 'utensils';
    } else if (notification.message.includes('welcome') || notification.message.includes('joined')) {
      icon = 'user-plus';
    }
    
    return icon;
  }

  // Get color based on notification type
  function getNotificationColor(notification) {
    // Default color class
    let colorClass = 'notification-default';
    
    // Check message content to determine appropriate color
    if (notification.message.includes('favorite') || notification.message.includes('like')) {
      colorClass = 'notification-love';
    } else if (notification.message.includes('comment') || notification.message.includes('message')) {
      colorClass = 'notification-comment';
    } else if (notification.message.includes('recipe')) {
      colorClass = 'notification-recipe';
    } else if (notification.message.includes('welcome') || notification.message.includes('joined')) {
      colorClass = 'notification-user';
    }
    
    return colorClass;
  }

  // Get formatted time
  function getFormattedTime(timestamp) {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  }

  onMount(() => {
    // Add event listeners when component mounts
    if (notificationDropdown) {
      notificationDropdown.addEventListener('shown.bs.dropdown', handleDropdownShown);
    }

    // Cleanup event listeners when component unmounts
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
            <button class="notification-bell position-relative" type="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Notifications">
              <i class="fas fa-bell"></i>
              {#if $notifications && $notifications.unreadCount > 0}
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {$notifications.unreadCount}
                  <span class="visually-hidden">unread messages</span>
                </span>
              {/if}
            </button>
            <div class="dropdown-menu dropdown-menu-end notification-menu" aria-labelledby="notificationDropdown">
              <div class="notification-header d-flex justify-content-between align-items-center px-3 py-2">
                <span class="notification-title">Notifications</span>
                <button class="btn btn-sm mark-all-btn" on:click={markAllAsRead} title="Mark all as read" aria-label="Mark all as read">
                  <i class="fas fa-check-double"></i>
                </button>
              </div>
              <div class="notification-body" style="max-height: 350px; overflow-y: auto;">
                {#if $notifications && $notifications.items && $notifications.items.length > 0}
                  {#each $notifications.items as notification, index}
                    <div class="notification-item {notification.read ? 'read' : 'unread'} {getNotificationColor(notification)}">
                      <div class="notification-icon">
                        <i class="fas fa-{getNotificationIcon(notification)}"></i>
                      </div>
                      <div class="notification-content">
                        <div class="notification-message">
                          {@html notification.message}
                        </div>
                        <div class="notification-time">
                          {getFormattedTime(notification.timestamp)}
                        </div>
                      </div>
                      {#if !notification.read}
                        <div class="notification-badge">
                          <span class="badge bg-primary rounded-pill">New</span>
                        </div>
                      {/if}
                    </div>
              {/each}
                {:else}
                  <div class="empty-notification p-3 text-center text-muted">
                    <i class="fas fa-bell-slash mb-2" style="font-size: 2rem;"></i>
                    <p class="mb-0">No notifications yet</p>
                  </div>
                {/if}
              </div>
              <div class="notification-footer text-center py-2">
                <a href="/notifications" class="view-all-link">View all notifications</a>
              </div>
            </div>
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
  .notification-bell {
    background: transparent;
    color: #2c3e50;
    border: none;
    font-size: 1.1rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    outline: none;
  }
  
  .notification-bell:hover {
    background-color: rgba(128, 194, 68, 0.1);
    color: #80c244;
  }
  
  .notification-menu {
    padding: 0;
    width: 320px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    overflow: hidden;
  }
  
  .notification-header {
    border-bottom: 1px solid #f1f1f1;
    background-color: #f8f9fa;
  }
  
  .notification-title {
    font-weight: 600;
    color: #2c3e50;
  }
  
  .mark-all-btn {
    color: #80c244;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .mark-all-btn:hover {
    background-color: rgba(128, 194, 68, 0.1);
  }
  
  .notification-item {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #f1f1f1;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .notification-item:hover {
    background-color: #f8f9fa;
  }
  
  .notification-item.unread {
    background-color: rgba(128, 194, 68, 0.05);
  }
  
  .notification-icon {
    min-width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 1rem;
  }
  
  .notification-content {
    flex: 1;
  }
  
  .notification-message {
    font-size: 0.9rem;
    color: #2c3e50;
    margin-bottom: 4px;
    line-height: 1.4;
  }
  
  .notification-item.unread .notification-message {
    font-weight: 600;
  }
  
  .notification-time {
    font-size: 0.75rem;
    color: #6c757d;
  }
  
  .notification-badge {
    margin-left: 10px;
  }
  
  .notification-footer {
    border-top: 1px solid #f1f1f1;
    background-color: #f8f9fa;
  }
  
  .view-all-link {
    color: #80c244;
    font-size: 0.85rem;
    text-decoration: none;
    font-weight: 600;
  }
  
  .view-all-link:hover {
    text-decoration: underline;
  }
  
  /* Notification colors */
  .notification-default .notification-icon {
    background-color: rgba(108, 117, 125, 0.1);
    color: #6c757d;
  }
  
  .notification-love .notification-icon {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
  
  .notification-comment .notification-icon {
    background-color: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
  }
  
  .notification-recipe .notification-icon {
    background-color: rgba(128, 194, 68, 0.1);
    color: #80c244;
  }
  
  .notification-user .notification-icon {
    background-color: rgba(111, 66, 193, 0.1);
    color: #6f42c1;
  }
  
  .empty-notification {
    color: #97a1a9;
  }
</style>
