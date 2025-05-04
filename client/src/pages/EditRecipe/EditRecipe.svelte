<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user } from '../../stores/auth.js';
  import { fade } from 'svelte/transition';

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
  let visible = false;

  function navigate(path) {
    history.pushState({}, '', path);
    currentRoute.set(path);
  }

  // Add a new empty ingredient
  function addIngredient() {
    ingredients = [...ingredients, { name: '', quantity: '', unit: '' }];
    // Scroll to the new ingredient after DOM update
    setTimeout(() => {
      const elements = document.querySelectorAll('.ingredient-row');
      if (elements.length > 0) {
        elements[elements.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Remove an ingredient
  function removeIngredient(index) {
    ingredients = ingredients.filter((_, i) => i !== index);
  }

  // Add a new empty step
  function addStep() {
    steps = [...steps, ''];
    // Scroll to the new step after DOM update
    setTimeout(() => {
      const elements = document.querySelectorAll('.step-row');
      if (elements.length > 0) {
        elements[elements.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
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
      errorMessage = err.message;
      setTimeout(() => navigate('/recipes'), 3000);
    } finally {
      isFetching = false;
      // Show animation after data loaded
      setTimeout(() => {
        visible = true;
      }, 100);
    }
  }

  // Submit the recipe update
  async function handleSubmit(event) {
    event.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      errorMessage = 'Recipe title is required';
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (ingredients.filter(i => i.name.trim() !== '').length === 0) {
      errorMessage = 'At least one ingredient is required';
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (steps.filter(s => s.trim() !== '').length === 0) {
      errorMessage = 'At least one step is required';
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // Scroll to top to show the success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Redirect after a successful submission
      setTimeout(() => {
        navigate(`/recipes/${recipeId}`);
      }, 2000);
      
    } catch (error) {
      errorMessage = error.message || 'An error occurred while updating the recipe';
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

<div class="edit-recipe-section">
  <div class="container py-5">
    {#if isFetching}
      <div class="text-center py-5">
        <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading recipe...</p>
      </div>
    {:else if errorMessage && !visible}
      <div class="text-center py-5" in:fade={{ duration: 300 }}>
        <div class="alert-card error" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i> {errorMessage}
        </div>
        <div class="mt-4">
          <button class="back-btn" on:click={() => navigate('/recipes')}>
            <i class="fas fa-arrow-left me-2"></i> Back to recipes
          </button>
        </div>
      </div>
    {:else if visible}
      <div in:fade={{ duration: 500, delay: 100 }}>
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <!-- Page Title -->
            <div class="text-center mb-5" in:fade={{ duration: 500, delay: 200 }}>
              <h1 class="gradient-text">Edit Recipe</h1>
              <p class="lead-text">Update your recipe and share it with the world</p>
            </div>
            
            <!-- Recipe Form Card -->
            <div class="form-card" in:fade={{ duration: 500, delay: 300 }}>
              {#if errorMessage}
                <div class="alert-card error" role="alert" in:fade={{ duration: 300 }}>
                  <i class="fas fa-exclamation-circle me-2"></i> {errorMessage}
                </div>
              {/if}
              
              {#if successMessage}
                <div class="alert-card success" role="alert" in:fade={{ duration: 300 }}>
                  <i class="fas fa-check-circle me-2"></i> {successMessage}
                </div>
              {/if}

              <form on:submit={handleSubmit} class="needs-validation" novalidate>
                <!-- Recipe Title -->
                <div class="form-section" in:fade={{ duration: 500, delay: 400 }}>
                  <label for="title" class="form-label">Recipe Title</label>
                  <input
                    type="text"
                    class="form-input"
                    id="title"
                    bind:value={title}
                    required
                    placeholder="Enter a descriptive title for your recipe"
                    disabled={isLoading}
                  />
                </div>

                <!-- Image Upload -->
                <div class="form-section" in:fade={{ duration: 500, delay: 500 }}>
                  <label for="recipeImage" class="form-label">Recipe Image</label>
                  
                  {#if !imagePreview}
                    <div class="upload-area">
                      <input 
                        type="file" 
                        class="d-none" 
                        id="recipeImage" 
                        accept="image/*" 
                        on:change={handleFileChange}
                        disabled={isLoading}
                      />
                      <label for="recipeImage" class="upload-btn">
                        <div class="upload-icon">
                          <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="upload-text">
                          <span>Drag your image here, or <span class="text-accent">browse</span></span>
                          <small>Supports: JPG, PNG, GIF</small>
                        </div>
                      </label>
                    </div>
                  {:else}
                    <div class="image-preview">
                      <img 
                        src={imagePreview} 
                        alt="Recipe preview" 
                        class="preview-img"
                      >
                      <button 
                        type="button" 
                        class="remove-img-btn" 
                        on:click={() => {
                          selectedFile = null;
                          imagePreview = null;
                          document.getElementById('recipeImage').value = '';
                        }}
                        disabled={isLoading}
                        aria-label="Remove image"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                      
                      <div class="image-options">
                        {#if selectedFile}
                          <button 
                            type="button" 
                            class="image-option-btn" 
                            on:click={() => { 
                              selectedFile = null; 
                              imagePreview = getImageUrl(originalImageUrl);
                            }}
                            disabled={isLoading}
                          >
                            <i class="fas fa-undo me-2"></i> Keep original image
                          </button>
                        {:else}
                          <button 
                            type="button" 
                            class="image-option-btn" 
                            on:click={() => document.getElementById('recipeImage').click()}
                            disabled={isLoading}
                          >
                            <i class="fas fa-exchange-alt me-2"></i> Change image
                          </button>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>

                <!-- Ingredients -->
                <div class="form-section" in:fade={{ duration: 500, delay: 600 }}>
                  <div class="section-header">
                    <h2 class="section-title">Ingredients</h2>
                    <button
                      type="button"
                      class="add-btn"
                      on:click={addIngredient}
                      disabled={isLoading}
                    >
                      <i class="fas fa-plus me-2"></i> Add Ingredient
                    </button>
                  </div>
                  
                  <div class="ingredients-container">
                    {#each ingredients as ingredient, index}
                      <div class="ingredient-row" in:fade={{ duration: 300 }}>
                        <div class="ingredient-number">{index + 1}</div>
                        <div class="ingredient-fields">
                          <div class="ingredient-grid">
                            <div class="qty-field">
                              <input
                                id="quantity-{index}"
                                type="text"
                                class="form-input small-input"
                                placeholder="Qty"
                                bind:value={ingredient.quantity}
                                disabled={isLoading}
                              />
                            </div>
                            <div class="unit-field">
                              <input
                                id="unit-{index}"
                                type="text"
                                class="form-input small-input"
                                placeholder="Unit"
                                bind:value={ingredient.unit}
                                disabled={isLoading}
                              />
                            </div>
                            <div class="name-field">
                              <div class="input-with-action">
                                <input
                                  id="ingredient-{index}"
                                  type="text"
                                  class="form-input"
                                  placeholder="Ingredient name"
                                  bind:value={ingredient.name}
                                  required={index === 0}
                                  disabled={isLoading}
                                />
                                <button 
                                  type="button" 
                                  class="action-btn remove"
                                  on:click={() => removeIngredient(index)}
                                  disabled={ingredients.length === 1 && index === 0 || isLoading}
                                  title="Remove ingredient"
                                  aria-label="Remove ingredient"
                                >
                                  <i class="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Steps -->
                <div class="form-section" in:fade={{ duration: 500, delay: 700 }}>
                  <div class="section-header">
                    <h2 class="section-title">Preparation Steps</h2>
                    <button
                      type="button"
                      class="add-btn"
                      on:click={addStep}
                      disabled={isLoading}
                    >
                      <i class="fas fa-plus me-2"></i> Add Step
                    </button>
                  </div>
                  
                  <div class="steps-container">
                    {#each steps as step, index}
                      <div class="step-row" in:fade={{ duration: 300 }}>
                        <div class="step-number">
                          <span>{index + 1}</span>
                        </div>
                        <div class="step-content">
                          <div class="input-with-action">
                            <textarea
                              id="step-{index}"
                              class="form-textarea"
                              rows="3"
                              placeholder="Describe what to do in this step..."
                              bind:value={steps[index]}
                              required={index === 0}
                              disabled={isLoading}
                            ></textarea>
                            <button
                              type="button" 
                              class="action-btn remove"
                              on:click={() => removeStep(index)}
                              disabled={steps.length === 1 && index === 0 || isLoading}
                              title="Remove step"
                              aria-label="Remove step"
                            >
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons" in:fade={{ duration: 500, delay: 800 }}>
                  <button
                    type="button"
                    class="cancel-btn"
                    on:click={() => navigate(`/recipes/${recipeId}`)}
                    disabled={isLoading || isUploading}
                  >
                    <i class="fas fa-times me-2"></i> Cancel
                  </button>
                  
                  <button
                    type="submit"
                    class="submit-btn"
                    disabled={isLoading || isUploading}
                  >
                    {#if isLoading || isUploading}
                      <div class="spinner"></div>
                      <span>{isUploading ? 'Uploading image...' : 'Saving recipe...'}</span>
                    {:else}
                      <i class="fas fa-save me-2"></i> Save Changes
                    {/if}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .edit-recipe-section {
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
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .lead-text {
    color: #6c757d;
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto 1rem;
  }
  
  .form-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    padding: 2.5rem;
    position: relative;
    transition: all 0.3s ease;
    margin-bottom: 3rem;
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
    margin-bottom: 2.5rem;
  }
  
  .form-label {
    display: block;
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }
  
  .form-input, .form-textarea {
    width: 100%;
    padding: 0.85rem 1rem;
    border-radius: 8px;
    border: 2px solid #e9ecef;
    background-color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
    color: #2c3e50;
  }
  
  .small-input {
    padding: 0.75rem;
  }
  
  .form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: #80c244;
    box-shadow: 0 0 0 4px rgba(128, 194, 68, 0.1);
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  /* Image upload area */
  .upload-area {
    border: 2px dashed #dee2e6;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    background-color: #f8f9fa;
  }
  
  .upload-area:hover {
    border-color: #80c244;
    background-color: rgba(128, 194, 68, 0.05);
  }
  
  .upload-btn {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  .upload-icon {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #edf8e7, #f2f9ed);
    color: #80c244;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.15);
    transition: all 0.3s ease;
  }
  
  .upload-area:hover .upload-icon {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(128, 194, 68, 0.2);
  }
  
  .upload-text {
    color: #6c757d;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  .upload-text .text-accent {
    color: #80c244;
    font-weight: 600;
  }
  
  .upload-text small {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #98a6ad;
  }
  
  /* Image Preview */
  .image-preview {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .preview-img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    display: block;
  }
  
  .remove-img-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #ff5b5b;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    z-index: 2;
  }
  
  .remove-img-btn:hover {
    background-color: #ff5b5b;
    color: white;
    transform: scale(1.05);
  }
  
  .image-options {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    padding: 1rem;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .image-option-btn {
    background-color: rgba(255, 255, 255, 0.85);
    color: #2c3e50;
    border: none;
    border-radius: 30px;
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .image-option-btn:hover {
    background-color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  /* Section Headers */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.5rem;
    margin: 0;
  }
  
  .add-btn {
    background-color: #f2f9ed;
    color: #80c244;
    border: 1px solid rgba(128, 194, 68, 0.2);
    padding: 0.6rem 1.2rem;
    border-radius: 30px;
    font-weight: 600;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .add-btn:hover:not(:disabled) {
    background-color: #80c244;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.2);
  }
  
  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Back button for error state */
  .back-btn {
    background-color: #ffffff;
    color: #80c244;
    border: 1px solid #80c244;
    border-radius: 30px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    font-size: 1rem;
  }
  
  .back-btn:hover {
    background-color: #f2f9ed;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.15);
  }
  
  /* Ingredients */
  .ingredients-container {
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
  }
  
  .ingredient-row {
    display: flex;
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .ingredient-row:last-child {
    margin-bottom: 0;
  }
  
  .ingredient-number {
    width: 30px;
    height: 30px;
    background-color: #80c244;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 1rem;
    margin-top: 0.5rem;
    flex-shrink: 0;
  }
  
  .ingredient-fields {
    flex: 1;
  }
  
  .ingredient-grid {
    display: grid;
    grid-template-columns: minmax(50px, 15%) minmax(50px, 15%) 1fr;
    gap: 10px;
    align-items: start;
  }
  
  .qty-field, .unit-field, .name-field {
    width: 100%;
  }
  
  /* Steps */
  .steps-container {
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
  }
  
  .step-row {
    display: flex;
    margin-bottom: 2rem;
    position: relative;
  }
  
  .step-row:last-child {
    margin-bottom: 0;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #80c244, #6ca036);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 1rem;
    flex-shrink: 0;
    box-shadow: 0 4px 8px rgba(128, 194, 68, 0.2);
    font-size: 1.1rem;
  }
  
  .step-content {
    flex: 1;
  }
  
  /* Input with action button */
  .input-with-action {
    position: relative;
    display: flex;
  }
  
  .action-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    background: transparent;
    border: none;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
    z-index: 1;
  }
  
  .action-btn.remove {
    color: #adb5bd;
  }
  
  .action-btn.remove:hover:not(:disabled) {
    color: #ff5b5b;
    background-color: rgba(255, 91, 91, 0.1);
  }
  
  .action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  /* Action buttons */
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 3rem;
  }
  
  .submit-btn {
    background: linear-gradient(135deg, #80c244, #6ca036);
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(128, 194, 68, 0.3);
    transition: all 0.3s ease;
    min-width: 180px;
  }
  
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(128, 194, 68, 0.4);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .cancel-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #e9ecef;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .cancel-btn:hover:not(:disabled) {
    background-color: #e9ecef;
    color: #495057;
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
  
  /* For mobile responsiveness */
  @media (max-width: 768px) {
    .form-card {
      padding: 1.5rem;
    }
    
    .gradient-text {
      font-size: 2.5rem;
    }
    
    .action-buttons {
      flex-direction: column-reverse;
      gap: 1rem;
    }
    
    .cancel-btn, .submit-btn {
      width: 100%;
    }
    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    .add-btn {
      width: 100%;
    }
    
    .ingredient-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    .name-field {
      grid-column: 1 / -1;
      margin-top: 8px;
    }
  }
</style> 