<script lang="ts">
	import MapBox from '$lib/components/MapBox/MapBox.svelte';
	import MapSkeleton from '$lib/components/Skeleton/MapSkeleton.svelte';
	import {
		findBreweriesWithinXMiles,
		groupBreweriesByFootrace
	} from '$lib/data/findBreweriesNearUser';
  import { env } from '$env/dynamic/public';


  let position = null;
	let distance = 1;
	let breweries = null;
	let clusteredBreweries = null;
	let breweryMarkers = [];
  let address = null;

	async function getLocation() {
    position = null;
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

  async function geocodeAddress(address) {
      const apiKey = env.PUBLIC_MAPBOX_TOKEN;
      console.log(address, 'address')
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;
          return { latitude, longitude };
      } else {
          throw new Error('Geocoding error: Address not found');
      }
  }


	function handleDistanceChange(e) {
		distance = e.target.value;
		handleFormSubmit(e);
	}

  async function handleFormSubmit(e) {
      e.preventDefault();
      try {
          const { latitude, longitude } = await geocodeAddress(address);
          position = { latitude, longitude };
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
  }

	$: position

</script>

<div class="input-group">
	<input type="text" class="input" placeholder="Input an address" bind:value={address} />
	<button class="btn btn-square" on:click={handleFormSubmit}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
	</button>
	<button class="btn btn-square" on:click={getLocation}>
		<svg
			class="h-6 w-6"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			stroke="currentColor"
		>
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<g fill="currentColor" fill-rule="nonzero">
					<path
						d="M12,2 C12.3796958,2 12.693491,2.28215388 12.7431534,2.64822944 L12.75,2.75 L12.7490685,4.53770881 L12.7490685,4.53770881 C16.292814,4.88757432 19.1124257,7.70718602 19.4632195,11.2525316 L19.5,11.25 L21.25,11.25 C21.6642136,11.25 22,11.5857864 22,12 C22,12.3796958 21.7178461,12.693491 21.3517706,12.7431534 L21.25,12.75 L19.4616558,12.7490368 L19.4616558,12.7490368 C19.1124257,16.292814 16.292814,19.1124257 12.7474684,19.4632195 L12.75,19.5 L12.75,21.25 C12.75,21.6642136 12.4142136,22 12,22 C11.6203042,22 11.306509,21.7178461 11.2568466,21.3517706 L11.25,21.25 L11.2509632,19.4616558 L11.2509632,19.4616558 C7.70718602,19.1124257 4.88757432,16.292814 4.53678051,12.7474684 L4.5,12.75 L2.75,12.75 C2.33578644,12.75 2,12.4142136 2,12 C2,11.6203042 2.28215388,11.306509 2.64822944,11.2568466 L2.75,11.25 L4.53770881,11.2509315 L4.53770881,11.2509315 C4.88757432,7.70718602 7.70718602,4.88757432 11.2525316,4.53678051 L11.25,4.5 L11.25,2.75 C11.25,2.33578644 11.5857864,2 12,2 Z M12,6 C8.6862915,6 6,8.6862915 6,12 C6,15.3137085 8.6862915,18 12,18 C15.3137085,18 18,15.3137085 18,12 C18,8.6862915 15.3137085,6 12,6 Z M12,8 C14.209139,8 16,9.790861 16,12 C16,14.209139 14.209139,16 12,16 C9.790861,16 8,14.209139 8,12 C8,9.790861 9.790861,8 12,8 Z"
					/>
				</g>
			</g>
		</svg>
	</button>
</div>

{#if position && breweries}
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
		{#each Object.entries(clusteredBreweries) as [race, breweries]}
			<div class="flex flex-col w-1/2">
				<h2 class="card-title">{race}</h2>
				{#each breweries as brewery}
					<li>{brewery.name}</li>
				{/each}
			</div>
		{/each}
	</div>

	<!--	<MapBox initialView={[position.latitude, position.longitude]} bind:markerLocations={breweryMarkers} />-->
	<MapBox center={[position.longitude, position.latitude]} bind:breweries />
{:else if position && !breweries}
	None found
{:else if !position}
	<MapSkeleton />
{/if}
