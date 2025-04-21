// utils/graph.js
function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  const queue = [];

  for (let node in graph) {
    distances[node] = Infinity;
  }

  distances[start] = 0;
  queue.push({ node: start, dist: 0 });

  while (queue.length) {
    queue.sort((a, b) => a.dist - b.dist);
    const { node } = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);

    const neighbors = graph[node] || [];
    for (let { neighbor, weight } of neighbors) {
      const newDist = distances[node] + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        queue.push({ node: neighbor, dist: newDist });
      }
    }
  }

  return distances;
}

module.exports = { dijkstra };
