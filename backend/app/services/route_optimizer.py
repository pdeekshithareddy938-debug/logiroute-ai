from typing import List, Dict, Any, Tuple, Optional
import copy
from app.services.distance_matrix import DistanceService

class RouteOptimizationResultInternal:
    def __init__(
        self,
        original_route_indices: List[int],
        optimized_route_indices: List[int],
        baseline_distance_km: float,
        baseline_duration_min: float,
        optimized_distance_km: float,
        optimized_duration_min: float,
        distance_saved_km: float,
        distance_saved_percent: float,
        time_saved_min: float,
        algorithm_used: str,
        routing_source: str,
        step_metrics: List[Dict[str, float]],
        geometry_geojson: Optional[Dict[str, Any]] = None
    ):
        self.original_route_indices = original_route_indices
        self.optimized_route_indices = optimized_route_indices
        self.baseline_distance_km = baseline_distance_km
        self.baseline_duration_min = baseline_duration_min
        self.optimized_distance_km = optimized_distance_km
        self.optimized_duration_min = optimized_duration_min
        self.distance_saved_km = distance_saved_km
        self.distance_saved_percent = distance_saved_percent
        self.time_saved_min = time_saved_min
        self.algorithm_used = algorithm_used
        self.routing_source = routing_source
        self.step_metrics = step_metrics
        self.geometry_geojson = geometry_geojson

class BaseRouteOptimizer:
    """Base class to enable future AI / Metaheuristic / ML extensions."""
    def optimize(
        self,
        distance_matrix: List[List[float]],
        duration_matrix: List[List[float]]
    ) -> List[int]:
        raise NotImplementedError

