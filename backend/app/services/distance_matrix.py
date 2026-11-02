import math
import logging
from typing import List, Tuple, Dict, Any, Optional
import requests

logger = logging.getLogger(__name__)

# Radius of Earth in kilometers
EARTH_RADIUS_KM = 6371.0

# Fallback average urban speed in km/h for straight-line estimate
AVERAGE_CITY_SPEED_KMH = 35.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in kilometers.
    """
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance = EARTH_RADIUS_KM * c
    return round(distance, 3)

def haversine_duration_minutes(distance_km: float) -> float:
    """
    Estimate travel time in minutes based on average urban speed.
    """
    hours = distance_km / AVERAGE_CITY_SPEED_KMH
    return round(hours * 60.0, 1)

def compute_haversine_matrices(locations: List[Tuple[float, float]]) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Computes NxN distance and duration matrices using Haversine formula.
    """
    n = len(locations)
    distance_matrix = [[0.0] * n for _ in range(n)]
    duration_matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i != j:
                dist = haversine_distance(locations[i][0], locations[i][1], locations[j][0], locations[j][1])
                dur = haversine_duration_minutes(dist)
                distance_matrix[i][j] = dist
                duration_matrix[i][j] = dur

    return distance_matrix, duration_matrix

class DistanceService:
    def __init__(self, osrm_base_url: str = "https://router.project-osrm.org"):
        self.osrm_base_url = osrm_base_url.rstrip("/")

    def get_distance_and_duration_matrix(
        self,
        locations: List[Tuple[float, float]],
        use_road_network: bool = True
    ) -> Dict[str, Any]:
        """
        locations: List of (lat, lon) coordinates
        Returns:
            {
                "distance_matrix": List[List[float]], # in km
                "duration_matrix": List[List[float]], # in minutes
                "source": "ROAD_OSRM" | "STRAIGHT_LINE_HAVERSINE"
            }
        """
        n = len(locations)
        if n == 0:
            return {
                "distance_matrix": [],
                "duration_matrix": [],
                "source": "NONE"
            }
        if n == 1:
            return {
                "distance_matrix": [[0.0]],
                "duration_matrix": [[0.0]],
                "source": "STRAIGHT_LINE_HAVERSINE"
            }

        if not use_road_network:
            dist_mat, dur_mat = compute_haversine_matrices(locations)
            return {
                "distance_matrix": dist_mat,
                "duration_matrix": dur_mat,
                "source": "STRAIGHT_LINE_HAVERSINE"
            }

        try:
            # OSRM expects coordinates as {longitude},{latitude} separated by semicolons
            coords_str = ";".join([f"{lon},{lat}" for lat, lon in locations])
            url = f"{self.osrm_base_url}/table/v1/driving/{coords_str}?annotations=distance,duration"
            
            resp = requests.get(url, timeout=4.0)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok":
                    raw_distances = data.get("distances", []) # in meters
                    raw_durations = data.get("durations", []) # in seconds
                    
                    # Convert to km and minutes
                    distance_matrix = []
                    for row in raw_distances:
                        distance_matrix.append([round((d or 0.0) / 1000.0, 3) for d in row])
                    
                    duration_matrix = []
                    for row in raw_durations:
                        duration_matrix.append([round((t or 0.0) / 60.0, 1) for t in row])

                    return {
                        "distance_matrix": distance_matrix,
                        "duration_matrix": duration_matrix,
                        "source": "ROAD_OSRM"
                    }
        except Exception as e:
            logger.warning(f"OSRM Table service failed or timed out: {e}. Falling back to Haversine.")

        # Fallback to straight-line Haversine
        dist_mat, dur_mat = compute_haversine_matrices(locations)
        return {
            "distance_matrix": dist_mat,
            "duration_matrix": dur_mat,
            "source": "STRAIGHT_LINE_HAVERSINE"
        }

    def get_route_geometry(
        self,
        ordered_locations: List[Tuple[float, float]]
    ) -> Dict[str, Any]:
        """
        Retrieves real road route geometry (GeoJSON) from OSRM for ordered coordinates.
        Falls back to straight lines if unavailable.
        """
        if len(ordered_locations) < 2:
            return {
                "type": "LineString",
                "coordinates": [[lon, lat] for lat, lon in ordered_locations]
            }

        try:
            coords_str = ";".join([f"{lon},{lat}" for lat, lon in ordered_locations])
            url = f"{self.osrm_base_url}/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
            resp = requests.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    return data["routes"][0]["geometry"]
        except Exception as e:
            logger.warning(f"OSRM Route geometry failed: {e}. Falling back to straight lines.")

        return {
            "type": "LineString",
            "coordinates": [[lon, lat] for lat, lon in ordered_locations]
        }
