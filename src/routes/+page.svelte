<script lang="ts">
	import MapBox from '$lib/components/MapBox/MapBox.svelte';
	import {
		findBreweriesWithinXMiles,
		groupBreweriesByFootrace
	} from '$lib/data/findBreweriesNearUser';
	import { env } from '$env/dynamic/public';
	import Search from '$lib/components/Search.svelte';
	import { onMount } from 'svelte';

	let position = { latitude: 39.7392, longitude: -104.9903 };
	let distance = 1;
	let breweries = null;
	let clusteredBreweries = null;
	let breweryMarkers = [];
	let address = null;

	function reset() {
		breweries = null;
		clusteredBreweries = null;
		address = null;
		distance = 1;
		position = { latitude: 39.7392, longitude: -104.9903 };
		breweryMarkers = [];
	}

	async function requestBreweries() {
		try {
			const newBreweries = await findBreweriesWithinXMiles({
				userLat: position.latitude,
				userLng: position.longitude,
				x: distance
			});

			if (newBreweries.length === 0) {
				breweries = [];
			} else {
				breweries = newBreweries;
			}
		} catch (error) {
			console.error(error);
			breweries = [];
		}
	}

	async function handleDistanceChange(e) {
		distance = e.target.value;
		e.preventDefault();
		await requestBreweries();
	}

	async function geocodeAddress(address) {
		const apiKey = env.PUBLIC_MAPBOX_TOKEN;
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
			address
		)}.json?access_token=${apiKey}&limit=1`;
		const response = await fetch(url);
		const data = await response.json();
		if (data.features && data.features.length > 0) {
			const [longitude, latitude] = data.features[0].center;
			return { latitude, longitude };
		} else {
			throw new Error('Geocoding error: Address not found');
		}
	}

	async function handleSearch(e) {
		if (e.detail) {
			console.log(e.detail);
			address = e.detail;
			position = await geocodeAddress(address);
		} else {
			// if we don't have an address, reset everything
			reset();
		}
		await requestBreweries();
	}

	onMount(requestBreweries);

	$: if (address) {
		requestBreweries();
		document.title = `Brewery runs near ${address} | Beer Run`;
	} else {
		document.title = `Brewery runs near you | Beer Run`;
	}
	$: clusteredBreweries = breweries && breweries.length > 0
		? groupBreweriesByFootrace({
				userLat: position.latitude,
				userLng: position.longitude,
				breweries
		  })
		: null;
</script>

<div class="flex flex-1 md:gap-1 lg:gap-2">
	<div class="w-full lg:flex mb-2">
		<Search on:search={handleSearch} />
	</div>
</div>

<div class="form-control">
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
</div>

<div class="flex justify-evenly my-4">
	{#if clusteredBreweries}
		{#each Object.entries(clusteredBreweries) as [race, breweries]}
			<div class="flex flex-col w-1/2">
				<h2 class="card-title">{race}</h2>
				{#each breweries as brewery}
					<li>{brewery.name}</li>
				{/each}
			</div>
		{/each}
	{/if}
</div>

<MapBox center={[position.longitude, position.latitude]} bind:breweries />
