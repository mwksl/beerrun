export async function findBreweriesWithinXMiles({
	userLat,
	userLng,
	x
}: {
	userLat: number;
	userLng: number;
	x: number;
}) {
	// Step 2: Find all breweries within x miles of the user's location
	const response = await fetch(
		`https://api.openbrewerydb.org/breweries?by_dist=${userLat},${userLng}&per_page=50`
	);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const breweries = await response.json();

	// Step 3: Calculate the distance between the user and each brewery
	return breweries.filter((brewery: any) => {
		const distance = getDistanceFromLatLonInMiles(
			userLat,
			userLng,
			brewery.latitude,
			brewery.longitude
		);

		return distance <= x;
	});
}

export function groupBreweriesByFootrace({
	userLat,
	userLng,
	breweries
}: {
	userLat: number;
	userLng: number;
	breweries: any[];
}) {
	const footraceDistances = {
		'5k': [],
		'10k': []
	};

	// Keep track of visited breweries
	const visitedBreweries = new Set();

	// Sort breweries by distance to user's location
	breweries.sort((a, b) => {
		const distA = getDistanceFromLatLonInMiles(userLat, userLng, a.latitude, a.longitude);
		const distB = getDistanceFromLatLonInMiles(userLat, userLng, b.latitude, b.longitude);
		return distA - distB;
	});

	let totalDistance = 0;

	// Start with the closest brewery and add to the 5k list
	footraceDistances['5k'].push(breweries[0]);
	visitedBreweries.add(breweries[0]);

	// Iterate over remaining breweries and add to appropriate list
	for (let i = 1; i < breweries.length; i++) {
		const brewery = breweries[i];

		if (visitedBreweries.has(brewery)) {
			continue;
		}

		const distance = getDistanceFromLatLonInMiles(
			breweries[i - 1].latitude,
			breweries[i - 1].longitude,
			brewery.latitude,
			brewery.longitude
		);

		totalDistance += distance;

		if (totalDistance <= 6.21371) {
			// Add brewery to 5k list
			footraceDistances['5k'].push(brewery);
			visitedBreweries.add(brewery);
		} else if (totalDistance <= 12.4274) {
			// Add brewery to 10k list
			footraceDistances['10k'].push(brewery);
			visitedBreweries.add(brewery);
		} else {
			// Stop iterating over breweries
			break;
		}
	}

	return footraceDistances;
}

// This uses the 'haversine' formula to calculate the distance between two points
// https://en.wikipedia.org/wiki/Haversine_formula
function getDistanceFromLatLonInMiles(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 3959; // Radius of the earth in miles
	const dLat = deg2rad(lat2 - lat1);
	const dLon = deg2rad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	// Distance in miles
	return R * c;
}

const deg2rad = (deg: number) => deg * (Math.PI / 180);
