// Database setup and connection
// This file handles all database operations using SQLite

import Database from 'better-sqlite3';
import { dev } from '$app/environment';

// Create or connect to the SQLite database file
// In development, we'll use a local file. In production, you might want to use a different path
const dbPath = dev ? 'weight_log.db' : 'weight_log.db';
const db = new Database(dbPath);

// Enable foreign keys (good practice, though we don't use them here)
db.pragma('foreign_keys = ON');

// Create the weights table if it doesn't exist
// This table stores each weight entry with a date
db.exec(`
	CREATE TABLE IF NOT EXISTS weights (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		weight REAL NOT NULL,
		date TEXT NOT NULL UNIQUE,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP
	)
`);

// Function to add a new weight entry
// Takes weight (number) and date (string in YYYY-MM-DD format)
export function addWeight(weight, date) {
	const stmt = db.prepare('INSERT INTO weights (weight, date) VALUES (?, ?)');
	try {
		const result = stmt.run(weight, date);
		return { success: true, id: result.lastInsertRowid };
	} catch (error) {
		// If date already exists, update instead
		if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			const updateStmt = db.prepare('UPDATE weights SET weight = ? WHERE date = ?');
			updateStmt.run(weight, date);
			return { success: true, updated: true };
		}
		throw error;
	}
}

// Function to get all weight entries, ordered by date
// Returns an array of objects with id, weight, and date
export function getAllWeights() {
	const stmt = db.prepare('SELECT id, weight, date FROM weights ORDER BY date ASC');
	return stmt.all();
}

// Function to get the latest weight entry
export function getLatestWeight() {
	const stmt = db.prepare('SELECT * FROM weights ORDER BY date DESC LIMIT 1');
	return stmt.get();
}

// Function to update the weight of an entry by ID
// Takes id (number) and new weight (number)
export function updateWeight(id, weight) {
	const stmt = db.prepare('UPDATE weights SET weight = ? WHERE id = ?');
	const result = stmt.run(weight, id);
	return { success: true, changes: result.changes };
}

// Function to delete a weight entry by ID
// Takes id (number)
export function deleteWeight(id) {
	const stmt = db.prepare('DELETE FROM weights WHERE id = ?');
	const result = stmt.run(id);
	return { success: true, changes: result.changes };
}

// Function to delete all weight entries
export function deleteAllWeights() {
	const stmt = db.prepare('DELETE FROM weights');
	const result = stmt.run();
	return { success: true, changes: result.changes };
}

// Export the database connection (in case we need it elsewhere)
export { db };

