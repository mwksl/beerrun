<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import mapboxgl, { LngLatLike, Marker } from 'mapbox-gl';
	import { env } from '$env/dynamic/public';

	export let center: LngLatLike = [0, 0];
	export let breweries;
	export let clusteredBreweries;
	export let barCrawl;

	let mapElement: HTMLElement;
	let map: mapboxgl.Map;
	let accessToken = env.PUBLIC_MAPBOX_TOKEN;
	let mapMarkers: Marker[] = [];
	let route;

	const fetchOptimization = async (coordinates) => {
		const response = await fetch(
			`https://api.mapbox.com/optimized-trips/v1/mapbox/walking/${coordinates}?&overview=full&steps=true&geometries=geojson&source=first&access_token=${accessToken}`
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
		getRaceRoute(clusteredBreweries, barCrawl);
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

	async function getRaceRoute(clusteredBreweries, barCrawl) {
		if (!center || !clusteredBreweries) return;

		// Get directions between breweries
		let breweryCoordinates = '';
		let start = '';

		if (barCrawl) {
			// add all the 5km breweries to the breweryCoordinates string
			breweryCoordinates += clusteredBreweries['5k']
				.map((brewery) => `${brewery?.longitude},${brewery?.latitude}`)
				.join(';');

			// we want to end where we started, so add the first brewery to the end of the string
			breweryCoordinates += `;${clusteredBreweries['5k'][0]?.longitude},${clusteredBreweries['5k'][0]?.latitude}`;
		} else {
			start = `${center[0]},${center[1]};`;
			for (const distance in clusteredBreweries) {
				if (breweryCoordinates) {
					breweryCoordinates += ';'; // add semicolon if breweryCoordinates already contains coordinates
				}
				breweryCoordinates += clusteredBreweries[distance]
					.map((brewery) => `${brewery?.longitude},${brewery?.latitude}`)
					.join(';');
			}
		}
		// strip off the last semicolon
		breweryCoordinates = breweryCoordinates.slice(0, -1);
		let directions;
		try {
			if (barCrawl) {
				directions = await fetchOptimization(breweryCoordinates);
			} else {
				directions = await fetchDirections(`${start}${breweryCoordinates}`);
			}
		} catch (error) {
			console.log(error);
			return;
		}

		let routeCoordinates;
		// Extract the coordinates from the directions response
		if (!barCrawl) {
			routeCoordinates = directions.routes[0]?.geometry.coordinates;
		} else {
			// if barCrawl, we need to get the coordinates from the waypoints
			routeCoordinates = directions?.trips[0]?.geometry.coordinates;
		}

		if (!routeCoordinates) return;

		// Route arrows must be removed first
		const arrowLayer = map.getLayer('routearrows');
		const routeLayer = map.getLayer('route');

		if (typeof arrowLayer !== 'undefined') {
			map.removeLayer('routearrows');
		}

		if (typeof routeLayer !== 'undefined') {
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

		map.addLayer(
			{
				id: 'routearrows',
				type: 'symbol',
				source: 'route',
				layout: {
					'symbol-placement': 'line',
					'text-field': '▶',
					'text-size': ['interpolate', ['linear'], ['zoom'], 12, 24, 22, 60],
					'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 12, 30, 22, 160],
					'text-keep-upright': false
				},
				paint: {
					'text-color': '#3887be',
					'text-halo-color': 'hsl(55, 11%, 96%)',
					'text-halo-width': 3
				}
			},
			'waterway-label'
		);
	}
	// This is called when the markers prop changes
	$: updateMarkers(breweries);

	$: center && map && map.setCenter(center);

	$: if (clusteredBreweries) getRaceRoute(clusteredBreweries, barCrawl);
</script>

<div class="h-1/2 w-full" bind:this={mapElement} />
