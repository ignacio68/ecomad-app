import { fetch } from 'expo/fetch';
import { LngLat } from '../types/mapData';
import { MAPBOX_DOWNLOADS_TOKEN } from '../constants/map';

export const getRoute = async (origin: LngLat, destination: LngLat) => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${MAPBOX_DOWNLOADS_TOKEN}`
  );
  const json = await response.json();
  const data = json.routes[0];
  const route = data.geometry;
  const geojson = {
    'type': 'Feature',
    'properties': {},
    'geometry':  route
  }

  return geojson;
};