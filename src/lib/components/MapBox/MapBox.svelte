<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import mapboxgl, { LngLatLike, Marker } from 'mapbox-gl';
	import { env } from '$env/dynamic/public';

	export let center: LngLatLike = [0, 0];
	export let breweries;
	export let clusteredBreweries;

	let mapElement: HTMLElement;
	let map: mapboxgl.Map;
	let accessToken = env.PUBLIC_MAPBOX_TOKEN;
	let mapMarkers: Marker[] = [];
	let route;

	const fetchOptimization = async (coordinates) => {
		const response = await fetch(
			`https://api.mapbox.com/optimized-trips/v1/mapbox/walking/${coordinates}?access_token=${accessToken}`
		);
		return await response.json();
	};

	const fetchDirections = async (coordinates) => {
		// log how many coordinates are being passed to the API
		console.log(coordinates.split(';').length);
		const response = await fetch(
			`https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?access_token=${accessToken}&geometries=geojson&steps=true&overview=full`
		);
		return await response.json();
	};

	onMount(() => {
		createMap();
	});

	onDestroy(() => {
		map.remove();
	});

	function createMap() {
		map = new mapboxgl.Map({
			accessToken,
			container: mapElement,
			style: 'mapbox://styles/mapbox/streets-v11',
			center,
			zoom: 12
		});

		updateMarkers(breweries);
		getRaceRoute(clusteredBreweries);
	}

	function updateMarkers(breweries) {
		if (!breweries) return;
		// Remove existing markers
		mapMarkers.forEach((marker) => marker.remove());
		mapMarkers = [];

		// Add new markers
		breweries.forEach((brewery) => {
			const newMarker = new Marker().setLngLat([brewery?.longitude, brewery?.latitude]).addTo(map);

			// Create popup
			const popup = new mapboxgl.Popup().setHTML(`<p> ${brewery?.name} </p>`);
			newMarker.setPopup(popup);

			mapMarkers.push(newMarker);
		});
	}

	async function getRaceRoute(clusteredBreweries) {
		if (!center || !clusteredBreweries) return;

		// Get directions between breweries
		let breweryCoordinates = '';
		for (const distance in clusteredBreweries) {
			if (breweryCoordinates) {
				breweryCoordinates += ';'; // add semicolon if breweryCoordinates already contains coordinates
			}
			breweryCoordinates += clusteredBreweries[distance]
				.map((brewery) => `${brewery?.longitude},${brewery?.latitude}`)
				.join(';');
		}
		// strip off the last semicolon
		breweryCoordinates = breweryCoordinates.slice(0, -1);
		let directions;
		try {
			directions = await fetchDirections(`${center[0]},${center[1]};${breweryCoordinates}`);
		} catch (error) {
			console.log(error);
			return;
		}

		// Extract the coordinates from the directions response
		const routeCoordinates = directions.routes[0]?.geometry.coordinates;
		if (!routeCoordinates) return; // return if routeCoordinates is undefined

		// Check if the route layer already exists on the map and remove it if it does
		if (map.getLayer('route')) {
			map.removeLayer('route');
			map.removeSource('route');
		}

		// Create a GeoJSON object for the route
		const routeGeoJSON = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates: routeCoordinates
			}
		};

		// Add the route to the map
		map.addLayer({
			id: 'route',
			type: 'line',
			source: {
				type: 'geojson',
				data: routeGeoJSON
			},
			paint: {
				'line-color': '#3887be',
				'line-width': 5
			}
		} as mapboxgl.LineLayer);
	}
	// This is called when the markers prop changes
	$: updateMarkers(breweries);

	$: center && map && map.setCenter(center);

	$: if (clusteredBreweries) getRaceRoute(clusteredBreweries);
</script>

<div class="h-1/2 w-full" bind:this={mapElement} />
