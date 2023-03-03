<script lang="ts">
	import MapBox from '$lib/components/MapBox/MapBox.svelte';
	import { onMount } from 'svelte';
	import MapSkeleton from '$lib/components/Skeleton/MapSkeleton.svelte';
	import {
		findBreweriesWithinXMiles,
		groupBreweriesByFootrace
	} from '$lib/data/findBreweriesNearUser';

	let position = null;
	let distance = 1;
	let breweries = null;
	let clusteredBreweries = null;
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
					clusteredBreweries = groupBreweriesByFootrace({
						userLat: position.latitude,
						userLng: position.longitude,
						breweries
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
		handleFormSubmit(e);
	}

	async function handleFormSubmit(e) {
		e.preventDefault();
		try {
			breweries = await findBreweriesWithinXMiles({
				userLat: position.latitude,
				userLng: position.longitude,
				x: distance
			});
			clusteredBreweries = groupBreweriesByFootrace({
				userLat: position.latitude,
				userLng: position.longitude,
				breweries
			});
		} catch (error) {
			console.error(error);
			breweries = null;
		}
		// Trigger a re-render by updating the component's state
		$: breweries;
	}
</script>

{#if position && breweries}
	<form>
		<label class="label">Distance from you (miles)</label>
		<input
			type="range"
			min="1"
			max="5"
			value={distance}
			class="range"
			step="1"
			on:input={handleDistanceChange}
		/>
		<div class="w-full flex justify-between text-xs px-2">
			<span>1</span>
			<span>2</span>
			<span>3</span>
			<span>4</span>
			<span>5</span>
		</div>
	</form>

	<div class="flex justify-evenly my-4">
		{#each Object.entries(clusteredBreweries) as [race, breweries]}
			<div class="card w-96 bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">{race}</h2>
					{#each breweries as brewery}
						<li>{brewery.name}</li>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!--	<MapBox initialView={[position.latitude, position.longitude]} bind:markerLocations={breweryMarkers} />-->
	<MapBox center={[position.longitude, position.latitude]} bind:breweries />
{:else}
	<MapSkeleton />
{/if}
