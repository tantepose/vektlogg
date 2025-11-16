<script>
	// Main page component for the weight logging app
	// This component handles the form to log weight and displays the graph

	import { onMount } from 'svelte';
	import WeightChart from '$lib/WeightChart.svelte';
	import EditMode from '$lib/EditMode.svelte';

	// State variables
	let weight = ''; // Current weight input value
	let weights = []; // Array of all weight entries from the database
	let loading = false; // Loading state for form submission
	let debugLoading = false; // Loading state for debug button
	let message = ''; // Success/error message
	let editMode = false; // Whether we're in edit mode

	// Fetch all weight entries from the API when the page loads
	onMount(async () => {
		await fetchWeights();
		
		// Add keyboard shortcut listener for 'a' key to add sample weight
		// Only triggers when not typing in an input field
		function handleKeyPress(event) {
			// Check if user is typing in an input, textarea, or other form element
			const isTyping = event.target.tagName === 'INPUT' || 
			                event.target.tagName === 'TEXTAREA' ||
			                event.target.isContentEditable;
			
			// Only trigger if 'a' key is pressed and user is not typing
			if (event.key === 'a' && !isTyping && !debugLoading) {
				event.preventDefault();
				addSampleWeight();
			}
		}
		
		// Add event listener
		window.addEventListener('keydown', handleKeyPress);
		
		// Cleanup function to remove listener when component is destroyed
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	});

	// Function to fetch all weight entries from the database
	async function fetchWeights() {
		try {
			const response = await fetch('/api/weights');
			weights = await response.json();
		} catch (error) {
			console.error('Error fetching weights:', error);
			message = 'Error loading weight data';
		}
	}

	// Function to handle form submission
	// Adds a new weight entry with the current date
	async function handleSubmit(event) {
		event.preventDefault(); // Prevent page refresh

		// Validate input
		const weightValue = parseFloat(weight);
		if (isNaN(weightValue) || weightValue <= 0) {
			message = 'Please enter a valid weight';
			return;
		}

		loading = true;
		message = '';

		try {
			// Get today's date in YYYY-MM-DD format
			const today = new Date().toISOString().split('T')[0];

			// Send POST request to add the weight
			const response = await fetch('/api/weights', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					weight: weightValue,
					date: today
				})
			});

			const result = await response.json();

			if (result.success) {
				// Clear the form and show success message
				weight = '';
				message = 'Weight logged successfully!';
				
				// Refresh the weight list to update the graph
				await fetchWeights();
			} else {
				message = result.error || 'Failed to log weight';
			}
		} catch (error) {
			console.error('Error adding weight:', error);
			message = 'Error logging weight. Please try again.';
		} finally {
			loading = false;
		}
	}

	// Debug function to add a sample weight entry
	// Always adds weight for the day before the earliest (oldest) logged entry
	// This allows clicking multiple times to go further back in time
	async function addSampleWeight() {
		debugLoading = true;
		message = '';

		try {
			// Refresh weights first to ensure we have the latest data
			await fetchWeights();

			// Determine the date: day before earliest entry, or yesterday if no entries exist
			let targetDate;
			let sampleWeight;

			if (weights.length > 0) {
				// Get the earliest (oldest) weight entry
				// weights are sorted by date ASC, so first is oldest
				const earliestEntry = weights[0];
				const earliestDate = new Date(earliestEntry.date);
				
				// Calculate the day before the earliest entry
				earliestDate.setDate(earliestDate.getDate() - 1);
				targetDate = earliestDate.toISOString().split('T')[0];
				
				// Generate a sample weight: slightly random variation from earliest weight (±2kg)
				const variation = (Math.random() * 4 - 2).toFixed(1); // Random between -2 and +2
				sampleWeight = parseFloat((parseFloat(earliestEntry.weight) + parseFloat(variation)).toFixed(1));
			} else {
				// No entries exist, use yesterday's date and a default weight
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				targetDate = yesterday.toISOString().split('T')[0];
				sampleWeight = 75.0; // Default sample weight
			}

			// Send POST request to add the sample weight
			const response = await fetch('/api/weights', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					weight: sampleWeight,
					date: targetDate
				})
			});

			const result = await response.json();

			if (result.success) {
				message = `Sample weight (${sampleWeight} kg) added for ${targetDate}!`;
				// Refresh the weight list to update the graph
				await fetchWeights();
			} else {
				message = result.error || 'Failed to add sample weight';
			}
		} catch (error) {
			console.error('Error adding sample weight:', error);
			message = 'Error adding sample weight. Please try again.';
		} finally {
			debugLoading = false;
		}
	}

	// Function to toggle edit mode
	async function toggleEditMode() {
		editMode = !editMode;
		if (editMode) {
			// Refresh weights to ensure we have the latest data
			await fetchWeights();
		}
	}

	// Handle refresh event from EditMode component
	function handleRefresh() {
		fetchWeights();
	}
