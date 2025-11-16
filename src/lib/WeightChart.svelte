<script>
	// Chart component to display weight data over time
	// Uses Chart.js directly for visualization

	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	// Register Chart.js components
	Chart.register(...registerables);

	// Props: data is an array of weight entries from the database
	export let data = [];

	// Reference to the canvas element and chart instance
	let canvas;
	let chartInstance = null;

	// Function to create or update the chart
	function updateChart() {
		if (!canvas) return;

		// Destroy existing chart if it exists
		if (chartInstance) {
			chartInstance.destroy();
		}

		// Prepare data for the chart
		const labels = data.map(entry => {
			// Format date for display (convert YYYY-MM-DD to a more readable format)
			const date = new Date(entry.date);
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		});

		const weights = data.map(entry => entry.weight);

		// Create the chart
		chartInstance = new Chart(canvas, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Weight (kg)',
						data: weights,
						backgroundColor: 'rgba(26, 35, 126, 0.2)', // Dark blue with transparency
						borderColor: 'rgba(26, 35, 126, 0.8)', // Dark blue border
						borderWidth: 2,
						tension: 0.4, // Makes the line smooth
						fill: true
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							color: '#1a237e' // Dark blue text
						}
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: 'rgba(26, 35, 126, 0.9)',
						titleColor: '#fff',
						bodyColor: '#fff',
						borderColor: '#1a237e',
						borderWidth: 1
					}
				},
				scales: {
					y: {
						beginAtZero: false, // Don't start at 0, better for weight tracking
						title: {
							display: true,
							text: 'Weight (kg)',
							color: '#1a237e' // Dark blue
						},
						ticks: {
							color: '#3949ab' // Medium blue for ticks
						},
						grid: {
							color: 'rgba(26, 35, 126, 0.1)' // Light blue grid lines
						}
					},
					x: {
						title: {
							display: true,
							text: 'Date',
							color: '#1a237e' // Dark blue
						},
						ticks: {
							color: '#3949ab' // Medium blue for ticks
						},
						grid: {
							color: 'rgba(26, 35, 126, 0.1)' // Light blue grid lines
						}
					}
				}
			}
		});
	}

	// Update chart when data changes
	$: if (data && data.length > 0 && canvas) {
		updateChart();
	}

	// Create chart when component mounts
	onMount(() => {
		if (data && data.length > 0) {
			updateChart();
		}
	});

	// Clean up chart when component is destroyed
	onDestroy(() => {
		if (chartInstance) {
			chartInstance.destroy();
		}
	});
</script>

<!-- Chart container with canvas element -->
<div class="chart-wrapper">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-wrapper {
		height: 400px;
		position: relative;
	}
</style>
