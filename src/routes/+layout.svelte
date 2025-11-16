<script>
	// Root layout component
	// This wraps all pages and applies global styles
	import '../app.css';
</script>

<main>
	<slot />
</main>

<style>
	main {
		min-height: 100vh;
	}
</style>