</script>

<!-- Main page layout -->
<div class="container">
	<h1>Weight Logger</h1>
	
	<!-- Form to log new weight -->
	<div class="form-container">
		<form on:submit={handleSubmit}>
			<label for="weight">
				Enter your weight (kg):
			</label>
			<div class="input-group">
				<input
					type="number"
					id="weight"
					step="0.1"
					min="0"
					bind:value={weight}
					placeholder="e.g. 75.5"
					required
					disabled={loading}
				/>
				<button type="submit" disabled={loading}>
					{loading ? 'Logging...' : 'Log Weight'}
				</button>
			</div>
		</form>

		<!-- Display success/error messages -->
		{#if message}
			<p class="message">{message}</p>
		{/if}

		<!-- Debug hint for keyboard shortcut -->
		<div class="debug-section">
			<span class="debug-hint">(Debug: Press 'a' to add sample weight for day before earliest entry)</span>
		</div>
	</div>

	<!-- Graph component to visualize weight over time -->
	<div class="chart-container">
		<h2>Weight Progress</h2>
		{#if weights.length > 0}
			<WeightChart data={weights} />
		{:else}
			<p class="no-data">No weight data yet. Log your first weight above!</p>
		{/if}
	</div>

	<!-- Edit Data button -->
	<div class="edit-toggle">
		<button 
			type="button" 
			class="edit-button" 
			on:click={toggleEditMode}
		>
			{editMode ? 'Close Edit Mode' : 'Edit Data'}
		</button>
	</div>

	<!-- Edit Data section - shows all entries when in edit mode -->
	{#if editMode}
		<EditMode weights={weights} on:refresh={handleRefresh} />
	{/if}
</div>

<style>
	/* Main container styling */
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	h1 {
		text-align: center;
		color: #1a237e; /* Dark blue */
		margin-bottom: 2rem;
		font-weight: 600;
	}

	h2 {
		color: #283593; /* Slightly lighter dark blue */
		margin-bottom: 1rem;
		font-weight: 600;
	}

	/* Form styling */
	.form-container {
		background: #fef9e7; /* Light paper yellow */
		padding: 2rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		box-shadow: 0 2px 8px rgba(26, 35, 126, 0.1);
		border: 1px solid rgba(26, 35, 126, 0.1);
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #1a237e; /* Dark blue */
		font-weight: 500;
	}

	.input-group {
		display: flex;
		gap: 1rem;
	}

	input {
		flex: 1;
		padding: 0.75rem;
		border: 2px solid rgba(26, 35, 126, 0.2);
		border-radius: 4px;
		font-size: 1rem;
		background: #fffef7; /* Very light paper */
		color: #1a237e;
	}

	input:focus {
		outline: none;
		border-color: #3949ab; /* Medium blue */
		background: #fff;
	}

	button {
		padding: 0.75rem 1.5rem;
		background: #283593; /* Dark blue */
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(26, 35, 126, 0.2);
	}

	button:hover:not(:disabled) {
		background: #1a237e; /* Darker blue */
		box-shadow: 0 4px 8px rgba(26, 35, 126, 0.3);
		transform: translateY(-1px);
	}

	button:disabled {
		background: #b0bec5;
		cursor: not-allowed;
		box-shadow: none;
	}

	.message {
		margin-top: 1rem;
		padding: 0.75rem;
		background: #e8eaf6; /* Light blue paper */
		color: #1a237e;
		border-radius: 4px;
		border: 1px solid rgba(26, 35, 126, 0.2);
	}

	/* Debug section styling */
	.debug-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px dashed rgba(26, 35, 126, 0.3);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.debug-hint {
		font-size: 0.85rem;
		color: #3949ab; /* Medium blue */
		font-style: italic;
	}

	/* Edit toggle button */
	.edit-toggle {
		text-align: center;
		margin-bottom: 1.5rem;
		margin-top: 2rem;
	}

	.edit-button {
		background: #3949ab; /* Medium blue */
		padding: 0.75rem 2rem;
	}

	.edit-button:hover:not(:disabled) {
		background: #283593; /* Darker blue */
	}

	/* Chart container */
	.chart-container {
		background: #fef9e7; /* Light paper yellow */
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(26, 35, 126, 0.15);
		border: 1px solid rgba(26, 35, 126, 0.1);
	}

	.no-data {
		text-align: center;
		color: #3949ab; /* Medium blue */
		padding: 2rem;
	}
</style>

