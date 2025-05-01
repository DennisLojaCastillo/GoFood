<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user } from '../../stores/auth.js';

  // Props from router
  export let params = {};

  // Recipe form data
  let title = '';
  let ingredients = [{ name: '', quantity: '', unit: '' }];
  let steps = [''];
  let selectedFile = null;
  let imagePreview = null;
  let originalImageUrl = null;
  let recipeId = null;
  
  // Form state
  let isLoading = false;
  let isUploading = false;
  let isFetching = true;
  let errorMessage = '';
  let successMessage = '';

  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }

  // Add a new empty ingredient
  function addIngredient() {
    ingredients = [...ingredients, { name: '', quantity: '', unit: '' }];
  }

  // Remove an ingredient
  function removeIngredient(index) {
    ingredients = ingredients.filter((_, i) => i !== index);
  }

  // Add a new empty step
  function addStep() {
    steps = [...steps, ''];
  }

  // Remove a step
  function removeStep(index) {
    steps = steps.filter((_, i) => i !== index);
  }

  // Parse raw ingredient back to structured format
  function parseIngredient(rawIngredient) {
    // Attempt to recognize format: "quantity unit name" or just "name"
    const match = rawIngredient.match(/^(?:(\d+(?:\.\d+)?)\s*([a-zA-Z]*)\s+)?(.+)$/);
    
    if (match) {
      return {
        quantity: match[1] || '',
        unit: match[2] || '',
        name: match[3] || rawIngredient
      };
    }
    
    return { name: rawIngredient, quantity: '', unit: '' };
  }

  // Format ingredients for submission
  function formatIngredients() {
    return ingredients
      .filter(i => i.name.trim() !== '')
      .map(i => {
        const quantity = i.quantity ? `${i.quantity} ${i.unit || ''}`.trim() : '';
        return quantity ? `${quantity} ${i.name}` : i.name;
      });
  }

  // Handle file selection
  function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) {
      selectedFile = null;
      imagePreview = originalImageUrl;
      return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
      errorMessage = 'Please select an image file';
      selectedFile = null;
      imagePreview = originalImageUrl;
      return;
    }

    selectedFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Handle recipe image URL
  function getImageUrl(imageUrl) {
    if (!imageUrl) {
      return null;
    }
    
    // Check if it's a full URL
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    }
    
    // Fix the local URL to make sure it points to the correct server location
    let path = imageUrl;
    // Remove leading slash to avoid double slashes
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    // Ensure we use the correct server URL (same as API)
    return `http://localhost:3000/${path}`;
  }

  // Upload the image
  async function uploadImage() {
    if (!selectedFile) return originalImageUrl;

    isUploading = true;
    const token = localStorage.getItem('token');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Image upload failed');
      }

      return data.imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      isUploading = false;
    }
  }

  // Fetch recipe data to edit
  async function fetchRecipe(id) {
    isFetching = true;
    errorMessage = '';

    try {
      if (!id) {
        throw new Error('No recipe ID provided');
      }

      // Check if user is logged in
      if (!$user) {
        navigate('/login');
        return;
      }

      // Add authentication token to request
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Could not find the recipe');
      }

      const recipe = await response.json();     
      
      // Check various possible ID keys
      const userId = $user?._id || $user?.id || $user?.userId;
      const recipeCreator = recipe.createdBy;            
      
      // Check if user is the author
      if (recipeCreator !== userId) {
        throw new Error('You can only edit your own recipes');
      }
      
      // Fill form with recipe data
      title = recipe.title;
      
      // Parse raw ingredients to format
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        ingredients = recipe.ingredients.map(parseIngredient);
      }
      
      // Set steps
      if (recipe.steps && recipe.steps.length > 0) {
        steps = recipe.steps;
      }
      
      // Set image
      originalImageUrl = recipe.imageUrl;
      imagePreview = getImageUrl(recipe.imageUrl);
      
    } catch (err) {
      console.error('Error fetching recipe:', err);
      errorMessage = err.message;
      setTimeout(() => navigate('/recipes'), 3000);
    } finally {
      isFetching = false;
    }
  }

  // Submit the recipe update
  async function handleSubmit(event) {
    event.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      errorMessage = 'Recipe title is required';
      return;
    }
    
    if (ingredients.filter(i => i.name.trim() !== '').length === 0) {
      errorMessage = 'At least one ingredient is required';
      return;
    }
    
    if (steps.filter(s => s.trim() !== '').length === 0) {
      errorMessage = 'At least one step is required';
      return;
    }

    isLoading = true;
    errorMessage = '';
    successMessage = '';

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to update a recipe');
      }

      // Upload new image if selected
      let recipeImageUrl = originalImageUrl;
      if (selectedFile) {
        recipeImageUrl = await uploadImage();
        if (!recipeImageUrl) {
          throw new Error('Image upload failed');
        }
      }

      const formattedIngredients = formatIngredients();
      const filteredSteps = steps.filter(s => s.trim() !== '');

      const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          ingredients: formattedIngredients,
          steps: filteredSteps,
          imageUrl: recipeImageUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Recipe update failed');
      }

      // Show success message
      successMessage = 'Recipe updated!';
      
      // Redirect after a successful submission
      setTimeout(() => {
        navigate(`/recipes/${recipeId}`);
      }, 2000);
      
    } catch (error) {
      errorMessage = error.message || 'An error occurred while updating the recipe';
      console.error('Update recipe error:', error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // Redirect if user is not logged in
    if (!$user) {
      navigate('/login');
      return;
    }
    
    // Get recipe ID from params
    if (params && params.id) {
      recipeId = params.id;
      fetchRecipe(recipeId);
    } else {
      // Fallback to URL parsing if params are not available
      const path = window.location.pathname;
      const match = path.match(/\/recipes\/edit\/([^\/]+)/);
      
      if (match && match[1]) {
        recipeId = match[1];
        fetchRecipe(recipeId);
      } else {
        errorMessage = 'Invalid recipe ID';
        setTimeout(() => navigate('/recipes'), 3000);
      }
    }
  });
