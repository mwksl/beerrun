<script lang="ts">
	import MapBox from '$lib/components/MapBox/MapBox.svelte';
	import { onMount } from 'svelte';
	import MapSkeleton from '$lib/components/Skeleton/MapSkeleton.svelte';
	import { findBreweriesWithinXMiles } from '$lib/data/findBreweriesNearUser';

	let position = null;
	let distance = 1;
	let breweries = null;
	let breweryMarkers = [];

	async function getLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (pos) => {
					position = pos.coords;
					breweries = await findBreweriesWithinXMiles({
						userLat: position.latitude,
						userLng: position.longitude,
						x: distance
					});
					breweryMarkers = breweries.map((brewery) => [brewery.latitude, brewery.longitude]);
				},
				(err) => {
					console.error(err.message);
				}
			);
		} else {
			console.error('Geolocation is not supported by this browser');
		}
	}

	onMount(getLocation);

	function handleDistanceChange(e) {
		distance = e.target.value;
	}

	async function handleFormSubmit(e) {
		e.preventDefault();
		try {
			breweries = await findBreweriesWithinXMiles({
				userLat: position.latitude,
				userLng: position.longitude,
				x: distance
			});
		} catch (error) {
			console.error(error);
			breweries = null;
		}
		// Trigger a re-render by updating the component's state
		$: breweries;
	}

	// create an array of markers for the breweries where the format is [[lat, lng], [lat, lng]]
	$: breweryMarkers = breweries
		? breweries.map((brewery) => [brewery.latitude, brewery.longitude])
		: null;
</script>

{#if position && breweryMarkers}
	<p>Your location: {position.latitude}, {position.longitude}</p>
	<form on:submit={handleFormSubmit}>
		<label>Distance (miles)</label>
		<input type="number" name="distance" value={distance} on:change={handleDistanceChange} />
		<button type="submit">Find breweries</button>
	</form>

	{#each breweries as brewery}
		<p>{brewery.name}</p>
	{/each}

	<MapBox initialView={[position.latitude, position.longitude]} bind:markerLocations={breweryMarkers} />
{:else}
	<MapSkeleton />
{/if}
