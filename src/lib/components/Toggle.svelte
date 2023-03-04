<script>
    export let barCrawl
	function toggleActive() {
		barCrawl = !barCrawl;
	}
</script>

<div class="form-control">
	<label class="label cursor-pointer">
		<span class="label-text">Bar Crawl?</span>
		<input type="checkbox" class="toggle" on:change|preventDefault|stopPropagation={toggleActive} checked={barCrawl} />
	</label>
</div>
