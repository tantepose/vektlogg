<script>
	// Edit Mode component
	// Handles editing, saving, and deleting weight entries

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Props: weights array from parent
	export let weights = [];

	// Internal state for editing weights
	let editingWeights = {};

	// Initialize editing weights when component mounts or weights change
	$: if (weights && weights.length > 0) {
		// Initialize editing weights with current values
		const newEditingWeights = {};
		weights.forEach(entry => {
			newEditingWeights[entry.id] = entry.weight;
		});
		editingWeights = newEditingWeights;
	}

	// Function to update the temporary weight value while editing
	function updateEditingWeight(id, value) {
		editingWeights[id] = parseFloat(value) || 0;
		// Update the object to trigger reactivity
		editingWeights = { ...editingWeights };
	}

	// Function to save the edited weight for an entry
	async function saveWeight(id) {
		const newWeight = editingWeights[id];
		
		if (isNaN(newWeight) || newWeight <= 0) {
			alert('Please enter a valid weight');
			return;
		}

		try {
			const response = await fetch('/api/weights', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: id,
					weight: newWeight
				})
			});

			const result = await response.json();

			if (result.success) {
				// Emit refresh event to parent
				dispatch('refresh');
				// Update the editing weight to match
				editingWeights[id] = newWeight;
				editingWeights = { ...editingWeights };
			} else {
				alert(result.error || 'Failed to update weight');
			}
		} catch (error) {
			console.error('Error updating weight:', error);
			alert('Error updating weight. Please try again.');
		}
	}

	// Function to delete an entry
	async function deleteEntry(id) {
		if (!confirm('Are you sure you want to delete this entry?')) {
			return;
		}

		try {
			const response = await fetch('/api/weights', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: id })
			});

			const result = await response.json();

			if (result.success) {
				// Emit refresh event to parent
				dispatch('refresh');
				// Remove from editing weights if it exists
				delete editingWeights[id];
				editingWeights = { ...editingWeights };
			} else {
				alert(result.error || 'Failed to delete entry');
			}
		} catch (error) {
			console.error('Error deleting entry:', error);
			alert('Error deleting entry. Please try again.');
		}
	}

	// Function to delete all entries
	async function deleteAllEntries() {
		if (!confirm('Are you sure you want to delete ALL weight entries? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch('/api/weights', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ deleteAll: true })
			});

			const result = await response.json();

			if (result.success) {
				// Emit refresh event to parent
				dispatch('refresh');
				// Clear editing weights
				editingWeights = {};
			} else {
				alert(result.error || 'Failed to delete all entries');
			}
		} catch (error) {
			console.error('Error deleting all entries:', error);
			alert('Error deleting all entries. Please try again.');
		}
	}

	// Format date for display
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<!-- Edit Data section -->
<div class="edit-container">
	<div class="edit-header">
		<h2>Edit Weight Entries</h2>
		<button 
			type="button" 
			class="delete-all-button"
			on:click={deleteAllEntries}
			disabled={weights.length === 0}
		>
			Delete All Data
		</button>
	</div>
	{#if weights.length > 0}
		<div class="entries-list">
			{#each weights as entry (entry.id)}
				<div class="entry-row">
					<div class="entry-date">
						{formatDate(entry.date)}
					</div>
					<div class="entry-weight-input">
						<input
							type="number"
							step="0.1"
							min="0"
							value={editingWeights[entry.id]}
							on:input={(e) => updateEditingWeight(entry.id, e.target.value)}
						/>
					</div>
					<div class="entry-actions">
						<button 
							type="button" 
							class="save-button"
							on:click={() => saveWeight(entry.id)}
						>
							Save
						</button>
						<button 
							type="button" 
							class="delete-button"
							on:click={() => deleteEntry(entry.id)}
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="no-data">No weight entries to edit.</p>
	{/if}
</div>

<style>
	/* Edit container styling */
	.edit-container {
		background: #fef9e7; /* Light paper yellow */
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(26, 35, 126, 0.15);
		border: 1px solid rgba(26, 35, 126, 0.1);
		margin-bottom: 2rem;
	}

	.edit-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.edit-header h2 {
		color: #283593; /* Slightly lighter dark blue */
		margin-bottom: 0;
		font-weight: 600;
	}

	.delete-all-button {
		background: #c62828; /* Dark red */
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(26, 35, 126, 0.2);
	}

	.delete-all-button:hover:not(:disabled) {
		background: #b71c1c; /* Darker red */
		box-shadow: 0 4px 8px rgba(26, 35, 126, 0.3);
		transform: translateY(-1px);
	}

	.delete-all-button:disabled {
		background: #b0bec5;
		cursor: not-allowed;
		box-shadow: none;
	}

	.entries-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.entry-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #fffef7; /* Very light paper */
		border-radius: 6px;
		border: 1px solid rgba(26, 35, 126, 0.15);
		box-shadow: 0 1px 3px rgba(26, 35, 126, 0.08);
		flex-wrap: nowrap; /* Ensure everything stays on one line */
	}

	.entry-date {
		min-width: 150px;
		flex-shrink: 0; /* Don't shrink the date */
		font-weight: 500;
		color: #1a237e; /* Dark blue */
	}

	.entry-weight-input {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 1; /* Allow to shrink if needed */
		min-width: 0; /* Allow flex item to shrink below content size */
	}

	.entry-weight-input input {
		width: 100px;
		min-width: 80px; /* Minimum width */
		padding: 0.5rem;
		border: 2px solid rgba(26, 35, 126, 0.2);
		border-radius: 4px;
		font-size: 0.9rem;
		background: #fff;
		color: #1a237e;
		flex-shrink: 0; /* Don't shrink the input */
	}

	.entry-weight-input input:focus {
		outline: none;
		border-color: #3949ab; /* Medium blue */
	}

	.entry-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0; /* Don't shrink the buttons */
	}

	.save-button {
		background: #283593; /* Dark blue */
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(26, 35, 126, 0.2);
	}

	.save-button:hover:not(:disabled) {
		background: #1a237e; /* Darker blue */
		box-shadow: 0 4px 8px rgba(26, 35, 126, 0.3);
		transform: translateY(-1px);
	}

	.save-button:disabled {
		background: #b0bec5;
		cursor: not-allowed;
		box-shadow: none;
	}

	.delete-button {
		background: #c62828; /* Dark red */
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(26, 35, 126, 0.2);
	}

	.delete-button:hover:not(:disabled) {
		background: #b71c1c; /* Darker red */
		box-shadow: 0 4px 8px rgba(26, 35, 126, 0.3);
		transform: translateY(-1px);
	}

	.delete-button:disabled {
		background: #b0bec5;
		cursor: not-allowed;
		box-shadow: none;
	}

	.no-data {
		text-align: center;
		color: #3949ab; /* Medium blue */
		padding: 2rem;
	}
</style>

