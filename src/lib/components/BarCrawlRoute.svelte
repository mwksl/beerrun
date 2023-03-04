<script lang="ts">
	export let clusteredBreweries: any;
</script>

<div class="flex flex-wrap">
  {#each clusteredBreweries as brewery, i}
    <article class="prose">
      <h3>{brewery.name}</h3>
    </article>
    {#if i !== clusteredBreweries.length - 1}
      <span class="mx-2 md:mx-4 text-2xl">&rarr;</span>
    {/if}
  {:else}
    <span class="block text-2xl">&rarr;</span>
  {/each}
</div>