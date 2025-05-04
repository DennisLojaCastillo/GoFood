<script>
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/router.js';
  import { user } from '../../stores/auth.js';
  import { fade } from 'svelte/transition';

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
      
      // Scroll to top to show the success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Clear form after a successful submission
      setTimeout(() => {
        navigate(`/recipes`);
      }, 2000);
      
    } catch (error) {
      errorMessage = error.message || 'An error occurred while creating the recipe';
      console.error('Create recipe error:', error);
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
    
    // Show animation after component mounted
    setTimeout(() => {
      visible = true;
    }, 100);
  });
</script>

<div class="create-recipe-section">
  <div class="container py-5">
    {#if !visible}
      <div class="text-center py-5">
        <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Preparing your recipe form...</p>
      </div>
    {:else}
      <div in:fade={{ duration: 500, delay: 100 }}>
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <!-- Page Title -->
            <div class="text-center mb-5" in:fade={{ duration: 500, delay: 200 }}>
              <h1 class="gradient-text">Create a New Recipe</h1>
              <p class="lead-text">Share your culinary creations with the world</p>
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
                        required
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
                      >
                        <i class="fas fa-times"></i>
                      </button>
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
                              />
                            </div>
                            <div class="unit-field">
                              <input
                                id="unit-{index}"
                                type="text"
                                class="form-input small-input"
                                placeholder="Unit"
                                bind:value={ingredient.unit}
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
                                />
                                <button 
                                  type="button" 
                                  class="action-btn remove"
                                  on:click={() => removeIngredient(index)}
                                  disabled={ingredients.length === 1 && index === 0}
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
                            ></textarea>
                            <button
                              type="button" 
                              class="action-btn remove"
                              on:click={() => removeStep(index)}
                              disabled={steps.length === 1 && index === 0}
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

                <!-- Submit Button -->
                <div class="submit-section" in:fade={{ duration: 500, delay: 800 }}>
                  <button
                    type="submit"
                    class="submit-btn"
                    disabled={isLoading || isUploading}
                  >
                    {#if isLoading || isUploading}
                      <div class="spinner"></div>
                      <span>{isUploading ? 'Uploading image...' : 'Creating recipe...'}</span>
                    {:else}
                      <i class="fas fa-utensils me-2"></i> Create Recipe
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
  .create-recipe-section {
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
  }
  
  .remove-img-btn:hover {
    background-color: #ff5b5b;
    color: white;
    transform: scale(1.05);
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
  
  .add-btn:hover {
    background-color: #80c244;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(128, 194, 68, 0.2);
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
  
  /* For mobile, stack the fields vertically */
  @media (max-width: 576px) {
    .ingredient-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    .name-field {
      grid-column: 1 / -1;
      margin-top: 8px;
    }
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
  
  .action-btn.remove:hover {
    color: #ff5b5b;
    background-color: rgba(255, 91, 91, 0.1);
  }
  
  .action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  /* Submit button */
  .submit-section {
    text-align: center;
    margin-top: 3rem;
  }
  
  .submit-btn {
    background: linear-gradient(135deg, #80c244, #6ca036);
    color: white;
    border: none;
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(128, 194, 68, 0.3);
    transition: all 0.3s ease;
    min-width: 250px;
  }
  
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(128, 194, 68, 0.4);
  }
  
  .submit-btn:disabled {
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
  
  @media (max-width: 768px) {
    .form-card {
      padding: 1.5rem;
    }
    
    .gradient-text {
      font-size: 2.5rem;
    }
    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    .add-btn {
      width: 100%;
    }
  }
</style> 