<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import Typeahead from 'svelte-typeahead';
	import { env } from '$env/dynamic/public';
	import { getOS } from '$lib/utils';

	const dispatch = createEventDispatcher();
	let addressData;
	let seachboxEl;

	let os;
	onMount(() => {
		os = getOS();
	});

	async function search(query) {
		try {
			const apiKey = env.PUBLIC_MAPBOX_TOKEN;
			const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
				query
			)}.json?access_token=${apiKey}&autocomplete=true&limit=10&country=us`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`An error occurred: ${response.status}`);
			}
			const data = await response.json();
			addressData = data.features.map((feature) => {
				return {
					name: feature.place_name,
					latitude: feature.center[1],
					longitude: feature.center[0],
					href: `/${encodeURIComponent(feature.place_name)}`
				};
			});
			return addressData;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	function handleKeydown(e) {
		if ((e.keyCode === 75 && e.metaKey) || (e.keyCode === 75 && e.ctrlKey)) {
			e.preventDefault();
			seachboxEl.querySelector('input[type=search]').focus();
			dispatch('focus');
		}
	}

	function onSelect(event) {
		dispatch('search', event.detail.selected);
	}

	function onClear(event) {
		dispatch('search', null);
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class={`searchbox relative mx-3 w-full`} bind:this={seachboxEl}>
	<Typeahead
		focusAfterSelect
		placeholder={'🔎 Input Address'}
		limit={8}
		label="Search"
		hideLabel
		data={addressData}
		extract={(item) => item.name}
		on:select={onSelect}
		on:clear={onClear}
		let:index
		on:input={(event) => search(event.target.value)}
	>
		<div class="py-1 text-sm">
			{addressData[index].name}
		</div>
	</Typeahead>
	<div class={`pointer-events-none absolute right-8 top-2 gap-1 opacity-50 hidden lg:flex`}>
		{#if ['macos'].includes(os)}
			<kbd class="kbd kbd-sm">⌘</kbd>
			<kbd class="kbd kbd-sm">K</kbd>
		{:else if ['windows', 'linux'].includes(os)}
			<kbd class="kbd kbd-sm">ctrl</kbd>
			<kbd class="kbd kbd-sm">K</kbd>
		{/if}
	</div>
</label>

<style global>
</style>
