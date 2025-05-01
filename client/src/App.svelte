<script>
  import { onMount } from 'svelte';
  import { currentRoute } from './stores/router.js';
  import Nav from './components/Header/Header.svelte';

  import Home from './pages/Home/Home.svelte';
  import Login from './pages/Login/Login.svelte';
  import Signup from './pages/Signup/Signup.svelte';
  import Recipes from './pages/Recipes/Recipes.svelte';
  import RecipeDetail from './pages/RecipeDetail/RecipeDetail.svelte';
  import CreateRecipe from './pages/CreateRecipe/CreateRecipe.svelte';
  import EditRecipe from './pages/EditRecipe/EditRecipe.svelte';
  import UserDashboard from './pages/UserDashboard/UserDashboard.svelte';
  import AdminDashboard from './pages/AdminDashboard/AdminDashboard.svelte';
  import UserProfile from './pages/UserProfile/UserProfile.svelte';
  import About from './pages/About/About.svelte'; 
  import Contact from './pages/Contact/Contact.svelte';

  let route = '/';
  let params = {};

  const routes = {
    '/': Home,
    '/login': Login,
    '/signup': Signup,
    '/recipes': Recipes,
    '/recipes/edit/:id': EditRecipe,
    '/recipes/:id': RecipeDetail,
    '/create': CreateRecipe,
    '/user': UserDashboard,
    '/admin': AdminDashboard,
    '/admin-dashboard': AdminDashboard,
    '/profile': UserProfile,
    '/about': About,
    '/contact': Contact,
  };

  function findMatchingRoute(path) {
    // First check for exact matches
    if (routes[path]) return { component: routes[path], params: {} };
    
    // Check for dynamic routes
    for (const [pattern, component] of Object.entries(routes)) {
      if (pattern.includes(':')) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        if (patternParts.length !== pathParts.length) continue;
        
        const params = {};
        let isMatch = true;
        
        for (let i = 0; i < patternParts.length; i++) {
          if (patternParts[i].startsWith(':')) {
            // This is a parameter
            const paramName = patternParts[i].substring(1);
            params[paramName] = pathParts[i];
          } else if (patternParts[i] !== pathParts[i]) {
            // Static part doesn't match
            isMatch = false;
            break;
          }
        }
        
        if (isMatch) {
          return { component, params };
        }
      }
    }
    
    // No match found, return default
    return { component: Home, params: {} };
  }

  $: {
    const result = findMatchingRoute(route);
    Component = result.component;
    params = result.params;
  }

  let Component = Home;

  currentRoute.subscribe((r) => {
    route = r;
  });

  onMount(() => {
    currentRoute.set(window.location.pathname);
  });

  window.addEventListener('popstate', () => {
    currentRoute.set(window.location.pathname);
  });
</script>

<Nav />

<svelte:component this={Component} {params} />
