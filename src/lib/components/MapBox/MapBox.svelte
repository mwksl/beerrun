<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
	import mapboxgl, { LngLatLike, Marker } from 'mapbox-gl';
	import { env } from '$env/dynamic/public';

	export let center: LngLatLike = [0, 0];
	export let breweries;

	let mapElement: HTMLElement;
	let map: mapboxgl.Map;
	let accessToken = env.PUBLIC_MAPBOX_TOKEN;
	let mapMarkers: Marker[] = [];

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
			zoom: 13
		});

		updateMarkers(breweries);
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

	// This is called when the markers prop changes
	$: updateMarkers(breweries);

	$: center && map && map.setCenter(center);
</script>

<div class="h-1/2 w-full" bind:this={mapElement} />
