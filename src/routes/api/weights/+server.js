// API endpoint for weight operations
// GET: Returns all weight entries
// POST: Adds a new weight entry
// PUT: Updates the weight of an entry
// DELETE: Deletes an entry

import { json } from '@sveltejs/kit';
import { addWeight, getAllWeights, updateWeight, deleteWeight, deleteAllWeights } from '$lib/db.js';

// Handle GET requests - return all weight entries
export async function GET() {
	try {
		const weights = getAllWeights();
		return json(weights);
	} catch (error) {
		console.error('Error fetching weights:', error);
		return json({ error: 'Failed to fetch weights' }, { status: 500 });
	}
}

// Handle POST requests - add a new weight entry
export async function POST({ request }) {
	try {
		// Parse the JSON body from the request
		const { weight, date } = await request.json();

		// Validate that weight is a number
		if (typeof weight !== 'number' || isNaN(weight)) {
			return json({ error: 'Weight must be a valid number' }, { status: 400 });
		}

		// Validate that date is provided
		if (!date) {
			return json({ error: 'Date is required' }, { status: 400 });
		}

		// Add the weight to the database
		const result = addWeight(weight, date);

		// Return success response
		return json({ success: true, ...result });
	} catch (error) {
		console.error('Error adding weight:', error);
		return json({ error: 'Failed to add weight' }, { status: 500 });
	}
}

// Handle PUT requests - update the weight of an entry
export async function PUT({ request }) {
	try {
		// Parse the JSON body from the request
		const { id, weight } = await request.json();

		// Validate that id is a number
		if (typeof id !== 'number' || isNaN(id)) {
			return json({ error: 'ID must be a valid number' }, { status: 400 });
		}

		// Validate that weight is a number
		if (typeof weight !== 'number' || isNaN(weight)) {
			return json({ error: 'Weight must be a valid number' }, { status: 400 });
		}

		// Update the weight in the database
		const result = updateWeight(id, weight);

		if (result.changes === 0) {
			return json({ error: 'Entry not found' }, { status: 404 });
		}

		// Return success response
		return json({ success: true });
	} catch (error) {
		console.error('Error updating weight:', error);
		return json({ error: 'Failed to update weight' }, { status: 500 });
	}
}

// Handle DELETE requests - delete an entry or all entries
export async function DELETE({ request }) {
	try {
		// Parse the JSON body from the request
		const { id, deleteAll } = await request.json();

		// If deleteAll is true, delete all entries
		if (deleteAll === true) {
			const result = deleteAllWeights();
			return json({ success: true, deleted: result.changes });
		}

		// Otherwise, delete a single entry by ID
		// Validate that id is a number
		if (typeof id !== 'number' || isNaN(id)) {
			return json({ error: 'ID must be a valid number' }, { status: 400 });
		}

		// Delete the entry from the database
		const result = deleteWeight(id);

		if (result.changes === 0) {
			return json({ error: 'Entry not found' }, { status: 404 });
		}

		// Return success response
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting weight:', error);
		return json({ error: 'Failed to delete weight' }, { status: 500 });
	}
}

