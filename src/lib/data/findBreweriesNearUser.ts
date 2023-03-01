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

// This uses the 'haversine' formula to calculate the distance between two points
// https://en.wikipedia.org/wiki/Haversine_formula
function getDistanceFromLatLonInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 3959; // Radius of the earth in miles
	const dLat = deg2rad(lat2-lat1);
	const dLon = deg2rad(lon2-lon1);
	const a =
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	 // Distance in miles
	return R * c;
}

const deg2rad = (deg: number) => deg * (Math.PI / 180);