class NearestNeighbor2OptOptimizer(BaseRouteOptimizer):
    """
    Combines Nearest Neighbor constructive heuristic with 2-Opt local search improvement.
    Guarantees depot (index 0) remains fixed at start and end.
    """

    def compute_tour_distance(self, tour: List[int], dist_matrix: List[List[float]]) -> float:
        total = 0.0
        for i in range(len(tour) - 1):
            total += dist_matrix[tour[i]][tour[i + 1]]
        return round(total, 3)

    def compute_tour_duration(self, tour: List[int], dur_matrix: List[List[float]]) -> float:
        total = 0.0
        for i in range(len(tour) - 1):
            total += dur_matrix[tour[i]][tour[i + 1]]
        return round(total, 1)

    def nearest_neighbor_tour(self, dist_matrix: List[List[float]]) -> List[int]:
        n = len(dist_matrix)
        if n <= 1:
            return [0]
        if n == 2:
            return [0, 1, 0]

        unvisited = set(range(1, n))
        current = 0
        tour = [0]

        while unvisited:
            next_node = min(unvisited, key=lambda node: dist_matrix[current][node])
            tour.append(next_node)
            unvisited.remove(next_node)
            current = next_node

        # Return to depot
        tour.append(0)
        return tour

    def two_opt(self, tour: List[int], dist_matrix: List[List[float]], max_iterations: int = 500) -> List[int]:
        """
        2-Opt heuristic swaps non-adjacent edges to untangle crossed routes.
        Tour must start and end at depot (index 0).
        """
        best_tour = list(tour)
        best_dist = self.compute_tour_distance(best_tour, dist_matrix)
        improved = True
        iterations = 0
        n = len(best_tour)

        # Swappable range is indices 1 to n-2 (leaving start 0 and end 0 fixed)
        if n <= 4:
            # 0, 1, 0 (3 nodes) or 0, 1, 2, 0 (4 nodes) cannot be further 2-opt improved
            return best_tour

        while improved and iterations < max_iterations:
            improved = False
            iterations += 1

            for i in range(1, n - 2):
                for j in range(i + 1, n - 1):
                    # Current edges: (i-1 -> i) and (j -> j+1)
                    # Candidate edges: (i-1 -> j) and (i -> j+1)
                    d_current = dist_matrix[best_tour[i - 1]][best_tour[i]] + dist_matrix[best_tour[j]][best_tour[j + 1]]
                    d_candidate = dist_matrix[best_tour[i - 1]][best_tour[j]] + dist_matrix[best_tour[i]][best_tour[j + 1]]

                    if d_candidate < d_current - 1e-4:
                        # Reverse segment between i and j
                        best_tour[i:j + 1] = reversed(best_tour[i:j + 1])
                        best_dist = self.compute_tour_distance(best_tour, dist_matrix)
                        improved = True
                        break
                if improved:
                    break

        return best_tour

    def optimize_route(
        self,
        locations: List[Tuple[float, float]],
        distance_service: DistanceService,
        use_road_network: bool = True
    ) -> RouteOptimizationResultInternal:
        """
        locations[0] is Depot/Warehouse.
        locations[1..N] are delivery destinations.
        """
        n = len(locations)
        if n == 0:
            raise ValueError("Locations list cannot be empty.")

        # Compute distance and duration matrices
        matrix_result = distance_service.get_distance_and_duration_matrix(locations, use_road_network=use_road_network)
        dist_matrix = matrix_result["distance_matrix"]
        dur_matrix = matrix_result["duration_matrix"]
        routing_source = matrix_result["source"]

        # Case: Only warehouse or 1 delivery
        if n == 1:
            return RouteOptimizationResultInternal(
                original_route_indices=[0],
                optimized_route_indices=[0],
                baseline_distance_km=0.0,
                baseline_duration_min=0.0,
                optimized_distance_km=0.0,
                optimized_duration_min=0.0,
                distance_saved_km=0.0,
                distance_saved_percent=0.0,
                time_saved_min=0.0,
                algorithm_used="Single Point (Depot Only)",
                routing_source=routing_source,
                step_metrics=[{"distance_km": 0.0, "duration_min": 0.0, "cum_dist": 0.0, "cum_dur": 0.0}]
            )

        # Baseline: Original user order (0 -> 1 -> 2 -> ... -> N -> 0)
        original_tour = [0] + list(range(1, n)) + [0]
        orig_dist = self.compute_tour_distance(original_tour, dist_matrix)
        orig_dur = self.compute_tour_duration(original_tour, dur_matrix)

        # Step 1 Baseline Construction: Nearest Neighbor
        nn_tour = self.nearest_neighbor_tour(dist_matrix)
        nn_dist = self.compute_tour_distance(nn_tour, dist_matrix)

        # Compare original order vs nearest neighbor: choose whichever is baseline
        # (Standard requirement: compare original input order with optimized route)
        baseline_tour = original_tour
        baseline_dist = orig_dist
        baseline_dur = orig_dur

        # Step 2 Heuristic Improvement: 2-Opt
        optimized_tour = self.two_opt(nn_tour, dist_matrix)
        opt_dist = self.compute_tour_distance(optimized_tour, dist_matrix)
        opt_dur = self.compute_tour_duration(optimized_tour, dur_matrix)

        # In case original tour was somehow shorter (e.g. user already provided optimal)
        if baseline_dist < opt_dist:
            optimized_tour = baseline_tour
            opt_dist = baseline_dist
            opt_dur = baseline_dur

        saved_km = max(0.0, round(baseline_dist - opt_dist, 3))
        saved_percent = round((saved_km / baseline_dist * 100.0), 2) if baseline_dist > 0 else 0.0
        time_saved = max(0.0, round(baseline_dur - opt_dur, 1))

        # Calculate per-leg step metrics
        step_metrics = []
        cum_dist = 0.0
        cum_dur = 0.0
        for i in range(len(optimized_tour)):
            if i == 0:
                step_metrics.append({
                    "distance_km": 0.0,
                    "duration_min": 0.0,
                    "cum_dist": 0.0,
                    "cum_dur": 0.0
                })
            else:
                prev_node = optimized_tour[i - 1]
                curr_node = optimized_tour[i]
                d = dist_matrix[prev_node][curr_node]
                t = dur_matrix[prev_node][curr_node]
                cum_dist = round(cum_dist + d, 3)
                cum_dur = round(cum_dur + t, 1)
                step_metrics.append({
                    "distance_km": d,
                    "duration_min": t,
                    "cum_dist": cum_dist,
                    "cum_dur": cum_dur
                })

        # Fetch route geometry for map visualization
        ordered_coords = [locations[idx] for idx in optimized_tour]
        geometry = distance_service.get_route_geometry(ordered_coords)

        return RouteOptimizationResultInternal(
            original_route_indices=original_tour,
            optimized_route_indices=optimized_tour,
            baseline_distance_km=baseline_dist,
            baseline_duration_min=baseline_dur,
            optimized_distance_km=opt_dist,
            optimized_duration_min=opt_dur,
            distance_saved_km=saved_km,
            distance_saved_percent=saved_percent,
            time_saved_min=time_saved,
            algorithm_used="Nearest Neighbor + 2-Opt Heuristic",
            routing_source=routing_source,
            step_metrics=step_metrics,
            geometry_geojson=geometry
        )
