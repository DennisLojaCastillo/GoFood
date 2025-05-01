<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user } from '../../stores/auth.js';

  // Recipe form data
  let title = '';
  let ingredients = [{ name: '', quantity: '', unit: '' }];
  let steps = [''];
  let selectedFile = null;
  let imagePreview = null;
  
  // Form state
  let isLoading = false;
  let isUploading = false;
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
      imagePreview = null;
      return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
      errorMessage = 'Please select an image file';
      selectedFile = null;
      imagePreview = null;
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

  // Upload the image
  async function uploadImage() {
    if (!selectedFile) return null;

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
        throw new Error(data.message || 'Failed to upload image');
      }

      return data.imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      isUploading = false;
    }
  }

  // Submit the recipe
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

    if (!selectedFile) {
      errorMessage = 'Please upload an image for your recipe';
      return;
    }

    isLoading = true;
    errorMessage = '';
    successMessage = '';

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to create a recipe');
      }

      // Upload image
      const recipeImageUrl = await uploadImage();
      if (!recipeImageUrl) {
        throw new Error('Failed to upload image');
      }

      const formattedIngredients = formatIngredients();
      const filteredSteps = steps.filter(s => s.trim() !== '');

      const response = await fetch('http://localhost:3000/api/recipes', {
        method: 'POST',
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
        throw new Error(data.message || 'Failed to create recipe');
      }

      // Show success message
      successMessage = 'Recipe created successfully!';
      
      // Clear form after a successful submission
      setTimeout(() => {
        navigate(`/recipes`);
      }, 2000);
      
    } catch (error) {
      errorMessage = error.message || 'An error occurred while creating the recipe';
      console.error('Create recipe error:', error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // Redirect if user is not logged in
    if (!$user) {
      navigate('/login');
    }
  });
</script>

<div class="create-recipe-section">
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow border-0">
          <div class="card-header bg-success text-white py-3">
            <h2 class="text-center mb-0">Create New Recipe</h2>
          </div>
          <div class="card-body p-4">
            {#if errorMessage}
              <div class="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            {/if}
            
            {#if successMessage}
              <div class="alert alert-success" role="alert">
                {successMessage}
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
                      required
                    />
                    <label for="recipeImage" class="btn btn-outline-success mb-3">
                      <i class="bi bi-upload me-2"></i>Choose Image
                    </label>
                    <div class="text-muted">Upload an image of your completed recipe</div>
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
                        >
                          ×
                        </button>
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
                  >
                    <i class="bi bi-plus-circle me-1"></i> Add Ingredient
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
                            placeholder="Qty"
                            bind:value={ingredient.quantity}
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
                            />
                            <button 
                              type="button" 
                              class="btn btn-outline-danger"
                              on:click={() => removeIngredient(index)}
                              disabled={ingredients.length === 1 && index === 0}
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
                  <h3 id="steps-heading" class="form-label fw-bold m-0 fs-6">Preparation Steps</h3>
                  <button
                    type="button"
                    class="btn btn-sm btn-success"
                    on:click={addStep}
                  >
                    <i class="bi bi-plus-circle me-1"></i> Add Step
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
                              placeholder="Describe what to do in this step..."
                              bind:value={steps[index]}
                              required={index === 0}
                            ></textarea>
                          </div>
                          <div class="ms-2">
                            <button
                              type="button" 
                              class="btn btn-outline-danger"
                              on:click={() => removeStep(index)}
                              disabled={steps.length === 1 && index === 0}
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

              <!-- Submit Button -->
              <div class="d-grid mt-4">
                <button
                  type="submit"
                  class="btn btn-success btn-lg py-3"
                  disabled={isLoading || isUploading}
                >
                  {#if isLoading || isUploading}
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isUploading ? 'Uploading image...' : 'Creating recipe...'}
                  {:else}
                    Create Recipe
                  {/if}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .create-recipe-section {
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
  label.form-label.fw-bold {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  .form-control {
    padding: 0.6rem 0.75rem;
  }
  .shadow-sm {
    box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important;
  }
  .btn {
    border-radius: 5px;
  }
  .btn-success {
    background-color: #80c244!important;
    color: #fff !important;
    border: none;
  }
  .btn-success:hover {
    transform: translateY(-3px);
  }
  .btn-outline-success {
    color: #80c244 !important;
    border-color: #80c244 !important;
  }
  .btn-outline-success:hover {  
    background-color: #80c244 !important;
    color: #fff !important;  
    border-color: #80c244 !important;
  }
</style> 