</script>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      {#if isFetching}
        <div class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      {:else if errorMessage}
        <div class="text-center py-5">
          <div class="alert alert-danger d-inline-block" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {errorMessage}
          </div>
          <div class="mt-3">
            <button class="btn btn-outline-success" on:click={() => navigate('/recipes')}>
              <i class="bi bi-arrow-left me-2"></i> Back to recipes
            </button>
          </div>
        </div>
      {:else}
        <div class="card shadow border-0">
          <div class="card-header bg-success text-white py-3">
            <h2 class="text-center mb-0">Edit Recipe</h2>
          </div>
          <div class="card-body p-4">
            {#if successMessage}
              <div class="alert alert-success" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> {successMessage}
              </div>
            {/if}
            
            {#if errorMessage}
              <div class="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            {/if}

            <form on:submit={handleSubmit} class="needs-validation" novalidate>
              <!-- Recipe Title -->
              <div class="mb-4">
                <label for="title" class="form-label fw-bold">Recipe Title</label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  id="title"
                  bind:value={title}
                  required
                  placeholder="Enter a descriptive title for your recipe"
                  disabled={isLoading}
                />
              </div>

              <!-- Image Upload -->
              <div class="mb-4">
                <label for="recipeImage" class="form-label fw-bold">Recipe Image</label>
                
                {#if !imagePreview}
                  <div class="dropzone mb-3 p-4 text-center border rounded bg-light">
                    <input 
                      type="file" 
                      class="d-none" 
                      id="recipeImage" 
                      accept="image/*" 
                      on:change={handleFileChange}
                      disabled={isLoading}
                    />
                    <label for="recipeImage" class="btn btn-outline-success mb-3">
                      <i class="bi bi-upload me-2"></i>Select image
                    </label>
                    <div class="text-muted">Upload an image of your finished recipe</div>
                  </div>
                {:else}
                  <div class="card mb-3 border">
                    <div class="card-body p-0">
                      <div class="position-relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          class="img-fluid rounded" 
                          style="width: 100%; max-height: 300px; object-fit: cover;"
                        >
                        <button 
                          type="button" 
                          class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" 
                          style="width: 30px; height: 30px; padding: 0; line-height: 30px;" 
                          on:click={() => {
                            selectedFile = null;
                            imagePreview = null;
                            document.getElementById('recipeImage').value = '';
                          }}
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="card-footer bg-light">
                      <div class="form-text">
                        {#if selectedFile}
                          New image selected. <button type="button" class="btn btn-sm btn-link p-0" on:click={() => { selectedFile = null; imagePreview = getImageUrl(originalImageUrl); }}>Keep original image</button>
                        {:else}
                          <button type="button" class="btn btn-sm btn-outline-secondary" on:click={() => document.getElementById('recipeImage').click()}>Select new image</button>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Ingredients -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 id="ingredients-heading" class="form-label fw-bold m-0 fs-6">Ingredients</h3>
                  <button
                    type="button"
                    class="btn btn-sm btn-success"
                    on:click={addIngredient}
                    disabled={isLoading}
                  >
                    <i class="bi bi-plus-circle me-1"></i> Add ingredient
                  </button>
                </div>
                
                <div class="card border-0 shadow-sm">
                  <div class="card-body p-3">
                    {#each ingredients as ingredient, index}
                      <div class="row mb-2 align-items-center {index > 0 ? 'mt-3 pt-3 border-top' : ''}">
                        <div class="col-3">
                          <label for="quantity-{index}" class="visually-hidden">Quantity for ingredient {index + 1}</label>
                          <input
                            id="quantity-{index}"
                            type="text"
                            class="form-control"
                            placeholder="Quantity"
                            bind:value={ingredient.quantity}
                            disabled={isLoading}
                          />
                        </div>
                        <div class="col-3">
                          <label for="unit-{index}" class="visually-hidden">Unit for ingredient {index + 1}</label>
                          <input
                            id="unit-{index}"
                            type="text"
                            class="form-control"
                            placeholder="Unit"
                            bind:value={ingredient.unit}
                            disabled={isLoading}
                          />
                        </div>
                        <div class="col-6">
                          <div class="input-group">
                            <label for="ingredient-{index}" class="visually-hidden">Name for ingredient {index + 1}</label>
                            <input
                              id="ingredient-{index}"
                              type="text"
                              class="form-control"
                              placeholder="Ingredient name"
                              bind:value={ingredient.name}
                              required={index === 0}
                              disabled={isLoading}
                            />
                            <button 
                              type="button" 
                              class="btn btn-outline-danger"
                              on:click={() => removeIngredient(index)}
                              disabled={ingredients.length === 1 && index === 0 || isLoading}
                              title="Remove ingredient"
                              aria-label="Remove ingredient"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

              <!-- Steps -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 id="steps-heading" class="form-label fw-bold m-0 fs-6">Steps</h3>
                  <button
                    type="button"
                    class="btn btn-sm btn-success"
                    on:click={addStep}
                    disabled={isLoading}
                  >
                    <i class="bi bi-plus-circle me-1"></i> Add step
                  </button>
                </div>
                
                <div class="card border-0 shadow-sm">
                  <div class="card-body p-3">
                    {#each steps as step, index}
                      <div class="mb-3 {index > 0 ? 'mt-3 pt-3 border-top' : ''}">
                        <div class="d-flex">
                          <div class="rounded-circle bg-success text-white d-flex justify-content-center align-items-center me-3 flex-shrink-0" style="width: 36px; height: 36px;">
                            {index + 1}
                          </div>
                          <div class="flex-grow-1">
                            <label for="step-{index}" class="visually-hidden">Step {index + 1}</label>
                            <textarea
                              id="step-{index}"
                              class="form-control"
                              rows="2"
                              placeholder="Describe this step..."
                              bind:value={steps[index]}
                              required={index === 0}
                              disabled={isLoading}
                            ></textarea>
                          </div>
                          <div class="ms-2">
                            <button
                              type="button" 
                              class="btn btn-outline-danger"
                              on:click={() => removeStep(index)}
                              disabled={steps.length === 1 && index === 0 || isLoading}
                              title="Remove step"
                              aria-label="Remove step"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-lg py-2 px-4"
                  on:click={() => navigate(`/recipes/${recipeId}`)}
                  disabled={isLoading || isUploading}
                >
                  <i class="bi bi-x-lg me-1"></i> Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-success btn-lg py-2 px-4"
                  disabled={isLoading || isUploading}
                >
                  {#if isLoading || isUploading}
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isUploading ? 'Uploading image...' : 'Saving recipe...'}
                  {:else}
                    <i class="bi bi-check-lg me-1"></i> Save changes
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

<style>
  .card {
    border-radius: 10px;
    overflow: hidden;
  }
  
  textarea {
    resize: vertical;
  }
  
  .dropzone {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .dropzone:hover {
    background-color: #f8f9fa;
    border-color: #28a745;
  }
  
  .form-control:focus {
    border-color: #28a745;
    box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
  }
  
  /* Add more spacing and better typography */
  label.form-label.fw-bold {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  /* Better form elements styling */
  .form-control {
    padding: 0.6rem 0.75rem;
  }
  
  /* Custom styling for the ingredient and step cards */
  .shadow-sm {
    box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important;
  }
  
  /* Rounded buttons */
  .btn {
    border-radius: 5px;
  }
</style> 